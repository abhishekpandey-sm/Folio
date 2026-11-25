// import { sendTestEmail } from "../services/email.service.js";

// const recipient = process.argv[2];

// if (!recipient) {
//   throw new Error("Please provide a recipient email address");
// }

// try {
//   const result = await sendTestEmail(recipient);
//   console.log("Test email sent successfully:", result?.id);
// } catch (error) {
//   console.error("Email test failed:", error);
//   process.exitCode = 1;
// }

import { mailer } from "../lib/mailer.js";

try {
  await mailer.verify();
  console.log("Gmail SMTP connection successful!");
} catch (error) {
  console.error("Gmail SMTP connection failed:", error);
  process.exitCode = 1;
}
