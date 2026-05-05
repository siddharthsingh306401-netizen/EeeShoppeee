import nodemailer from "nodemailer";
import dotenv from "dotenv";
import ejs from "ejs";
import path from "path";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
// render an ejs email template
const renderEmailTemplate = async (
  templateName: string,
  data: Record<string, any>,
): Promise<string> => {
  try {
    const templatePath = path.join(
      process.cwd(),
      "apps",
      "auth-service",
      "src",
      "utils",
      "email-template",
      `${templateName}.ejs`,
    );

    console.log(`[MAIL] Rendering template: ${templatePath}`);
    const html = await ejs.renderFile(templatePath, data);
    console.log(`[MAIL] Template rendered successfully`);
    return html;
  } catch (error) {
    console.error(`[MAIL] Error rendering template ${templateName}:`, error);
    throw new Error(
      `Failed to render email template: ${templateName}. Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};
// send email using nodemailer
export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  templateData: Record<string, any>,
) => {
  try {
    // Validate email address
    if (!to || !to.includes("@")) {
      console.error(`[MAIL] Invalid email address: ${to}`);
      return false;
    }

    // Validate SMTP configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error("[MAIL] SMTP credentials not configured");
      return false;
    }

    console.log(`[MAIL] Starting email send to ${to}, subject: ${subject}`);

    const html = await renderEmailTemplate(templateName, templateData);
    console.log(`[MAIL] Template rendered for ${templateName}`);

    await transporter.sendMail({
      from: `<${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`[MAIL] Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error(`[MAIL] Error sending email to ${to}:`, error);
    return false;
  }
};
