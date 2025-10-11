import { NextResponse } from "next/server";
import { google } from "googleapis";
import { JWT } from "google-auth-library";
// import nodemailer from "nodemailer"; // temporarily disabled

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
        values: [[
          name, 
          email, 
          message, 
          new Date().toLocaleString("en-US", { hour12: true })
        ]],
      },
    });

    // === 2️⃣ Email sending temporarily disabled ===
    /*
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
      html: `<p>New contact form submission from ${name} (${email}): ${message}</p>`,
    };

    await transporter.sendMail(mailOptions);
    */

    return NextResponse.json({
      success: true,
      message: "Form submitted successfully! (Email sending disabled for now)",
    });
  } catch (error) {
    console.error("Error submitting form:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message: "Error submitting form", error: message },
      { status: 500 }
    );
  }
}
