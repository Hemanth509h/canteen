const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

function escapeHtml(value) {
  if (typeof value !== "string") return "";
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function buildBookingConfirmationEmail(booking, bookingLink) {
  const companyName = booking.companyName || "Sai Caterers";
  const safeCompanyName = escapeHtml(companyName);
  const safeCustomerName = escapeHtml(booking.clientName || "Customer");
  const safeEventType = escapeHtml(booking.eventType || "Event booking");
  const safeBookingId = escapeHtml(String(booking.id || booking._id || ""));
  const formattedDate = formatDate(booking.eventDate);
  const safeFormattedDate = formattedDate ? escapeHtml(formattedDate) : "TBD";
  const safeBookingLink = bookingLink ? escapeHtml(bookingLink) : null;
  const safeLocation = escapeHtml(booking.eventLocation || "TBD");
  const safeGuests = escapeHtml(String(booking.guestCount || "N/A"));

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
    `Hello ${booking.clientName || "Customer"},`,
    "",
    `Thank you for reaching out to ${companyName}! We've successfully received your booking request for your upcoming ${booking.eventType || "event"}.`,
    "",
    "Booking Summary:",
    `- Booking ID: ${booking.id || booking._id || ""}`,
    `- Event Type: ${booking.eventType || "Event booking"}`,
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

  const html = `
    <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#374151;max-width:600px;margin:0 auto;border:1px solid #f3f4f6;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1)">
      <div style="background:#22c55e;color:white;padding:32px 24px;text-align:center">
        <h1 style="margin:0;font-size:24px;font-weight:800">Booking Received!</h1>
        <p style="margin:8px 0 0;opacity:0.9;font-size:16px">Thank you for choosing ${safeCompanyName}</p>
      </div>
      <div style="padding:32px 24px">
        <p style="font-size:16px">Hello <strong>${safeCustomerName}</strong>,</p>
        <p>We're excited to help you with your upcoming event! We've received your request and our team is already reviewing the details.</p>
        <div style="background:#f9fafb;border-radius:12px;padding:24px;margin:24px 0;border:1px solid #e5e7eb">
          <h3 style="margin:0 0 16px;font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#6b7280">Booking Summary</h3>
          <table style="width:100%;border-collapse:collapse;font-size:15px">
            <tr><td style="padding:8px 0;color:#6b7280">Event Type:</td><td style="padding:8px 0;text-align:right;font-weight:600">${safeEventType}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Event Date:</td><td style="padding:8px 0;text-align:right;font-weight:600">${safeFormattedDate}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Guests:</td><td style="padding:8px 0;text-align:right;font-weight:600">${safeGuests}</td></tr>
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

export function buildAdminBookingNotificationEmail(booking, bookingLink) {
  const companyName = booking.companyName || "Sai Caterers";
  const safeCompanyName = escapeHtml(companyName);
  const safeCustomerName = escapeHtml(booking.clientName || "Customer");
  const safeEventType = escapeHtml(booking.eventType || "Event booking");
  const safeBookingId = escapeHtml(String(booking.id || booking._id || ""));
  const formattedDate = formatDate(booking.eventDate);
  const safeFormattedDate = formattedDate ? escapeHtml(formattedDate) : "TBD";
  const safeBookingLink = bookingLink ? escapeHtml(bookingLink) : null;
  const safeMobile = escapeHtml(booking.contactPhone || "Not provided");
  const safeEmail = escapeHtml(booking.contactEmail || "Not provided");
  const safeRequests = escapeHtml(booking.specialRequests || "None");
  const safeLocation = escapeHtml(booking.eventLocation || "Not provided");
  const safeGuests = escapeHtml(String(booking.guestCount || "N/A"));
  const safeMealType = escapeHtml(booking.mealType || "N/A");

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

  const subject = `🔥 NEW BOOKING: ${safeCustomerName} (${safeEventType})`;
  const text = [
    "--- NEW BOOKING ALERT ---",
    "",
    "Customer Information:",
    `- Name: ${booking.clientName || "Customer"}`,
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

  const html = `
    <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#111827;max-width:600px;margin:0 auto;border:2px solid #ea580c;border-radius:12px;overflow:hidden">
      <div style="background:#ea580c;color:white;padding:24px;text-align:center">
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
            <tr><td style="padding:6px 0;color:#6b7280;width:120px">Event Type:</td><td style="padding:6px 0;font-weight:700">${safeEventType}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280">Meal Type:</td><td style="padding:6px 0;font-weight:700">${safeMealType}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280">Event Date:</td><td style="padding:6px 0;font-weight:700">${safeFormattedDate}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280">Guest Count:</td><td style="padding:6px 0;font-weight:700">${safeGuests}</td></tr>
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

export async function sendResendEmail({ to, subject, text, html }) {
  if (!Array.isArray(to) || to.length === 0) {
    throw new Error("Resend email recipient list cannot be empty.");
  }

  const response = await fetch("/api/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, subject, text, html }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend email failed: ${response.status} ${body}`);
  }

  return response.json();
}

export async function sendBookingEmails(booking, bookingLink) {
  const customerEmail = booking.contactEmail?.trim();
  const adminEmail = ADMIN_EMAIL?.trim() || booking.adminEmail?.trim() || "";
  
  if (!customerEmail && !adminEmail) {
    throw new Error("No email recipient configured for booking notifications.");
  }

  const confirmationEmail = buildBookingConfirmationEmail(booking, bookingLink);
  const adminEmailPayload = buildAdminBookingNotificationEmail(booking, bookingLink);

  let customerEmailSuccess = false;
  let adminEmailSuccess = false;

  // 1. Attempt Customer Confirmation Email
  if (customerEmail) {
    try {
      await sendResendEmail({
        to: [customerEmail],
        subject: confirmationEmail.subject,
        text: confirmationEmail.text,
        html: confirmationEmail.html,
      });
      customerEmailSuccess = true;
    } catch (error) {
      console.error("[MAIL-ERROR] Customer confirmation email failed:", error);
      // We don't throw here to allow the booking to proceed if admin notification works
    }
  }

  // 2. Attempt Admin Notification Email (Critical)
  if (adminEmail) {
    try {
      await sendResendEmail({
        to: [adminEmail],
        subject: adminEmailPayload.subject,
        text: adminEmailPayload.text,
        html: adminEmailPayload.html,
      });
      adminEmailSuccess = true;
    } catch (error) {
      console.error("[MAIL-ERROR] Admin notification email failed:", error);
      // We throw if admin notification fails as it's critical for the business
      throw new Error(`Failed to notify admin: ${error.message}`);
    }
  }

  return { customerEmailSuccess, adminEmailSuccess };
}
