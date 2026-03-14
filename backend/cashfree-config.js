import { Cashfree } from "cashfree-pg";
import dotenv from "dotenv";

dotenv.config();

// Load credentials
const clientId = process.env.CASHFREE_APP_ID;
const clientSecret = process.env.CASHFREE_SECRET_KEY;

if (!clientId || !clientSecret) {
  console.warn("⚠️ Cashfree credentials not set. Payments will run in mock mode.");
}

// Initialize SDK
let cashfree;
try {
  cashfree = new Cashfree({
    appId: clientId,
    apiKey: clientSecret,
  });
} catch (error) {
  console.warn("⚠️ Cashfree SDK initialization issue, proceeding with partial support:", error.message);
  cashfree = null;
}

// Configuration
export const cashfreeConfig = {
  currency: "INR",
  returnUrl: process.env.CASHFREE_RETURN_URL,
  notifyUrl: process.env.CASHFREE_NOTIFY_URL,
};


// Initialize Cashfree
export async function initializeCashfree() {
  console.log("✅ Cashfree initialized");
}

/* ---------------- CREATE ORDER ---------------- */

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

    if (!cashfree) {
      console.warn("⚠️ Cashfree SDK not available, returning mock response");
      return {
        orderId,
        paymentSessionId: "mock_session_" + Date.now(),
        paymentLink: `${baseUrl}/payment/${orderId}`,
        status: "created",
      };
    }

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
        return_url: `${baseUrl}/payment-success?order_id={order_id}`,
        notify_url: cashfreeConfig.notifyUrl,
      },
    };

    const response = await cashfree.PGCreateOrder(orderPayload);

    if (!response.payment_session_id) {
      throw new Error("Payment session not created");
    }

    return {
      orderId,
      paymentSessionId: response.payment_session_id,
      paymentLink: response.payment_link,
      status: "created",
      orderDetails: response,
    };
  } catch (error) {
    console.error("❌ Order creation failed:", error.message);
    throw error;
  }
}

/* ---------------- VERIFY PAYMENT ---------------- */

export async function verifyCashfreePayment(orderId) {
  try {
    if (!cashfree) {
      console.warn("⚠️ Cashfree SDK not available, returning mock response");
      return {
        success: true,
        paymentStatus: "paid",
        paymentDetails: { order_id: orderId },
      };
    }

    const response = await cashfree.PGOrderFetchPayments(orderId);

    const successPayment = response.payments.find(
      (p) => p.payment_status === "SUCCESS"
    );

    if (successPayment) {
      return {
        success: true,
        paymentStatus: "paid",
        paymentDetails: successPayment,
      };
    }

    return {
      success: false,
      paymentStatus: "pending",
      payments: response.payments,
    };
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    throw error;
  }
}

/* ---------------- REFUND PAYMENT ---------------- */

export async function refundCashfreePayment(orderId, amount, note) {
  try {
    if (!cashfree) {
      console.warn("⚠️ Cashfree SDK not available, returning mock response");
      return {
        refund_id: `refund_${Date.now()}`,
        refund_amount: amount,
        status: "success",
      };
    }

    const refundPayload = {
      refund_id: `refund_${Date.now()}`,
      refund_amount: amount,
      refund_note: note,
    };

    const response = await cashfree.PGCreateRefund(orderId, refundPayload);

    return response;
  } catch (error) {
    console.error("❌ Refund failed:", error.message);
    throw error;
  }
}

export default cashfree;