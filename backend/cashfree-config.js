import { Cashfree } from "cashfree-pg";

// Initialize Cashfree SDK with credentials from environment
const clientId = process.env.CASHFREE_CLIENT_ID;
const clientSecret = process.env.CASHFREE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error("❌ Missing Cashfree credentials: CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET must be set");
}

const cashfree = new Cashfree({
  apiKey: clientSecret,
});

export const cashfreeConfig = {
  clientId,
  clientSecret,
  environment: "SANDBOX", // Use SANDBOX for testing, change to PRODUCTION for live
  apiVersion: "2023-08-01",
  currency: "INR",
  returnUrl: process.env.CASHFREE_RETURN_URL,
  notifyUrl: process.env.CASHFREE_NOTIFY_URL,
};

// Initialize Cashfree SDK
export async function initializeCashfree() {
  try {
    if (!clientId || !clientSecret) {
      throw new Error("Cashfree credentials are not configured");
    }
    console.log("✅ Cashfree SDK initialized with APP ID:", clientId.substring(0, 10) + "...");
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
    const {
      orderId,
      amount,
      customerName,
      customerEmail,
      customerPhone,
      bookingId,
      baseUrl,
    } = orderData;

    // Prepare Cashfree order payload
    const orderPayload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: cashfreeConfig.currency,
      customer_details: {
        customer_id: bookingId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: baseUrl ? `${baseUrl}/payment-callback` : "/payment-callback",
        notify_url: baseUrl ? `${baseUrl}/api/payment/webhook` : "/api/payment/webhook",
      },
    };

    // Create order with Cashfree API
    const response = await cashfree.PGCreateOrder(orderPayload);

    console.log(`✅ Cashfree order created: ${orderId}, Amount: ₹${amount}`);
    console.log(`📱 Payment session ID: ${response.payment_session_id}`);

    return {
      orderId,
      paymentSessionId: response.payment_session_id,
      paymentLink: response.payment_link,
      status: "created",
      environment: cashfreeConfig.environment,
      orderDetails: response,
    };
  } catch (error) {
    console.error("❌ Failed to create Cashfree payment order:", error.message);
    throw error;
  }
}

// Verify payment with Cashfree
export async function verifyCashfreePayment(orderId) {
  try {
    const response = await cashfree.PGOrderFetchPayments(orderId);

    // Check if any successful payment exists
    const successfulPayments = response.payments.filter(
      (payment) => payment.payment_status === "SUCCESS"
    );

    if (successfulPayments.length > 0) {
      console.log(`✅ Payment verified for order ${orderId}`);
      return {
        success: true,
        orderId,
        paymentStatus: "paid",
        paymentDetails: successfulPayments[0],
      };
    } else {
      console.log(`❌ No successful payments found for order ${orderId}`);
      return {
        success: false,
        orderId,
        paymentStatus: "pending",
        payments: response.payments,
      };
    }
  } catch (error) {
    console.error("❌ Failed to verify Cashfree payment:", error.message);
    throw error;
  }
}

// Get payment status for an order
export async function getCashfreePaymentStatus(orderId) {
  try {
    const response = await cashfree.PGOrderFetchPayments(orderId);
    return response;
  } catch (error) {
    console.error("❌ Failed to fetch payment status:", error.message);
    throw error;
  }
}

// Refund a payment
export async function refundCashfreePayment(orderId, refundAmount, refundNote) {
  try {
    const refundPayload = {
      refund_id: `${orderId}-refund-${Date.now()}`,
      refund_amount: refundAmount,
      refund_note: refundNote,
    };

    const response = await cashfree.PGCreateRefund(orderId, refundPayload);
    console.log(`✅ Refund initiated for order ${orderId}`);
    return response;
  } catch (error) {
    console.error("❌ Failed to initiate refund:", error.message);
    throw error;
  }
}

export default cashfree;
