import { NextResponse } from "next/server";
import { google } from "googleapis";
import { JWT } from "google-auth-library";
import nodemailer from "nodemailer";

interface CateringFormData {
  fullName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  attendance: number;
  notes: string;
}

export async function POST(req: Request) {
  try {
    // Type the request body
    const data: CateringFormData = await req.json();
    const { fullName, email, phone, date, time, attendance, notes } = data;

    // Google Sheets authentication
    const auth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Append to Google Sheet
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

    // Send email notification
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Catering Request" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_TO || process.env.GMAIL_USER,
      subject: `New Catering Request from ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border-radius: 8px; background-color: #f9f9f9;">
          <h2 style="color:#333;">New Catering Request</h2>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Expected Attendance:</strong> ${attendance}</p>
          <p><strong>Notes:</strong> ${notes}</p>
          <hr style="margin:20px 0;">
          <p style="font-size:12px;color:#777;">Submitted on ${new Date().toLocaleString()}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: "Form submitted and email sent successfully!",
    });
  } catch (error: unknown) {
    console.error("Error submitting form:", error);

    // Narrow unknown to Error
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { message: "Error submitting form", error: message },
      { status: 500 }
    );
  }
}
