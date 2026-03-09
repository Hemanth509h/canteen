// WhatsApp Payment Link Service
// Supports multiple WhatsApp API providers (Twilio, Meta, etc.)

export const whatsappConfig = {
  provider: process.env.WHATSAPP_PROVIDER || "twilio", // "twilio" or "meta"
  
  // Twilio Configuration
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || "test_account_sid",
    authToken: process.env.TWILIO_AUTH_TOKEN || "test_auth_token",
    phoneNumber: process.env.TWILIO_WHATSAPP_NUMBER || "+1234567890",
  },
  
  // Meta WhatsApp Business API Configuration
  meta: {
    accessToken: process.env.META_WHATSAPP_TOKEN || "test_token",
    phoneNumberId: process.env.META_WHATSAPP_PHONE_ID || "test_phone_id",
    businessAccountId: process.env.META_WHATSAPP_BUSINESS_ID || "test_business_id",
  }
};

// Send payment link via WhatsApp
export async function sendPaymentLinkWhatsApp(phoneNumber, paymentLink, bookingDetails) {
  try {
    const { provider } = whatsappConfig;
    
    if (provider === "twilio") {
      return await sendViaTwilio(phoneNumber, paymentLink, bookingDetails);
    } else if (provider === "meta") {
      return await sendViaMeta(phoneNumber, paymentLink, bookingDetails);
    } else {
      throw new Error(`Unsupported WhatsApp provider: ${provider}`);
    }
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
    throw error;
  }
}

// Twilio WhatsApp Implementation
async function sendViaTwilio(phoneNumber, paymentLink, bookingDetails) {
  try {
    // In test mode, simulate Twilio API call
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const toNumber = cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`;
    
    const message = formatPaymentMessage(paymentLink, bookingDetails);
    
    console.log(`📱 [Twilio] Sending WhatsApp to ${toNumber}`);
    console.log(`Message: ${message}`);
    
    // In production, this would use: 
    // const twilio = require('twilio');
    // const client = twilio(accountSid, authToken);
    // const response = await client.messages.create({...})
    
    return {
      success: true,
      provider: "twilio",
      messageId: `twilio_${Date.now()}`,
      phone: toNumber,
      status: "sent",
      message: "WhatsApp message queued for delivery (TEST MODE)"
    };
  } catch (error) {
    throw new Error(`Twilio WhatsApp error: ${error.message}`);
  }
}

// Meta WhatsApp Business API Implementation
async function sendViaMeta(phoneNumber, paymentLink, bookingDetails) {
  try {
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const toNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    
    const message = formatPaymentMessage(paymentLink, bookingDetails);
    
    console.log(`📱 [Meta] Sending WhatsApp to ${toNumber}`);
    console.log(`Message: ${message}`);
    
    // In production, this would use:
    // const response = await fetch(`https://graph.instagram.com/v18.0/${phoneNumberId}/messages`, {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${accessToken}` },
    //   body: JSON.stringify({...})
    // })
    
    return {
      success: true,
      provider: "meta",
      messageId: `meta_${Date.now()}`,
      phone: toNumber,
      status: "sent",
      message: "WhatsApp message queued for delivery (TEST MODE)"
    };
  } catch (error) {
    throw new Error(`Meta WhatsApp error: ${error.message}`);
  }
}

// Format payment message for WhatsApp
function formatPaymentMessage(paymentLink, bookingDetails) {
  const { customerName, amount, eventDate, orderId } = bookingDetails;
  
  return `🍽️ *Payment Link for Your Catering Event*

Hello ${customerName || "Customer"},

Your payment link is ready! Please complete the payment to confirm your booking.

*Amount:* ₹${amount}
*Order ID:* ${orderId}
${eventDate ? `*Event Date:* ${new Date(eventDate).toLocaleDateString()}` : ""}

*Payment Link:* ${paymentLink}

Thank you for choosing us! 🙏

_This is an automated message from Catering Services_`;
}

// Validate WhatsApp phone number
export function validateWhatsAppPhone(phone) {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length >= 10 && cleaned.length <= 15;
}
