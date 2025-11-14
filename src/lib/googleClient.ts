// lib/googleClient.ts
export async function fetchTimeZoneForLatLng(lat: number, lng: number, timestampSeconds?: number) {
  const ts = timestampSeconds ?? Math.floor(Date.now() / 1000);
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng), timestamp: String(ts) });
  const res = await fetch(`/api/google/timezone?${params.toString()}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || "Timezone request failed");
  }
  return res.json(); // { timeZoneId, timeZoneName, dstOffset, rawOffset }
}
