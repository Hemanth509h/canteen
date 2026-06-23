import { Resend } from "resend";
import { readBrandingFile } from "./branding.js";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

function getBranding() {
  try {
    return readBrandingFile();
  } catch (e) {
    return { companyName: "Sai Caterers" };
  }
}

function getFullyQualifiedLogoUrl(linkUrl) {
  const brand = getBranding();
  let logoUrl = brand.logoUrl || "/Vaishnavi9logo.png";
  if (logoUrl.startsWith("http")) return logoUrl;

  const envBase = (
    process.env.APP_BASE_URL ||
    process.env.PAYMENT_BASE_URL ||
    process.env.FRONTEND_BASE_URL ||
    process.env.VITE_APP_BASE_URL ||
    ""
  ).trim().replace(/\/+$/, "");

  if (envBase) {
    return `${envBase}${logoUrl.startsWith("/") ? "" : "/"}${logoUrl}`;
  }

  if (linkUrl) {
    try {
      const parsed = new URL(linkUrl);
      return `${parsed.origin}${logoUrl.startsWith("/") ? "" : "/"}${logoUrl}`;
    } catch {
      // ignore
    }
  }

  return logoUrl;
}

function isValidEmailAddress(value) {
  if (!value) return false;
  const email = String(value).trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function formatFromAddress(displayName, emailAddress) {
  if (!isValidEmailAddress(emailAddress)) return null;
  const name = String(displayName || "").replace(/"/g, "").trim();
  return name ? `"${name}" <${emailAddress}>` : emailAddress;
}

function getDefaultFrom(companyName) {
  const name = companyName || getBranding().companyName || "Sai Caterers";
  const configured = (process.env.RESEND_FROM_EMAIL || "").trim();

  // Case 1: Already correctly formatted "Name <email@domain.com>"
  const matched = configured.match(/^(.*)<([^>]+)>$/);
  if (matched) {
    const displayName = matched[1].trim().replace(/^"|"$/g, "");
    const emailAddress = matched[2].trim();
    const formatted = formatFromAddress(displayName || name, emailAddress);
    if (formatted) return formatted;
  }
  
  // Case 2: Just an email address "email@domain.com"
  if (isValidEmailAddress(configured)) {
    const formatted = formatFromAddress(name, configured);
    if (formatted) return formatted;
  }

  const fallbackEmail =
    process.env.RESEND_FROM_EMAIL_FALLBACK ||
    "onboarding@resend.dev";

  const fallbackDisplayName = configured && !configured.includes("@") ? configured : name;
  const fallback = formatFromAddress(fallbackDisplayName, fallbackEmail);
  if (fallback) return fallback;

  // Case 3: Just a name or misconfigured - Force valid format
  return `"${name.replace(/"/g, "")}" <onboarding@resend.dev>`;
}

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
    companyName,
  } = bookingDetails;
  const currentBrand = companyName || getBranding().companyName;
  const readablePaymentType = paymentType === "final" ? "final" : "advance";
  const formattedAmount = formatCurrency(amount);
  const formattedDate = formatDate(eventDate);
  const safeCustomerName = customerName ? escapeHtml(customerName) : null;
  const safeCompanyName = escapeHtml(currentBrand);
  const safePaymentLink = escapeHtml(paymentLink);
  const safeOrderId = escapeHtml(orderId);
  const safeFormattedDate = formattedDate ? escapeHtml(formattedDate) : null;

  const subject = `${currentBrand}: ${readablePaymentType} payment link`;
  const text = [
    customerName ? `Hello ${customerName},` : "Hello,",
    "",
    `Please complete your ${readablePaymentType} payment of ${formattedAmount} using this link:`,
    paymentLink,
    "",
    `Order ID: ${orderId}`,
    formattedDate ? `Event date: ${formattedDate}` : null,
    "",
    `Thank you for choosing ${companyName}.`,
  ].filter(Boolean).join("\n");

  const logoUrl = getFullyQualifiedLogoUrl(paymentLink);

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:560px;margin:0 auto">
      <div style="margin-bottom: 24px;">
        <img src="${logoUrl}" alt="${safeCompanyName}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;" />
      </div>
      <h2 style="margin:0 0 16px">${readablePaymentType.charAt(0).toUpperCase() + readablePaymentType.slice(1)} payment link</h2>
      <p>Hello${safeCustomerName ? ` ${safeCustomerName}` : ""},</p>
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

function buildBookingConfirmationEmail(booking, bookingLink) {
  const companyName = booking.companyName || getBranding().companyName;
  const safeCompanyName = escapeHtml(companyName);
  const safeCustomerName = booking.clientName ? escapeHtml(booking.clientName) : null;
  const safeEventType = escapeHtml(booking.eventType || "Event booking");
  const safeBookingId = escapeHtml(String(booking.id || booking._id || ""));
  const formattedDate = formatDate(booking.eventDate);
  const safeFormattedDate = formattedDate ? escapeHtml(formattedDate) : "TBD";
  const safeBookingLink = bookingLink ? escapeHtml(bookingLink) : null;
  const safeLocation = escapeHtml(booking.eventLocation || "TBD");

  let menuHtml = "";
  let menuText = "";
  if (booking.items && booking.items.length > 0) {
    const grouped = {};
    booking.items.forEach(item => {
      const cat = item.category || "Selected Menu";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    menuText = "\n\nSelected Menu:\n";
    Object.entries(grouped).forEach(([cat, list]) => {
      menuText += `\n--- ${cat} ---\n`;
      list.forEach((item, idx) => {
        menuText += `${idx + 1}. ${item.name} (${item.quantity || 1} Qty)\n`;
      });
    });

    menuHtml = `
      <div style="margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
        <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 700; color: #111827;">Selected Menu Items</h3>
        <div style="background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; padding: 16px;">
    `;
    Object.entries(grouped).forEach(([cat, list]) => {
      menuHtml += `
        <div style="margin-bottom: 16px;">
          <h4 style="margin: 0 0 8px; font-size: 13px; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold;">${escapeHtml(cat)}</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #374151;">
      `;
      list.forEach(item => {
        menuHtml += `<li style="margin-bottom: 4px;"><strong>${escapeHtml(item.name)}</strong> <span style="color:#6b7280;font-size:12px">(${escapeHtml(String(item.quantity || 1))} Qty)</span></li>`;
      });
      menuHtml += `</ul></div>`;
    });
    menuHtml += `</div></div>`;
  }

  const subject = `Confirmation: We've received your booking request - ${safeCompanyName}`;
  const text = [
    booking.clientName ? `Hello ${booking.clientName},` : "Hello,",
    "",
    `Thank you for reaching out to ${companyName}! We've successfully received your booking request for your upcoming ${booking.eventType || "event"}.`,
    "",
    "Booking Summary:",
    `- Booking ID: ${booking.id || booking._id || ""}`,
    `- Event Type: ${booking.eventType || "Event booking"}`,
    `- Meal Type: ${booking.mealType || "N/A"}`,
    `- Event Date: ${formattedDate || "TBD"}`,
    `- Guests: ${booking.guestCount || "N/A"}`,
    `- Location: ${booking.eventLocation || "TBD"}`,
    menuText,
    "",
    "What happens next?",
    "Our team will review your requirements and get in touch with you shortly to discuss the menu and further details.",
    "",
    bookingLink ? `You can track your booking status here: ${bookingLink}` : null,
    "",
    `Best regards,`,
    `The ${companyName} Team`,
  ].filter(Boolean).join("\n");

  const logoUrl = getFullyQualifiedLogoUrl(bookingLink);

  const html = `
    <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#374151;max-width:600px;margin:0 auto;border:1px solid #f3f4f6;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1)">
      <div style="background:#22c55e;color:white;padding:32px 24px;text-align:center">
        <div style="margin-bottom: 16px;">
          <img src="${logoUrl}" alt="${safeCompanyName}" style="width:80px;height:80px;border-radius:50%;border:3px solid white;background:white;object-fit:cover;" />
        </div>
        <h1 style="margin:0;font-size:24px;font-weight:800">Booking Received!</h1>
        <p style="margin:8px 0 0;opacity:0.9;font-size:16px">Thank you for choosing ${safeCompanyName}</p>
      </div>
      <div style="padding:32px 24px">
        <p style="font-size:16px">Hello${safeCustomerName ? ` <strong>${safeCustomerName}</strong>` : ""},</p>
        <p>We're excited to help you with your upcoming event! We've received your request and our team is already reviewing the details.</p>
        
        <div style="background:#f9fafb;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #e5e7eb">
          <h3 style="margin:0 0 16px;font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#6b7280">Booking Summary</h3>
          <table style="width:100%;border-collapse:collapse;font-size:15px">
            <tr><td style="padding:8px 0;color:#6b7280">Event Type:</td><td style="padding:8px 0;text-align:right;font-weight:600">${safeEventType}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Meal Type:</td><td style="padding:8px 0;text-align:right;font-weight:600">${escapeHtml(booking.mealType || "N/A")}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Event Date:</td><td style="padding:8px 0;text-align:right;font-weight:600">${safeFormattedDate}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Guests:</td><td style="padding:8px 0;text-align:right;font-weight:600">${escapeHtml(booking.guestCount || "N/A")}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Location:</td><td style="padding:8px 0;text-align:right;font-weight:600">${safeLocation}</td></tr>
          </table>
        </div>

        ${menuHtml}

        <div style="margin:32px 0;padding:20px;border-left:4px solid #22c55e;background:#f0fdf4">
          <p style="margin:0;font-weight:600;color:#166534">What's next?</p>
          <p style="margin:8px 0 0;font-size:14px;color:#166534">A member of our team will contact you within 24 hours to finalize your menu and discuss special requirements.</p>
        </div>

        ${safeBookingLink ? `
          <div style="text-align:center;margin:32px 0">
            <a href="${safeBookingLink}" style="display:inline-block;background:#111827;color:white;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:700;font-size:16px">
              Track Your Booking
            </a>
          </div>
        ` : ""}
        
        <p style="margin-top:32px;border-top:1px solid #f3f4f6;padding-top:24px;font-size:14px;color:#6b7280">
          Best regards,<br>
          <strong>The ${safeCompanyName} Team</strong>
        </p>
      </div>
    </div>
  `;

  return { subject, text, html };
}

function buildBookingUpdateEmail(booking, bookingLink, customMessage) {
  const companyName = booking.companyName || getBranding().companyName;
  const safeCompanyName = escapeHtml(companyName);
  const safeCustomerName = booking.clientName ? escapeHtml(booking.clientName) : null;
  const safeEventType = escapeHtml(booking.eventType || "Event booking");
  const safeBookingId = escapeHtml(String(booking.id || booking._id || ""));
  const safeStatus = escapeHtml(String(booking.status || "Pending").toUpperCase());
  const formattedDate = formatDate(booking.eventDate);
  const safeFormattedDate = formattedDate ? escapeHtml(formattedDate) : "TBD";
  const safeBookingLink = bookingLink ? escapeHtml(bookingLink) : null;
  const safeCustomMessage = customMessage ? escapeHtml(customMessage) : null;

  const subject = `Booking Update: ${safeEventType} - ${safeCompanyName}`;
  const text = [
    booking.clientName ? `Hello ${booking.clientName},` : "Hello,",
    "",
    customMessage ? `${customMessage}\n` : null,
    "Here are the current details for your booking:",
    "",
    `Status: ${safeStatus}`,
    `Booking ID: ${booking.id || booking._id || ""}`,
    `Event: ${booking.eventType || "Event booking"}`,
    `Meal Type: ${booking.mealType || "N/A"}`,
    `Event Date: ${formattedDate || "TBD"}`,
    `Guests: ${booking.guestCount || "N/A"}`,
    "",
    bookingLink ? `View your booking details here: ${bookingLink}` : null,
    "",
    `Thank you for choosing ${companyName}.`,
  ].filter(Boolean).join("\n");

  const logoUrl = getFullyQualifiedLogoUrl(bookingLink);

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:560px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="background:#ea580c;color:white;padding:24px;text-align:center">
        <div style="margin-bottom: 16px;">
          <img src="${logoUrl}" alt="${safeCompanyName}" style="width:80px;height:80px;border-radius:50%;border:3px solid white;background:white;object-fit:cover;" />
        </div>
        <h2 style="margin:0;font-size:20px">Booking Details Update</h2>
      </div>
      <div style="padding:24px">
        <p>Hello${safeCustomerName ? ` ${safeCustomerName}` : ""},</p>
        ${safeCustomMessage ? `
          <div style="margin: 16px 0; padding: 16px; background-color: #fff7ed; border-left: 4px solid #ea580c; color: #9a3412; font-style: italic;">
            ${safeCustomMessage}
          </div>
        ` : `<p>We are sharing the current details for your upcoming event booking with ${safeCompanyName}.</p>`}
        
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0 0 8px"><strong>Status:</strong> <span style="color: #ea580c; font-weight: bold;">${safeStatus}</span></p>
          <p style="margin:0 0 8px"><strong>Booking ID:</strong> ${safeBookingId}</p>
          <p style="margin:0 0 8px"><strong>Event:</strong> ${safeEventType}</p>
          <p style="margin:0 0 8px"><strong>Meal Type:</strong> ${escapeHtml(booking.mealType || "N/A")}</p>
          <p style="margin:0 0 8px"><strong>Event Date:</strong> ${safeFormattedDate}</p>
          <p style="margin:0"><strong>Guests:</strong> ${escapeHtml(booking.guestCount || "N/A")}</p>
        </div>
        ${safeBookingLink ? `
          <div style="text-align:center;margin:24px 0">
            <a href="${safeBookingLink}" style="display:inline-block;background:#111827;color:white;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:700">
              View Online Dashboard
            </a>
          </div>
        ` : ""}
        <p>If you have any questions or would like to make changes, please feel free to contact us.</p>
        <p>Thank you for choosing ${safeCompanyName}!</p>
      </div>
    </div>
  `;

  return { subject, text, html };
}

export async function sendBookingUpdateEmail(to, booking, bookingLink, customMessage) {
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  console.log(`[MAIL-DEBUG] Building update email for ${booking.clientName} (Status: ${booking.status})`);
  const { subject, text, html } = buildBookingUpdateEmail(booking, bookingLink, customMessage);
  const from = getDefaultFrom(booking.companyName);
  
  console.log(`[MAIL-DEBUG] Sending update email from: ${from} to: ${to}`);
  const { data, error } = await resend.emails.send({
    from,
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

function buildCustomerLoginEmail(code, companyName) {
  const currentBrand = companyName || getBranding().companyName;
  const safeCode = escapeHtml(code);
  const safeCompanyName = escapeHtml(currentBrand);
  const subject = `${currentBrand}: Your booking login code`;
  const text = [
    currentBrand,
    "",
    "Use this code to sign in and view your bookings:",
    "",
    code,
    "",
    "This code expires in 10 minutes.",
  ].join("\n");

  const logoUrl = getFullyQualifiedLogoUrl();

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:520px;margin:0 auto">
      <div style="margin-bottom: 24px; text-align: center;">
        <img src="${logoUrl}" alt="${safeCompanyName}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;" />
      </div>
      <h2 style="margin:0 0 16px;text-align:center">${safeCompanyName} booking login code</h2>
      <p style="text-align:center">Use this code to sign in and view your bookings.</p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:18px;margin:20px 0;text-align:center">
        <p style="font-size:28px;letter-spacing:8px;font-weight:700;margin:0">${safeCode}</p>
      </div>
      <p style="font-size:13px;color:#6b7280;text-align:center">This code expires in 10 minutes.</p>
    </div>
  `;

  return { subject, text, html };
}

function buildAdminBookingNotificationEmail(booking, bookingLink) {
  const companyName = booking.companyName || getBranding().companyName;
  const safeCompanyName = escapeHtml(companyName);
  const safeCustomerName = booking.clientName ? escapeHtml(booking.clientName) : "";
  const safeEventType = escapeHtml(booking.eventType || "Event booking");
  const safeBookingId = escapeHtml(String(booking.id || booking._id || ""));
  const formattedDate = formatDate(booking.eventDate);
  const safeFormattedDate = formattedDate ? escapeHtml(formattedDate) : "TBD";
  const safeBookingLink = bookingLink ? escapeHtml(bookingLink) : null;
  const safeMobile = escapeHtml(booking.contactPhone || "Not provided");
  const safeEmail = escapeHtml(booking.contactEmail || "Not provided");
  const safeRequests = escapeHtml(booking.specialRequests || "None");
  const safeLocation = escapeHtml(booking.eventLocation || "Not provided");

  let menuHtml = "";
  let menuText = "";
  if (booking.items && booking.items.length > 0) {
    const grouped = {};
    booking.items.forEach(item => {
      const cat = item.category || "Selected Menu";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

    menuText = "\n\nSelected Menu:\n";
    Object.entries(grouped).forEach(([cat, list]) => {
      menuText += `\n--- ${cat} ---\n`;
      list.forEach((item, idx) => {
        menuText += `${idx + 1}. ${item.name} (${item.quantity || 1} Qty)\n`;
      });
    });

    menuHtml = `
      <div style="margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
        <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 700; color: #111827;">Selected Menu Items</h3>
        <div style="background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; padding: 16px;">
    `;
    Object.entries(grouped).forEach(([cat, list]) => {
      menuHtml += `
        <div style="margin-bottom: 16px;">
          <h4 style="margin: 0 0 8px; font-size: 13px; color: #ea580c; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold;">${escapeHtml(cat)}</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #374151;">
      `;
      list.forEach(item => {
        menuHtml += `<li style="margin-bottom: 4px;"><strong>${escapeHtml(item.name)}</strong> <span style="color:#6b7280;font-size:12px">(${escapeHtml(String(item.quantity || 1))} Qty)</span></li>`;
      });
      menuHtml += `</ul></div>`;
    });
    menuHtml += `</div></div>`;
  }

  const subject = `NEW BOOKING: ${safeCustomerName || "Booking request"} (${safeEventType})`;
  const text = [
    "--- NEW BOOKING ALERT ---",
    "",
    "Customer Information:",
    `- Name: ${booking.clientName || "Not provided"}`,
    `- Mobile: ${booking.contactPhone || "Not provided"}`,
    `- Email: ${booking.contactEmail || "Not provided"}`,
    "",
    "Event Information:",
    `- Booking ID: ${booking.id || booking._id || ""}`,
    `- Type: ${booking.eventType || "Event booking"}`,
    `- Meal Type: ${booking.mealType || "N/A"}`,
    `- Date: ${formattedDate || "TBD"}`,
    `- Guests: ${booking.guestCount || "N/A"}`,
    `- Location: ${booking.eventLocation || "Not provided"}`,
    `- Special Requests: ${booking.specialRequests || "None"}`,
    menuText,
    "",
    bookingLink ? `Link to Dashboard: ${bookingLink}` : null,
  ].filter(Boolean).join("\n");

  const logoUrl = getFullyQualifiedLogoUrl(bookingLink);

  const html = `
    <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#111827;max-width:600px;margin:0 auto;border:2px solid #ea580c;border-radius:12px;overflow:hidden">
      <div style="background:#ea580c;color:white;padding:24px;text-align:center">
        <div style="margin-bottom: 16px;">
          <img src="${logoUrl}" alt="${safeCompanyName}" style="width:80px;height:80px;border-radius:50%;border:3px solid white;background:white;object-fit:cover;" />
        </div>
        <h2 style="margin:0;font-size:20px;text-transform:uppercase;letter-spacing:1px">New Booking Alert</h2>
        <p style="margin:8px 0 0;opacity:0.9;font-size:14px">Immediate action required in Admin Panel</p>
      </div>
      <div style="padding:32px 24px">
        <div style="margin-bottom:32px">
          <h3 style="font-size:14px;margin:0 0 16px;color:#9a3412;border-bottom:2px solid #ffedd5;padding-bottom:8px;text-transform:uppercase">Customer Information</h3>
          <table style="width:100%;border-collapse:collapse;font-size:15px">
            <tr><td style="padding:6px 0;color:#6b7280;width:120px">Client Name:</td><td style="padding:6px 0;font-weight:700">${safeCustomerName}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280">Mobile:</td><td style="padding:6px 0;font-weight:700">${safeMobile}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280">Email:</td><td style="padding:6px 0;font-weight:700">${safeEmail}</td></tr>
          </table>
        </div>

        <div style="margin-bottom:32px">
          <h3 style="font-size:14px;margin:0 0 16px;color:#9a3412;border-bottom:2px solid #ffedd5;padding-bottom:8px;text-transform:uppercase">Event Details</h3>
          <table style="width:100%;border-collapse:collapse;font-size:15px">
            <tr><td style="padding:6px 0;color:#6b7280;width:120px">Booking ID:</td><td style="padding:6px 0;font-family:monospace">${safeBookingId}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280">Event Type:</td><td style="padding:6px 0;font-weight:700">${safeEventType}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280">Meal Type:</td><td style="padding:6px 0;font-weight:700">${escapeHtml(booking.mealType || "N/A")}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280">Event Date:</td><td style="padding:6px 0;font-weight:700">${safeFormattedDate}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280">Guest Count:</td><td style="padding:6px 0;font-weight:700">${escapeHtml(booking.guestCount || "N/A")}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280">Location:</td><td style="padding:6px 0;font-weight:700;color:#ea580c">${safeLocation}</td></tr>
          </table>
        </div>

        <div style="margin-bottom:32px;background:#fff7ed;padding:20px;border-radius:8px;border:1px solid #ffedd5">
          <h3 style="font-size:13px;margin:0 0 8px;color:#9a3412;text-transform:uppercase">Special Requests</h3>
          <p style="margin:0;font-size:14px;color:#4b5563;white-space:pre-wrap">${safeRequests}</p>
        </div>

        ${menuHtml}

        ${safeBookingLink ? `
          <div style="text-align:center;margin-top:32px">
            <a href="${safeBookingLink}" style="display:inline-block;background:#111827;color:white;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:700;font-size:16px">
              Open Admin Dashboard
            </a>
          </div>
        ` : ""}
      </div>
    </div>
  `;

  return { subject, text, html };
}

export async function sendPaymentLinkEmail(to, paymentLink, bookingDetails) {
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const { subject, text, html } = buildPaymentEmail(paymentLink, bookingDetails);
  const from = getDefaultFrom(bookingDetails.companyName);
  const { data, error } = await resend.emails.send({
    from,
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

export async function sendBookingConfirmationEmail(to, booking, bookingLink) {
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const { subject, text, html } = buildBookingConfirmationEmail(booking, bookingLink);
  const from = getDefaultFrom(booking.companyName);
  const { data, error } = await resend.emails.send({
    from,
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

export async function sendAdminBookingNotificationEmail(to, booking, bookingLink) {
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const { subject, text, html } = buildAdminBookingNotificationEmail(booking, bookingLink);
  const from = getDefaultFrom(booking.companyName);
  const { data, error } = await resend.emails.send({
    from,
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

export async function sendAdminPaymentNotificationEmail(to, booking, paymentType, adminLink) {
  if (!resend) return { success: false, error: "Resend not configured" };

  const subject = `PAYMENT UPLOAD: ${booking.clientName} - ${paymentType}`;
  const logoUrl = getFullyQualifiedLogoUrl(adminLink);
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:560px;margin:0 auto">
      <div style="margin-bottom: 24px; text-align: center;">
        <img src="${logoUrl}" alt="logo" style="width:80px;height:80px;border-radius:50%;object-fit:cover;" />
      </div>
      <h2 style="color:#111827">Payment Screenshot Uploaded</h2>
      <p>A customer has uploaded a payment screenshot for your review.</p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0">
        <p style="margin:0 0 8px"><strong>Customer:</strong> ${escapeHtml(booking.clientName)}</p>
        <p style="margin:0 0 8px"><strong>Payment Type:</strong> ${paymentType}</p>
        <p style="margin:0"><strong>Booking ID:</strong> ${escapeHtml(String(booking.id || booking._id))}</p>
      </div>
      <p>
        <a href="${adminLink}" style="display:inline-block;background:#ea580c;color:white;text-decoration:none;padding:12px 18px;border-radius:6px;font-weight:700">
          View and Approve Payment
        </a>
      </p>
    </div>
  `;

  const from = getDefaultFrom(booking.companyName);
  return resend.emails.send({
    from,
    to,
    subject,
    html,
  });
}

export async function sendAdminCodeRequestNotificationEmail(to, request) {
  if (!resend) return { success: false, error: "Resend not configured" };

  const subject = `CODE REQUEST: ${request.customerName}`;
  const customerIdentifier = request.customerIdentifier || request.customerEmail || request.customerPhone || "Not provided";
  const logoUrl = getFullyQualifiedLogoUrl();
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:560px;margin:0 auto">
      <div style="margin-bottom: 24px; text-align: center;">
        <img src="${logoUrl}" alt="logo" style="width:80px;height:80px;border-radius:50%;object-fit:cover;" />
      </div>
      <h2 style="color:#111827">Booking Code Requested</h2>
      <p>A potential customer has requested a booking code to view your services.</p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0">
        <p style="margin:0 0 8px"><strong>Customer:</strong> ${escapeHtml(request.customerName)}</p>
        <p style="margin:0"><strong>Phone/Email:</strong> ${escapeHtml(customerIdentifier)}</p>
      </div>
      <p>Please log in to the admin panel to generate and send a code to this customer.</p>
    </div>
  `;

  const from = getDefaultFrom();
  return resend.emails.send({
    from,
    to,
    subject,
    html,
  });
}

export async function sendCustomerLoginCodeEmail(to, code) {
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const { subject, text, html } = buildCustomerLoginEmail(code);
  const from = getDefaultFrom();
  const { data, error } = await resend.emails.send({
    from,
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
