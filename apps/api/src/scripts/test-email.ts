import { sendTestEmail } from "../services/email.service.js";

const recipient = process.argv[2];

if (!recipient) {
  throw new Error("Please provide a recipient email address");
}

try {
  const result = await sendTestEmail(recipient);

  console.log("Email sent successfully!");
  console.log("Message ID:", result.messageId);
} catch (error) {
  console.error("Email sending failed:", error);
  process.exitCode = 1;
}