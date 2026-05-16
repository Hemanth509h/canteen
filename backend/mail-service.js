import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const defaultFrom = process.env.RESEND_FROM_EMAIL || "Catering Services <onboarding@resend.dev>";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date) {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function buildPaymentEmail(paymentLink, bookingDetails) {
  const {
    customerName,
    amount,
    paymentType,
    orderId,
    eventDate,
    companyName = "Catering Services",
  } = bookingDetails;
  const readablePaymentType = paymentType === "final" ? "final" : "advance";
  const formattedAmount = formatCurrency(amount);
  const formattedDate = formatDate(eventDate);
  const safeCustomerName = escapeHtml(customerName || "Customer");
  const safeCompanyName = escapeHtml(companyName);
  const safePaymentLink = escapeHtml(paymentLink);
  const safeOrderId = escapeHtml(orderId);
  const safeFormattedDate = formattedDate ? escapeHtml(formattedDate) : null;

  const subject = `${companyName}: ${readablePaymentType} payment link`;
  const text = [
    `Hello ${customerName || "Customer"},`,
    "",
    `Please complete your ${readablePaymentType} payment of ${formattedAmount} using this link:`,
    paymentLink,
    "",
    `Order ID: ${orderId}`,
    formattedDate ? `Event date: ${formattedDate}` : null,
    "",
    `Thank you for choosing ${companyName}.`,
  ].filter(Boolean).join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:560px;margin:0 auto">
      <h2 style="margin:0 0 16px">${readablePaymentType.charAt(0).toUpperCase() + readablePaymentType.slice(1)} payment link</h2>
      <p>Hello ${safeCustomerName},</p>
      <p>Please complete your ${readablePaymentType} payment to continue with your booking.</p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0">
        <p style="margin:0 0 8px"><strong>Amount:</strong> ${formattedAmount}</p>
        <p style="margin:0 0 8px"><strong>Order ID:</strong> ${safeOrderId}</p>
        ${safeFormattedDate ? `<p style="margin:0"><strong>Event date:</strong> ${safeFormattedDate}</p>` : ""}
      </div>
      <p>
        <a href="${safePaymentLink}" style="display:inline-block;background:#111827;color:white;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:700">
          Pay now
        </a>
      </p>
      <p style="font-size:13px;color:#6b7280">If the button does not work, copy and paste this link into your browser:</p>
      <p style="font-size:13px;word-break:break-all;color:#374151">${safePaymentLink}</p>
      <p>Thank you for choosing ${safeCompanyName}.</p>
    </div>
  `;

  return { subject, text, html };
}

export async function sendPaymentLinkEmail(to, paymentLink, bookingDetails) {
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const { subject, text, html } = buildPaymentEmail(paymentLink, bookingDetails);
  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || defaultFrom,
    to,
    subject,
    text,
    html,
  });

  if (error) {
    throw new Error(error.message || "Resend failed to send email");
  }

  return {
    success: true,
    provider: "resend",
    messageId: data?.id,
    to,
    status: "sent",
  };
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
