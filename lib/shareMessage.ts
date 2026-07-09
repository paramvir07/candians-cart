export function getReferralUrl(code: string): string {
  return `https://www.canadianscart.ca/customer/signup?referralCode=${encodeURIComponent(code)}&heard=refer`;
}

const websiteURL = 'https://canadianscart.ca'

export function getReferralShareMessage(code: string): string {
  const url = getReferralUrl(code);

  return `🛒 Candian's Cart (CC) is now live at Sunfarm Produce, Abbotsford, BC!

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


export function getReferralShareMessageTwilio(code: string,name:string): string {
  const url = getReferralUrl(code);
  return `${name} You're invited to Candian's Cart!🛒 ${url}`;
}

export function getReferralRequestMessage(name: string): string {
  return `${name} requested a referral invite. Review the request here: 🛒 ${websiteURL}/customer/referrals/requests`;
}