import nodemailer from "nodemailer";

const FROM_EMAIL = process.env.MAIL_FROM ?? "hello@edzosass.local";

async function sendWithResend(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject,
      html
    })
  });

  if (!response.ok) {
    console.error("Resend email hiba", await response.text());
  }

  return response.ok;
}

async function sendWithSmtp(to: string, subject: string, html: string) {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) return false;

  const transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    auth: { user, pass }
  });

  await transporter.sendMail({
    from: FROM_EMAIL,
    to,
    subject,
    html
  });

  return true;
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (process.env.NODE_ENV !== "production") {
    console.log("Email küldés (dev):", { to, subject });
  }

  const resendOk = await sendWithResend(to, subject, html);
  if (resendOk) return;

  const smtpOk = await sendWithSmtp(to, subject, html);
  if (smtpOk) return;

  console.log("Email fallback: nincs konfigurált szolgáltató", { to, subject });
}

export async function sendInviteEmail(to: string, inviteUrl: string) {
  return sendEmail(
    to,
    "Csatlakozz az edződhöz",
    `<p>Szia!</p><p>Kattints és csatlakozz az edződhöz:</p><p><a href="${inviteUrl}">Csatlakozás</a></p>`
  );
}

export async function sendNotificationEmail(to: string, subject: string, message: string) {
  return sendEmail(to, subject, `<p>${message}</p>`);
}
