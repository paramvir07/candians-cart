// src/lib/auth/roles.ts
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

export const statements = {
  ...defaultStatements,
} as const;

export const ac = createAccessControl(statements);

// IMPORTANT: provide ALL statement keys; don't pass {}
export const roles = {
  customer: ac.newRole({
    user: [],
    session: [],
  }),
  store: ac.newRole({
    user: [],
    session: [],
  }),
  cashier: ac.newRole({
    user: [],
    session: [],
  }),
  admin: ac.newRole({
    ...adminAc.statements, // admin gets admin permissions
  }),
} as const;
