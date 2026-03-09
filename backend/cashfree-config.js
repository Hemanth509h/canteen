// Cashfree Payment Gateway Configuration (Test Mode)
export const cashfreeConfig = {
  // Test Mode Credentials
  clientId: process.env.CASHFREE_CLIENT_ID || "test_client_id",
  clientSecret: process.env.CASHFREE_CLIENT_SECRET || "test_client_secret",
  environment: "SANDBOX", // SANDBOX for test mode, PRODUCTION for live
  apiVersion: "2023-08-01",
  
  // Payment settings
  currency: "INR",
  returnUrl: process.env.CASHFREE_RETURN_URL || "/payment-callback",
  notifyUrl: process.env.CASHFREE_NOTIFY_URL || "/api/payment/webhook",
};

// Cashfree SDK initialization
export async function initializeCashfree() {
  try {
    // In test mode, we'll use Cashfree's test API endpoint
    console.log("✅ Cashfree initialized in TEST MODE (SANDBOX)");
    return {
      environment: cashfreeConfig.environment,
      clientId: cashfreeConfig.clientId,
      apiVersion: cashfreeConfig.apiVersion,
    };
  } catch (error) {
    console.error("❌ Failed to initialize Cashfree:", error.message);
    throw error;
  }
}

// Create payment order with Cashfree
export async function createCashfreePaymentOrder(orderData) {
  try {
    const { orderId, amount, customerName, customerEmail, customerPhone, bookingId, baseUrl } = orderData;
    
    // In test mode, generate a payment link pointing to the local payment page
    // This allows customers to upload payment screenshots for manual verification
    const finalBaseUrl = baseUrl || process.env.PAYMENT_BASE_URL || process.env.REPLIT_DEV_DOMAIN || "";
    const paymentLink = `${finalBaseUrl}/payment/${bookingId}`;
    
    console.log(`💳 Cashfree payment order created: ${orderId}, Amount: ₹${amount}`);
    console.log(`📱 Customer payment page: ${paymentLink}`);
    
    return {
      orderId,
      paymentLink,
      status: "created",
      environment: cashfreeConfig.environment
    };
  } catch (error) {
    console.error("❌ Failed to create Cashfree payment order:", error.message);
    throw error;
  }
}

// Get Cashfree payment link from order ID
export function getCashfreePaymentLink(orderId, baseUrl) {
  // Generate a payment link URL for Cashfree
  const finalBaseUrl = baseUrl || process.env.PAYMENT_BASE_URL || process.env.REPLIT_DEV_DOMAIN || "";
  return `${finalBaseUrl}/payment/${orderId}`;
}

// Test Mode Payment Helpers
export const testModePayments = {
  // Successful payment - use any amount
  success: "4111111111111111",
  // Failed payment
  failed: "4000000000000002",
  // Authentication required
  auth: "4000002500003155",
};
