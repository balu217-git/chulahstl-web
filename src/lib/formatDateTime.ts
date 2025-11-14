// lib/formatDateTime.ts
/**
 * Get timezone abbreviation like CST / CDT.
 */
export function getTzAbbrev(date: Date, timeZone?: string) {
  try {
    if (!timeZone) return "";
    const formatted = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "short",
    }).format(date);
    return formatted.split(" ").pop()?.replace(/[.,]/g, "") || "";
  } catch {
    return "";
  }
}

/**
 * Main reusable formatter for all time displays.
 * Converts ISO string → formatted time in restaurant timezone.
 *
 * EXAMPLE OUTPUT:
 *   "6:30 PM CST"
 */
export function formatTimeForTZ(
  iso: string | null | undefined,
  timeZone?: string
) {
  if (!iso) return "";

  try {
    const d = new Date(iso);

    const timeStr = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone,
    });

    const tz = getTzAbbrev(d, timeZone);
    return tz ? `${timeStr} ${tz}` : timeStr;
  } catch {
    return iso;
  }
}

/**
 * Date + time + timezone format for receipts/screens:
 * EX: "Nov 14 • 6:30 PM CST"
 */
export function formatDateTimeForTZ(
  iso: string | null | undefined,
  timeZone?: string
) {
  if (!iso) return "";

  try {
    const d = new Date(iso);

    const dateStr = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone,
    });

    const timeStr = d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone,
    });

    const tz = getTzAbbrev(d, timeZone);

    return tz ? `${dateStr} • ${timeStr} ${tz}` : `${dateStr} • ${timeStr}`;
  } catch {
    return iso;
  }
}
