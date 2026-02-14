type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
};

export async function sendEmail(input: SendEmailInput) {
  if (!input.to) {
    return { ok: false, error: "Hianyzik a cimzett email." };
  }

  // TODO: integrate email provider (SMTP/transactional).
  console.log("[MAIL]", {
    to: input.to,
    subject: input.subject
  });

  return { ok: true };
}
