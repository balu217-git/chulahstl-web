import { NextResponse } from "next/server";
import { google } from "googleapis";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { fullName, email, phone, date, time, attendance, notes } = await req.json();

    // === 1️⃣ Authenticate with Google Sheets ===
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // === 2️⃣ Append to Google Sheet ===
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Catering Services!A:K",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [
          [
            fullName,
            email,
            phone,
            date,
            time,
            attendance,
            notes,
            new Date().toLocaleString("en-US", {
              timeZone: "America/New_York",
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
          ],
        ],
      },
    });

    // === 3️⃣ Send Email Notification ===
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // e.g. your Gmail
        pass: process.env.GMAIL_PASS, // Gmail App Password
      },
    });

    const mailOptions = {
      from: `"Catering Form" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_TO || process.env.GMAIL_USER,
      subject: `🍽️ New Catering Request from ${fullName}`,
      html: `
      <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 20px;">
        <table style="max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <tr>
            <td style="background: #0d6efd; color: #fff; text-align: center; padding: 20px;">
              <h2 style="margin: 0;">New Catering Service Request</h2>
            </td>
          </tr>
          <tr>
            <td style="padding: 25px;">
              <p style="font-size: 16px; color: #333;">You have received a new catering service inquiry:</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr><td style="padding:8px; font-weight:bold;">Full Name:</td><td style="padding:8px; background:#f1f3f6;">${fullName}</td></tr>
                <tr><td style="padding:8px; font-weight:bold;">Email:</td><td style="padding:8px; background:#f1f3f6;">${email}</td></tr>
                <tr><td style="padding:8px; font-weight:bold;">Phone:</td><td style="padding:8px; background:#f1f3f6;">${phone}</td></tr>
                <tr><td style="padding:8px; font-weight:bold;">Date:</td><td style="padding:8px; background:#f1f3f6;">${date}</td></tr>
                <tr><td style="padding:8px; font-weight:bold;">Time:</td><td style="padding:8px; background:#f1f3f6;">${time}</td></tr>
                <tr><td style="padding:8px; font-weight:bold;">Attendance:</td><td style="padding:8px; background:#f1f3f6;">${attendance}</td></tr>
                <tr><td style="padding:8px; font-weight:bold;">Notes:</td><td style="padding:8px; background:#f1f3f6;">${notes || "N/A"}</td></tr>
              </table>
              <p style="margin-top: 25px; font-size: 13px; color: #666;">
                <em>Submitted on ${new Date().toLocaleString("en-US", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}</em>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background: #f8fafc; text-align: center; padding: 15px; font-size: 12px; color: #888;">
              © ${new Date().getFullYear()} Your Catering Company
            </td>
          </tr>
        </table>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Form submitted & email sent successfully!" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error submitting form:", error.message);
      return NextResponse.json({ message: "Error submitting form", error: error.message }, { status: 500 });
    } else {
      console.error("Unexpected error:", error);
      return NextResponse.json({ message: "Error submitting form", error: "Unknown error" }, { status: 500 });
    }
  }
}
