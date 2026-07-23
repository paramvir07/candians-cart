# Canadian's Cart — Monorepo Build Debugging Notes

A record of the Vercel deploy failure chain, what caused each one, how it was
fixed, and how to avoid this class of problem going forward.

---

## 1. The intended dependency "waterfall"

A pnpm workspace monorepo only works cleanly if dependencies flow **one
direction** — like water flowing downhill. Every package should only depend on
packages "above" it in this order:

```
types   (foundation — depends on nothing workspace-internal)
  ↓
db      (depends on: types)
  ↓
lib     (depends on: types, db)
  ↓
ui      (depends on: types, db, lib)
  ↓
actions (depends on: types, db, lib, ui)
  ↓
apps    (depend on: everything)
```

If any package depends on something "below" it in this chain, you get a
**cycle** — package A needs package B, and package B needs package A, so
there's no valid order to build them in. This was the root cause of two
separate errors in this session (Section 4 and Section 5).

**Rule of thumb going forward:** before adding a new
`"@canadian-cart/X": "workspace:*"` dependency to a package, check that `X` is
higher up this list than the package you're adding it to. If it isn't, that's
a sign the code being imported is in the wrong package (see Section 7).

---

## 2. Issue: Vercel using `npm` instead of `pnpm`

**Symptom:**

```
Error: No Next.js version detected. Make sure your package.json has "next"...
```

despite `next` clearly being in `package.json`.

**Cause:** Vercel's install log showed `npm install --prefix=../..` running,
even though the repo is a pnpm workspace (`pnpm-workspace.yaml` present,
dependencies use the `workspace:*` protocol which npm doesn't understand at
all). Vercel had fallen back to npm instead of detecting pnpm.

**Fix:** Added a `packageManager` field to the root `package.json` so Vercel's
Corepack integration knows exactly which package manager and version to use:

```json
"packageManager": "pnpm@9.15.0"
```

---

## 3. Issue: pnpm version too old

**Symptom:**

```
ERR_PNPM_UNSUPPORTED_ENGINE
Expected version: >=8.0.0
Got: 6.35.1
```

**Cause:** Once Vercel was actually running pnpm, it was still using its own
stale default pnpm binary (6.35.1), not respecting the `packageManager` field
yet, because Corepack wasn't enabled on the build image.

**Fix:** Added an environment variable in Vercel → Project Settings →
Environment Variables:

```
ENABLE_EXPERIMENTAL_COREPACK = 1
```

This makes Vercel run `corepack enable` before install, which is what actually
reads the `packageManager` field and swaps in the correct pnpm version.

---

## 4. Issue: stray `package-lock.json` conflicting with `pnpm-lock.yaml`

**Symptom:**

```
Error: Detected package manager "npm" does not match intended corepack
defined package manager "pnpm". Change your lockfile or
"package.json#packageManager" value to match.
```

**Cause:** An old `package-lock.json` (494 KB) was still sitting at the repo
root — left over from an earlier accidental `npm install` — right alongside
`pnpm-lock.yaml`. Corepack refused to proceed because two conflicting lockfiles
existed.

**Fix:**

```powershell
git rm package-lock.json
```

Then added `package-lock.json` and `yarn.lock` to `.gitignore` so this can't
silently happen again.

---

## 5. Issue: Circular workspace dependency — `lib` ↔ `ui` / `actions`

**Symptom (from `pnpm install`):**

```
WARN There are cyclic workspace dependencies:
/packages/actions, /packages/lib, /packages/ui
```

**Cause:** `packages/lib/src/auth/auth.tsx` (the better-auth server config)
directly imported:

- `VerifyEmail` from `@canadian-cart/ui`
- `revalidateCustomerCache` from `@canadian-cart/actions`

But `ui` and `actions` both legitimately need to depend on `lib` for other
things — so `lib` importing from them created a loop: `lib → actions → lib`,
and `lib → ui → actions → lib`.

**Investigation:** Looked at what `VerifyEmail` and `revalidateCustomerCache`
actually depended on internally. Neither one touched anything else from `ui`
or `actions` — `VerifyEmail` only used `@react-email/components`,
`revalidateCustomerCache` only used `next/cache`. They were just **sitting in
the wrong package**.

**Fix:** Moved both of them physically into `lib`:

- `packages/ui/src/EmailTemplates/VerifyEmail.tsx` → `packages/lib/src/emails/VerifyEmail.tsx`
- The `revalidateCustomerCache` function body → `packages/lib/src/cache/revalidateCustomerCache.ts`

`packages/actions/src/cache/user.cache.ts` now just re-exports it (see Section
8 for a complication that caused) so every existing import elsewhere in the
codebase (`@canadian-cart/actions/cache/user.cache`) kept working unchanged.

Removed `@canadian-cart/ui` and `@canadian-cart/actions` from
`packages/lib/package.json` — `lib` doesn't need either anymore.

Added `@react-email/components` as a real dependency of `lib` (it wasn't
there before, since `lib` never rendered email JSX directly until now).

---

## 6. Issue: Circular workspace dependency — `types` ↔ `db`

**Symptom (from `turbo run build`):**

```
WARNING Circular package dependency detected: @canadian-cart/db, @canadian-cart/types
Cyclic dependency detected:
  @canadian-cart/types#build, @canadian-cart/db#build
```

**Cause:** `packages/types` should be the foundation layer with **zero**
workspace dependencies. But several files in `types` were importing model
interfaces (`ICustomer`, `IStore`, `IReferralCode`, etc.) directly from
`@canadian-cart/db`'s mongoose model files — i.e. `types → db`. Meanwhile `db`
already (correctly) depends on `types` for other shared types — so
`db → types` and `types → db` both existed at once.

**How we found every occurrence** (PowerShell, no `grep` needed):

```powershell
Get-ChildItem -Path .\packages\types\src -Recurse -File |
    Select-String -Pattern "@canadian-cart/db"
```

This returned 7 files.

**Fix pattern applied to each one** — for every `I*` interface that was
_defined_ in a `db` model file and merely _imported_ into `types`:

1. Cut the `interface` definition out of the `db` model file.
2. Paste it into the matching file in `packages/types/src/...`.
3. In the `db` model file, add `import { IX } from "@canadian-cart/types/..."`
   instead.

Applied to: `customer.ts`/`customer.model.ts`, `referralCode.ts`,
`Orders.Model.ts` (+ `analytics.ts`), `WalletPayment.model.ts`, plus the
remaining `subsidyList`, `walletTopUp`, and `store` pairs.

**Final step:** removed the leftover dependency declaration from
`packages/types/package.json`:

```diff
  "dependencies": {
    "zod": "^4.4.3",
-   "mongoose": "^9.4.1",
-   "@canadian-cart/db": "workspace:*"
+   "mongoose": "^9.4.1"
  },
```

This is the part that's easy to miss — **fixing the imports in code doesn't
remove the dependency from `package.json` automatically.** Turbo reads
`package.json` declarations to build its graph, not just your actual import
statements, so both have to be cleaned up.

Then ran `pnpm install` again to relink after the `package.json` change.

---

## 7. Smaller build errors hit along the way

These weren't cycles, just fallout from the restructuring — listed briefly
since the fixes were mostly mechanical:

- **JSX in a `.ts` file:** A file named `auth.ts` contained
  `<VerifyEmail {...props} />` — TypeScript only parses JSX syntax in `.tsx`
  files. Renamed to `.ts` → `.tsx`.
- **`tailwindcss` resolution failure in Turbopack:** `@react-email/tailwind`
  (used inside `packages/ui`) needs `tailwindcss` as a real, resolvable
  dependency — but it was listed under `devDependencies` in `ui`'s
  `package.json`. In a strict pnpm workspace, devDependencies aren't exposed
  to consumers importing into that package from outside. Moved `tailwindcss`
  from `devDependencies` to `dependencies` in `packages/ui/package.json`.
- **`"use server"` file with a bare re-export:** Next.js requires every export
  in a file marked `"use server"` to be an async function declaration. A line
  like `export { x } from "./somewhere"` doesn't satisfy that check even
  though `x` itself is async — it broke the _entire_ file, which cascaded
  into "export doesn't exist" errors everywhere else that file's other
  functions were imported. Fixed by wrapping it:

  ```ts
  import { revalidateCustomerCache as libRevalidateCustomerCache } from "@canadian-cart/lib/cache/revalidateCustomerCache";

  export async function revalidateCustomerCache() {
    return libRevalidateCustomerCache();
  }
  ```

---

## 8. Commands used to diagnose and verify

| Command                                                                                                 | What it's for                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm -v`                                                                                               | Check locally installed pnpm version, to match in `packageManager` field                                                                                                                                                                   |
| `Get-ChildItem -Recurse -Filter package-lock.json`                                                      | Find stray lockfiles anywhere in the repo                                                                                                                                                                                                  |
| `Get-ChildItem -Path .\packages\types\src -Recurse -File \| Select-String -Pattern "@canadian-cart/db"` | Find every file in one package importing from another (PowerShell equivalent of `grep -rn`)                                                                                                                                                |
| `pnpm -r --filter "./apps/*" --filter "./packages/*" exec tsc --noEmit`                                 | **Fastest feedback loop.** Type-checks every workspace package/app in one pass without producing output files. Use this first when hunting import errors — much quicker than a full build.                                                 |
| `pnpm exec turbo run build`                                                                             | Full build across the whole monorepo using Turbo's dependency graph. Also the step that actually detects and reports circular _package.json_ dependencies (tsc won't catch this — cycles are a graph-level problem, not a type-level one). |
| `pnpm exec turbo run build --continue`                                                                  | Same as above, but doesn't stop at the first failing package — useful when you expect multiple packages to have errors and want the full list in one run instead of fixing one at a time.                                                  |
| `pnpm install`                                                                                          | Re-run any time a `package.json` dependency list changes (adding, removing, or moving a `workspace:*` entry) — needed to relink `node_modules`, not just for new packages.                                                                 |

**Recommended order when something breaks in this monorepo:**

1. `pnpm -r ... exec tsc --noEmit` — cheapest check, catches most import/type
   errors fast.
2. `pnpm exec turbo run build --continue` — catches everything else
   (bundler-level issues, "use server" rules, circular _package.json_
   dependencies) and gives you the full picture in one run.
3. Only then commit and push to let Vercel build — by that point it should
   just be confirming what you already verified locally.

---

## 9. How to avoid this in the future

- **New shared code goes in the lowest layer that makes sense**, per the
  waterfall in Section 1 — not wherever felt convenient at the time. Ask "does
  this piece of code need anything from `ui` or `actions`?" before dropping it
  in `lib`. If it doesn't, it probably belongs in `lib` or lower; if it does,
  it probably belongs in `actions` or an app.
- **`types` should never have workspace dependencies.** If you find yourself
  importing from `db`, `lib`, `ui`, or `actions` into a file under
  `packages/types/src`, that's the signal something's inverted — the
  interface/type itself should move into `types`, and the other package should
  import _from_ `types` instead.
- **Run `pnpm exec turbo run build` locally before pushing** to Vercel when
  you've touched more than one package in a single change — it's the only
  local command that actually catches circular _package.json_ dependencies the
  same way Vercel's build will.
- **After moving code between packages, check the moved-from package's
  `package.json`** — it's easy to fix every import in code and forget that the
  now-unnecessary `"@canadian-cart/X": "workspace:*"` line is still sitting in
  the dependency list, silently keeping the cycle alive from Turbo's point of
  view.
- **Keep `package-lock.json` and `yarn.lock` in `.gitignore`.** A stray npm
  lockfile committed by accident is what caused the Corepack conflict in
  Section 4 — this is an easy one to prevent outright.
- **Pin the package manager version explicitly** (`packageManager` field in
  root `package.json` + `ENABLE_EXPERIMENTAL_COREPACK=1` in Vercel) rather than
  relying on Vercel's default — this was the root cause of two of the four
  early build failures.
