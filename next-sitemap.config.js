/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://www.canadianscart.ca',
  generateRobotsTxt: true, // Automate robots.txt generation
  
  // Exclude private/dashboard routes from the sitemap
  exclude: [
    '/admin',
    '/admin/*',
    '/cashier',
    '/cashier/*',
    '/store',
    '/store/*',
    '/customer/wallet',
    '/customer/wallet/*',
    '/customer/profile',
    '/customer/profile/*',
    '/customer/orders',
    '/customer/orders/*'
  ],

  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/cashier/',
          '/store/',
          '/customer/wallet/',
          '/customer/profile/',
          '/customer/orders/',
        ],
      },
    ],
  },
}