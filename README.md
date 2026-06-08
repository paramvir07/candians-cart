# Canadian's Cart

Canadian's Cart is a grocery shopping web application designed to help users save money on essential grocery items through eligible subsidies, promotional savings, and a Gift Wallet system.

Users can browse groceries, choose a selected store, add items to their cart, view available subsidies, and either place an order through the app or shop directly in store. The platform is currently focused on British Columbia, Canada, with Abbotsford, BC as a supported location.

## Live Website

Visit the live website:

https://www.canadianscart.ca/

## Overview

Canadian's Cart helps make grocery shopping more affordable by offering subsidies on selected daily-use grocery products. Users can earn subsidies by purchasing regular items and apply those subsidies toward eligible subsidized items such as milk, fruits, vegetables, and other selected grocery essentials.

The app supports both online cart preparation and in-store checkout. Customers can build their cart in the app, use available subsidies, and pay at the selected store. They may also shop directly in store, where an authorized cashier can scan their ID and apply eligible Gift Wallet subsidies at checkout.

## Key Features

* User account registration and email verification
* City and store selection during signup
* Selected store-based shopping experience
* Grocery cart management
* Regular and subsidized item support
* Subsidy calculation based on eligible order value
* Gift Wallet for storing unused subsidies
* Pay-at-store checkout flow
* In-store cashier-assisted checkout
* Privacy Policy and Terms & Conditions pages
* Support for promotions, rewards, and eligibility-based savings
* Responsive website navigation with pages such as:

  * Home
  * How It Works
  * Calculator
  * Budget Packs
  * About Us
  * Contact Us
  * Careers
  * Privacy Policy
  * Terms & Conditions

## How Canadian's Cart Works

1. A user creates an account.
2. The user selects their city and preferred store.
3. The user browses regular and subsidized grocery items.
4. When the cart reaches at least C$21 of regular items before tax, eligible subsidies may appear.
5. The user can apply subsidies to subsidized items in the same order.
6. Unused subsidies can be saved in the user's Gift Wallet.
7. The user can tap **Pay at Store** and complete payment at the selected store.
8. Alternatively, the user can shop directly in store and have a cashier scan their ID at checkout.

## Subsidies and Gift Wallet

Subsidies are promotional savings that help users reduce the cost of eligible subsidized grocery items.

Users may receive subsidies when their order contains at least C$21 of regular items before tax. The more regular items a user buys, the more subsidies may become available.

Subsidies can be:

* Used immediately on eligible subsidized items
* Saved in the Gift Wallet for future orders
* Applied only at the user's selected store
* Used only on items marked as subsidized

Subsidies are not cash and may be subject to eligibility rules, limits, or expiration where permitted by law.

## Example FAQ

### How do I save money with Canadian's Cart?

You save money by using subsidies on subsidized items. When your order has at least C$21 of regular items before tax, the app shows subsidies you may be able to use. These subsidies can reduce the cost of eligible items in your cart.

### How do I earn subsidies?

You earn subsidies when your order has at least C$21 of regular items before tax. Regular items are products that are not already subsidized.

### Can I order from the app or shop in store?

Yes. You can add items to your cart in the app and tap **Pay at Store**, or you can shop directly at your selected store. At checkout, the cashier can scan your ID and process the order.

### What happens if I do not use my subsidies?

Unused subsidies remain saved in your Gift Wallet and can be used later on eligible subsidized items.

## Legal and Privacy

Canadian's Cart operates in British Columbia, Canada.

The website includes:

* Privacy Policy
* Terms & Conditions

The Privacy Policy explains how personal information is collected, used, stored, disclosed, and protected. Canadian's Cart does not sell personal information and only shares limited data where needed to operate the service, process payments, support checkout, or comply with legal obligations.

The Terms & Conditions govern access to and use of the app, website, selected store rules, subsidies, Gift Wallet, payments, in-store checkout, acceptable use, and service limitations.

## Third-Party Services

Canadian's Cart may rely on third-party platforms and service providers, including:

* Stripe for payment processing
* MongoDB for database storage
* Resend for email services
* GoDaddy for domain-related services
* Vercel for deployment and hosting
* ImageKit for image optimization and delivery
* Better Auth for authentication

Each third-party service may be governed by its own terms, policies, and security practices.

## Project Status

Canadian's Cart is under active development. Current and planned improvements include:

* Enhanced user dashboard
* Improved store and cashier workflows
* More detailed Gift Wallet activity tracking
* Better accessibility and mobile responsiveness
* Expanded support for additional locations and stores
* Improved checkout experience
* Better account and order management

## Future Enhancements

* Admin dashboard for store and product management
* Cashier dashboard improvements
* Advanced subsidy rules engine
* Order history and receipts
* Email notifications for account and order updates
* More detailed analytics for subsidy usage
* CI/CD workflow improvements

## Local Development

Clone the repository:

```bash
git clone <repository-url>
```

Navigate into the project folder:

```bash
cd canadians-cart
```

Install dependencies:

```bash
npm install
```

Create an environment file:

```bash
cp .env.example .env
```

Start the development server:

```bash
npm run dev
```

Open the app in your browser:

```bash
http://localhost:3000
```

## Environment Variables

The project may require environment variables for services such as authentication, database access, email, payments, image hosting, and deployment.

Example:

```env
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
```

Update these values based on your actual local and production configuration.

## Contact

For questions about Canadian's Cart, contact:

[info@canadianscart.ca](mailto:info@canadianscart.ca)