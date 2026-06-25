import sendgrid from "@sendgrid/mail";
import Twilio from "twilio";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  } catch (err) {
    console.error("Failed to initialize Twilio client:", err.message);
  }
}

export async function notifyEmail(to, subject, html) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log("SENDGRID_API_KEY not set — notification (to:", to, ") — subject:", subject);
    return;
  }
  try {
    await sendgrid.send({ to, from: process.env.EMAIL_FROM, subject, html });
  } catch (err) {
    console.error("SendGrid error:", err?.message || err);
  }
}

export async function notifyWhatsApp(toNumber, message) {
  // toNumber expected in international format without +, e.g. 15551234567 or include +
  if (!twilioClient) {
    console.log("Twilio not configured — skipping WhatsApp notification to", toNumber);
    return;
  }
  // Twilio WhatsApp channel requires the from number in the form 'whatsapp:+14155238886' and to 'whatsapp:+<number>'
  const from = process.env.TWILIO_WHATSAPP_FROM; // e.g. 'whatsapp:+1415...'
  const to = toNumber.startsWith("whatsapp:") ? toNumber : `whatsapp:${toNumber.startsWith("+") ? toNumber : '+' + toNumber}`;
  try {
    await twilioClient.messages.create({ body: message, from, to });
  } catch (err) {
    console.error("Twilio WhatsApp send error:", err?.message || err);
  }
}
