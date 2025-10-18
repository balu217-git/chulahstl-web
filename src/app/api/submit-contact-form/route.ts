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
        values: [
          [
            name,
            email,
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
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <hr/>
        <p>Submitted on ${new Date().toLocaleString("en-US", { hour12: true })}</p>
      `,
    };

    // === 5️⃣ Send the email ===
    await transporter.sendMail(mailOptions);

    // === ✅ Success Response ===
    return NextResponse.json({
      success: true,
      message: "Form submitted successfully!",
    });
  } catch (error: any) {
    console.error("❌ Error submitting form:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error submitting form",
        error: error?.message || JSON.stringify(error),
        stack: error?.stack || "no stack trace",
      },
      { status: 500 }
    );
  }
}
