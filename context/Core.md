1. Core Utilities & Developer Ergonomics (Auth, Errors, Roles)
   The foundation for validation, session handling, and role-based access.

actions/auth/getUserSession.actions.ts

zod/validation/error.ts

zod/validation/form.ts

lib/auth/roles.ts

types/store/products.types.ts

2. Caching & Search Strategy (MongoDB Atlas & Next.js Caching)
   How we optimize queries, prevent memory leaks, and perform fuzzy searching.

actions/common/searchProducts.action.ts

actions/common/searchStore.action.ts

actions/cache/product.cache.ts

actions/cache/user.cache.ts

3. Cart Working Logic
   Handling user carts, subsidy limits, atom states, and DB syncing.

actions/customer/ProductAndStore/Cart.Action.ts

db/models/customer/cart.model.ts

atoms/customer/CartAtom.ts

components/customer/products/ProgressBarCart.tsx

components/customer/products/CartActionBtns.tsx

4. Order Working Logic & Stripe Checkout
   Point-in-time pricing locks, Stripe sessions, and webhook processing.

actions/customer/ProductAndStore/Order.Action.ts

db/models/customer/Orders.Model.ts

app/api/stripe/checkout/route.ts

app/api/stripe/webhook/route.ts

lib/stripe.ts

5. Store Payout Pipeline
   Cron jobs, manual triggers, calculating owed balances, and PDF receipts.

app/api/cron/generate-payouts/route.ts

app/api/admin/trigger-payouts/route.ts

db/models/admin/storePayouts.model.ts

actions/admin/reciept/saveStorePayout.ts

actions/admin/reciept/generateReciept.ts

6. Complex Form Submission & UI Pipeline
   The multi-step process for handling images, Zod validation, and duplicate checking safely.

components/store/products/ProductForm.tsx

actions/store/products/addProducts.ts

zod/schemas/store/addProductsValidation.ts

app/imagekit/route.ts
