export function getReferralUrl(code: string): string {
  return `https://www.canadianscart.ca/?referralCode=${encodeURIComponent(code)}&heard=referred_by_customer`;
}

export function getReferralShareMessage(code: string): string {
  const url = getReferralUrl(code);

  return `🛒 Canadian's Cart (CC) is now live at Sunfarm Produce, Abbotsford, BC!

🎁 Join & you could win a $500 grocery gift card

✨ Perks:
• Free groceries like milk, atta & ghee on sign-up offers
• Exclusive launch rewards for new members

📲 Use referral code: ${code}

📍 Location: 3670 Town Line Rd #108, Abbotsford, BC

🔗 Sign up here: ${url}

━━━━━━━━━━━━━━
📢 Follow us for updates
📸 Instagram: https://www.instagram.com/canadianscart
📘 Facebook: https://www.facebook.com/canadianscart
🎥 TikTok: https://vt.tiktok.com/ZSxjaYrjL/`;
}


export function getReferralShareMessageTwilio(code: string): string {
  const url = getReferralUrl(code);
  return `🛒 You're invited to Canadian's Cart! 
  Here's your SignUp Link: ${url}`;
}