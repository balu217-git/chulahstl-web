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
 * TIME ONLY — e.g. "6:30 PM CST"
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
 * FRIENDLY Date + Time + TZ format:
 *
 * Examples:
 *   "Today • 6:30 PM CST"
 *   "Tomorrow • 4:00 PM CST"
 *   "Sat, Nov 23 • 7:10 PM CST"
 */
export function formatDateTimeForTZ(
  iso: string | null | undefined,
  timeZone?: string
) {
  if (!iso) return "";

  try {
    const d = new Date(iso);

    // Convert both now + target into the SAME timezone
    const now = timeZone
      ? new Date(new Date().toLocaleString("en-US", { timeZone }))
      : new Date();

    const local = timeZone
      ? new Date(d.toLocaleString("en-US", { timeZone }))
      : d;

    // Compare date parts
    const isSameDay =
      local.getFullYear() === now.getFullYear() &&
      local.getMonth() === now.getMonth() &&
      local.getDate() === now.getDate();

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const isTomorrow =
      local.getFullYear() === tomorrow.getFullYear() &&
      local.getMonth() === tomorrow.getMonth() &&
      local.getDate() === tomorrow.getDate();

    // Format time
    const timeStr = local.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Format TZ
    const tz = getTzAbbrev(local, timeZone);

    // Friendly titles
    if (isSameDay) return `Today • ${timeStr} ${tz}`;
    if (isTomorrow) return `Tomorrow • ${timeStr} ${tz}`;

    // Fallback full format: Wed, Nov 22 • 7:30 PM CST
    const weekday = local.toLocaleDateString("en-US", { weekday: "short" });
    const monthDay = local.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    return `${weekday}, ${monthDay} • ${timeStr} ${tz}`;
  } catch {
    return iso;
  }
}
