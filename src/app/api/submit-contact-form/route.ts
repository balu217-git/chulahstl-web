import { NextResponse } from "next/server";
import { google } from "googleapis";
import { JWT } from "google-auth-library";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    // === 1️⃣ Store data in Google Sheets ===
    const auth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Contact Form!A:D",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[name, email, message, new Date().toLocaleString("en-US", { hour12: true })]],
      },
    });

    // === 2️⃣ Send Email via Gmail (using App Password) ===
   const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});


  const mailOptions = {
  from: `"Website Contact" <${process.env.GMAIL_USER}>`,
  to: process.env.GMAIL_TO || process.env.GMAIL_USER,
  subject: `New Contact Form Submission from ${name}`,
  html: `
  <div style="font-family: Arial, sans-serif; background-color: #f7f9fc; padding: 20px;">
    <table style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <tr>
        <td style="background: #0d6efd; color: #ffffff; text-align: center; padding: 20px;">
          <h2 style="margin: 0;">📩 New Contact Form Submission</h2>
        </td>
      </tr>
      <tr>
        <td style="padding: 30px;">
          <p style="font-size: 16px; color: #333333; margin-bottom: 20px;">
            You have received a new message from your website contact form:
          </p>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; font-weight: bold; width: 120px;">Name:</td>
              <td style="padding: 8px; background: #f1f3f6; border-radius: 4px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Email:</td>
              <td style="padding: 8px; background: #f1f3f6; border-radius: 4px;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Message:</td>
              <td style="padding: 8px; background: #f1f3f6; border-radius: 4px;">${message}</td>
            </tr>
          </table>

          <p style="font-size: 14px; color: #555555; margin-top: 30px;">
            <em>Sent on ${new Date().toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}</em>
          </p>
        </td>
      </tr>
      <tr>
        <td style="background: #f7f9fc; text-align: center; padding: 15px; font-size: 13px; color: #888888;">
          © ${new Date().getFullYear()} Your Company Name. All rights reserved.
        </td>
      </tr>
    </table>
  </div>
  `,
};


    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Form submitted and email sent successfully!" });
  } catch (error) {
    console.error("Error submitting form:", error);
    return NextResponse.json(
      { success: false, message: "Error submitting form", error: (error as Error).message },
      { status: 500 }
    );
  }
}
