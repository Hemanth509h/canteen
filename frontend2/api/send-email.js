export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { to, subject, text, html } = req.body || {};

  if (!Array.isArray(to) || to.length === 0) {
    return res.status(400).json({ error: "`to` must be a non-empty array." });
  }
  if (!subject || (!text && !html)) {
    return res.status(400).json({ error: "`subject` and `text` or `html` are required." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return res.status(500).json({ error: "Resend API credentials are not configured." });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from: fromEmail, to, subject, text, html }),
    });

    const payload = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: payload || "Resend request failed." });
    }

    return res.status(200).json(payload);
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unknown server error." });
  }
}
