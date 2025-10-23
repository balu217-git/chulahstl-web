import { NextResponse } from "next/server";
import { google } from "googleapis";
import { JWT } from "google-auth-library";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, phone, message } = await req.json();

    // === 1️⃣ Store data in Google Sheets ===
    const auth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Contact Form!A:E",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [
          [
            name,
            email,
            phone,
            message,
            new Date().toLocaleString("en-US", { hour12: true }),
          ],
        ],
      },
    });

    // === 2️⃣ Send Email via iCloud SMTP ===
    const transporter = nodemailer.createTransport({
      host: "smtp.mail.me.com",
      port: 587, // or 465 if you prefer SSL
      secure: false, // true if using port 465
      auth: {
        user: process.env.ICLOUD_USER,
        pass: process.env.ICLOUD_PASS, // App-specific password
      },
      tls: {
        rejectUnauthorized: false, // helps during local dev
      },
    });

    // === 3️⃣ Verify SMTP connection ===
    await transporter
      .verify()
      .then(() => console.log("✅ iCloud SMTP connection verified"))
      .catch((err) => console.error("❌ SMTP verification failed:", err));

    // === 4️⃣ Compose email ===
const mailOptions = {
  from: `"Website Contact" <${process.env.ICLOUD_USER}>`,
  to: process.env.ICLOUD_TO || process.env.ICLOUD_USER,
  subject: `📬 New Contact Form Submission from ${name}`,
  html: `
  <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f9f9; padding: 40px 0;">
    <table align="center" width="600" cellpadding="0" cellspacing="0"
      style="background-color: #ffffff; border-radius: 15px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.08); border: 1px solid #e0e0e0;">

      <!-- Header with Logo -->
      <tr>
        <td style="text-align: center; padding: 30px 20px; background-color: #00282a;">
          <img src="https://chulahstl.com/chulah-logo-green.png" alt="Brand Logo" width="90" style="margin-bottom: 10px;" />
          <h2 style="color: #ffffff; margin: 10px 0 0; font-size: 22px; font-weight: 600;">New Contact Form Submission</h2>
        </td>
      </tr>

      <!-- Content Section -->
      <tr>
        <td style="padding: 30px 40px;">
          <p style="font-size: 16px; color: #00282a; margin: 0 0 15px;">
            Hello,
          </p>
          <p style="font-size: 15px; color: #00282a; margin: 0 0 25px;">
            You’ve received a new message from your website contact form. Here are the details:
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; font-size: 15px;">
            <tr>
              <td style="padding: 12px; border: 1px solid #e0e0e0; background-color: #f4f9f9; color: #00282a;"><strong>Name</strong></td>
              <td style="padding: 12px; border: 1px solid #e0e0e0; color: #00282a;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e0e0e0; background-color: #f4f9f9; color: #00282a;"><strong>Email</strong></td>
              <td style="padding: 12px; border: 1px solid #e0e0e0; color: #00282a;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e0e0e0; background-color: #f4f9f9; color: #00282a;"><strong>Phone</strong></td>
              <td style="padding: 12px; border: 1px solid #e0e0e0; color: #00282a;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #e0e0e0; background-color: #f4f9f9; color: #00282a;"><strong>Message</strong></td>
              <td style="padding: 12px; border: 1px solid #e0e0e0; color: #00282a;">${message}</td>
            </tr>
          </table>

          <p style="font-size: 14px; color: #00282a; margin-top: 20px;">
            Sent on: <strong>${new Date().toLocaleString("en-US", { hour12: true })}</strong>
          </p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="mailto:${email}" style="background-color: #00282a; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-size: 15px; display: inline-block;">
              Reply to ${name}
            </a>
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background-color: #f1f3f3; text-align: center; padding: 15px; font-size: 13px; color: #00282a;">
          © ${new Date().getFullYear()} Chulah STL. All rights reserved.
        </td>
      </tr>
    </table>
  </div>
  `,
};



    // === 5️⃣ Send the email ===
    await transporter.sendMail(mailOptions);

    // === ✅ Success Response ===
    return NextResponse.json({
      success: true,
      message: "Form submitted successfully!",
    });
  } catch (error: unknown) {
    console.error("Error submitting form:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Error submitting form", error: message },
      { status: 500 }
    );
  }

}
