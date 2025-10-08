import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

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

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Contact Form!A:D",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS", // ensures new rows are added
      requestBody: {
        values: [[name, email, message, new Date().toLocaleString("en-US", {
          timeZone: "America/New_York", // optional, specify US timezone
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        })]],
      },
    });

    return NextResponse.json({ message: "Form submitted successfully!" });
  }
  catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error submitting form:", error.message);
      return NextResponse.json({ message: "Error submitting form", error: error.message }, { status: 500 });
    } else {
      console.error("Unexpected error:", error);
      return NextResponse.json({ message: "Error submitting form", error: "Unknown error" }, { status: 500 });
    }
  }
}
