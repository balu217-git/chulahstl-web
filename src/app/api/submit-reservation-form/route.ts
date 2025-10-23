import { NextResponse } from "next/server";
import { google } from "googleapis";
import { JWT } from "google-auth-library";
import nodemailer from "nodemailer";

interface ReservationFormData {
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
    const data: ReservationFormData = await req.json();
    const { fullName, email, phone, date, time, attendance, notes } = data;

    // === 1️⃣ Authenticate with Google Sheets ===
    const auth = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // === 2️⃣ Append submission to Google Sheet ===
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Reservation!A:K",
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

    // === 3️⃣ Setup iCloud SMTP Transport ===
    const transporter = nodemailer.createTransport({
      host: "smtp.mail.me.com",
      port: 587, // use 465 if SSL required
      secure: false,
      auth: {
        user: process.env.ICLOUD_USER,
        pass: process.env.ICLOUD_PASS, // iCloud app-specific password
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // === 4️⃣ Verify SMTP connection (optional for debugging) ===
    await transporter
      .verify()
      .then(() => console.log("✅ iCloud SMTP connection verified"))
      .catch((err) => console.error("❌ SMTP verification failed:", err));

    // === 5️⃣ Email HTML Template ===
    const logoUrl = "https://chulahstl.com/chulah-logo-green.png";

    const emailTemplate = `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f9f9; padding: 40px 0;">
        <table align="center" width="600" cellpadding="0" cellspacing="0"
          style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.08); border: 1px solid #e0e0e0; max-width: 95%;">

          <!-- Header -->
          <tr>
            <td style="text-align: center; padding: 30px 20px; background-color: #00282a;">
              <img src="${logoUrl}" alt="Brand Logo" width="90" style="margin-bottom: 10px;" />
              <h2 style="color: #ffffff; margin: 10px 0 0; font-size: 22px; font-weight: 600;">New Reservation Request</h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 30px 40px;">
              <p style="font-size: 16px; color: #00282a; margin-bottom: 15px;">Hello,</p>
              <p style="font-size: 15px; color: #00282a; margin-bottom: 25px;">
                You’ve received a new reservation request. Here are the details:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; font-size: 15px;">
                <tr>
                  <td style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f4f9f9;"><strong>Name</strong></td>
                  <td style="padding: 10px; border: 1px solid #e0e0e0;">${fullName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f4f9f9;"><strong>Email</strong></td>
                  <td style="padding: 10px; border: 1px solid #e0e0e0;">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f4f9f9;"><strong>Phone</strong></td>
                  <td style="padding: 10px; border: 1px solid #e0e0e0;">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f4f9f9;"><strong>Date</strong></td>
                  <td style="padding: 10px; border: 1px solid #e0e0e0;">${date}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f4f9f9;"><strong>Time</strong></td>
                  <td style="padding: 10px; border: 1px solid #e0e0e0;">${time}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f4f9f9;"><strong>Attendance</strong></td>
                  <td style="padding: 10px; border: 1px solid #e0e0e0;">${attendance}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #e0e0e0; background-color: #f4f9f9;"><strong>Notes</strong></td>
                  <td style="padding: 10px; border: 1px solid #e0e0e0;">${notes || "—"}</td>
                </tr>
              </table>

              <p style="font-size: 14px; color: #00282a; margin-top: 20px;">
                Sent on: <strong>${new Date().toLocaleString("en-US", { hour12: true })}</strong>
              </p>

              <div style="text-align: center; margin-top: 30px;">
                <a href="mailto:${email}"
                  style="background-color: #00282a; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 6px; font-size: 15px; display: inline-block;">
                  Reply to ${fullName}
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
    `;

    // === 6️⃣ Send Email ===
    const mailOptions = {
      from: `"Reservation Request" <${process.env.ICLOUD_USER}>`,
      to: process.env.ICLOUD_TO || process.env.ICLOUD_USER,
      subject: `🍽️ New Reservation Request from ${fullName}`,
      html: emailTemplate,
    };

    await transporter.sendMail(mailOptions);

    // === ✅ Success Response ===
    return NextResponse.json({
      message: "Form submitted and email notification sent successfully!",
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
