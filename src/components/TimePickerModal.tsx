"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Button } from "react-bootstrap";

type Mode = "pickup" | "delivery";

interface TimePickerModalProps {
  show: boolean;
  onClose: () => void;
  mode: Mode;
  weekdayText?: string[] | null; // Google Places weekday_text (Mon..Sun)
  timeZone?: string; // optional timezone for display (IANA, e.g. "America/Chicago")
  slotMinutes?: number;
  daysAhead?: number;
  onConfirm: (isoDatetimeString: string) => void;
  asapEstimateMinutes?: number; // optional estimate for display only
}

/* ---------- helpers ---------- */
function to24(t: string) {
  const m = t.match(/(\d{1,2}):(\d{2})\s*([AaPp][Mm])/);
  if (!m) return t;
  let hh = parseInt(m[1], 10);
  const mm = m[2];
  const ampm = m[3].toLowerCase();
  if (ampm === "am") {
    if (hh === 12) hh = 0;
  } else {
    if (hh !== 12) hh += 12;
  }
  return `${String(hh).padStart(2, "0")}:${mm}`;
}

function parseWeekdayTextLine(line?: string) {
  if (!line) return { open: null as string | null, close: null as string | null, raw: "" };
  const parts = line.split(":");
  if (parts.length < 2) return { open: null as string | null, close: null as string | null, raw: line };
  const rest = parts.slice(1).join(":").trim();
  if (/closed/i.test(rest)) return { open: null as string | null, close: null as string | null, raw: rest };
  const m = rest.match(/(\d{1,2}:\d{2}\s?(AM|PM|am|pm)?)\s*[–-]\s*(\d{1,2}:\d{2}\s?(AM|PM|am|pm)?)/);
  if (!m) return { open: null as string | null, close: null as string | null, raw: rest };
  return { open: to24(m[1]), close: to24(m[3]), raw: rest };
}

function formatTime(d: Date, timeZone?: string) {
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: true, timeZone });
}
function addMinutes(d: Date, m: number) {
  return new Date(d.getTime() + m * 60000);
}
function weekdayTextToMap(wd?: string[] | null) {
  const map: Record<number, { open: string | null; close: string | null; raw: string }> = {};
  if (!wd || wd.length === 0) {
    for (let i = 0; i < 7; i++) map[i] = { open: null, close: null, raw: "" };
    return map;
  }
  // Google returns Monday..Sunday -> map to JS days (1..0)
  for (let i = 0; i < wd.length && i < 7; i++) {
    const jsDay = (i + 1) % 7;
    map[jsDay] = parseWeekdayTextLine(wd[i]);
  }
  for (let i = 0; i < 7; i++) if (!map[i]) map[i] = { open: null, close: null, raw: "" };
  return map;
}
function formatMonthDay(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function formatShortWeekday(date: Date) {
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

/* ---------- timezone abbrev helper (Intl + small fallback) ---------- */
const tzFallbackMap: Record<string, [string, string]> = {
  "America/Chicago": ["CST", "CDT"],
  "America/New_York": ["EST", "EDT"],
  "America/Denver": ["MST", "MDT"],
  "America/Los_Angeles": ["PST", "PDT"],
  "Europe/London": ["GMT", "BST"],
};

function getTzAbbrevWithFallback(date: Date, timeZone?: string) {
  if (!timeZone) return "";
  try {
    const formatted = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" }).format(date);
    const parts = formatted.split(" ");
    const last = parts[parts.length - 1].replace(/[.,]/g, "");
    if (/^[A-Za-z]{2,5}$/.test(last) || /^GMT/.test(last)) return last;
  } catch (e) {
    // fallthrough to fallback below
  }

  const pair = tzFallbackMap[timeZone];
  if (pair) {
    try {
      const offsetForDate = new Date(date.toLocaleString("en-US", { timeZone })).getTimezoneOffset();
      const jan = new Date(date.getFullYear(), 0, 1);
      const jul = new Date(date.getFullYear(), 6, 1);
      const janOffset = new Date(jan.toLocaleString("en-US", { timeZone })).getTimezoneOffset();
      const julOffset = new Date(jul.toLocaleString("en-US", { timeZone })).getTimezoneOffset();
      const usesDST = janOffset !== julOffset;
      if (!usesDST) return pair[0];
      const smallerOffset = Math.min(janOffset, julOffset);
      const inDST = offsetForDate === smallerOffset;
      return inDST ? pair[1] : pair[0];
    } catch {
      return pair[0];
    }
  }

  return "";
}

/* ---------- Robust timezone helpers (works for any IANA zone) ---------- */

/**
 * Return timezone offset in minutes for `date` at `timeZone`.
 * Implementation: format `date` in the timeZone with formatToParts, then compute difference
 * between the UTC instant of that formatted local parts and date.getTime().
 */
function getOffsetMinutesForInstant(date: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = p.value;
  }
  // parts give the representation of `date` in `timeZone`. Compute UTC milliseconds of that wall-clock:
  const y = Number(map.year);
  const mo = Number(map.month) - 1;
  const d = Number(map.day);
  const hh = Number(map.hour);
  const mm = Number(map.minute);
  const ss = Number(map.second);
  const utcOfLocal = Date.UTC(y, mo, d, hh, mm, ss);
  // offsetMinutes = (utcOfLocal - date.getTime()) / 60000
  return (utcOfLocal - date.getTime()) / 60000;
}

/**
 * Create a Date (UTC instant) that corresponds to the wall-clock Y/M/D H:M in `timeZone`.
 * We iteratively solve:
 *   utc = Date.UTC(y,m,d,h,min) - offsetMinutes(utc)
 * offsetMinutes depends on utc, so iterate a couple times; this converges quickly.
 */
function zonedDate(year: number, month: number, day: number, hour = 0, minute = 0, timeZone?: string) {
  // if no timeZone, return local-wall-clock instant (consistent with previous behavior)
  if (!timeZone) {
    return new Date(year, month, day, hour, minute, 0, 0);
  }

  const localUtcMillis = Date.UTC(year, month, day, hour, minute, 0, 0); // UTC ms for those fields
  let utc = localUtcMillis;
  // iterate 3 times max (typical convergence)
  for (let i = 0; i < 3; i++) {
    const offsetMinutes = getOffsetMinutesForInstant(new Date(utc), timeZone);
    const newUtc = localUtcMillis - offsetMinutes * 60_000;
    if (Math.abs(newUtc - utc) < 1) {
      utc = newUtc;
      break;
    }
    utc = newUtc;
  }
  return new Date(utc);
}

/**
 * Given a Date `base` (should represent midnight of calendar day in timeZone), return Date for that day+hour:minute in timeZone.
 */
function makeInTZFromBase(base: Date, hour: number, minute: number, timeZone?: string) {
  const y = base.getFullYear();
  const m = base.getMonth();
  const d = base.getDate();
  return zonedDate(y, m, d, hour, minute, timeZone);
}

/* ---------- component ---------- */
export default function TimePickerModal({
  show,
  onClose,
  mode,
  weekdayText,
  timeZone = "America/Chicago", // default to Chicago
  slotMinutes = 15,
  daysAhead = 9,
  onConfirm,
  asapEstimateMinutes = 50,
}: TimePickerModalProps) {
  // nowInTZ is the current instant (Date) expressed for comparisons but representing the same absolute moment
  const nowInTZ = useMemo(
    () => (timeZone ? new Date(new Date().toLocaleString("en-US", { timeZone })) : new Date()),
    [timeZone, show]
  );

  const dayMap = useMemo(() => weekdayTextToMap(weekdayText), [weekdayText]);

  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [expandedDates, setExpandedDates] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  const dateGridRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const setBtnRef = useCallback((idx: number) => {
    return (el: HTMLButtonElement | null) => {
      buttonRefs.current[idx] = el;
    };
  }, []);

  useEffect(() => {
    if (!show) {
      setSelectedDateIndex(0);
      setSelectedSlot(null);
      setExpandedDates(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  // Build days anchored to midnight in the target timezone
  const days = useMemo(() => {
    const list: { label: string; date: Date; jsDay: number }[] = [];
    for (let i = 0; i < daysAhead; i++) {
      // Reference date based on nowInTZ
      const temp = new Date(nowInTZ);
      temp.setDate(nowInTZ.getDate() + i);
      // Create midnight in target timezone for that calendar day
      const midnightInTZ = zonedDate(temp.getFullYear(), temp.getMonth(), temp.getDate(), 0, 0, timeZone);
      list.push({
        label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : formatShortWeekday(midnightInTZ),
        date: midnightInTZ,
        jsDay: new Date(midnightInTZ.getFullYear(), midnightInTZ.getMonth(), midnightInTZ.getDate()).getDay(),
      });
    }
    return list;
  }, [nowInTZ, daysAhead, timeZone]);

  const visibleDates = useMemo(() => {
    if (expandedDates) {
      const max = Math.min(days.length, 9);
      return days.slice(0, max);
    }
    if (selectedDateIndex === 0) return days.slice(0, 2);
    if (selectedDateIndex === 1) return days.slice(0, 2);
    return [days[0], days[selectedDateIndex]];
  }, [days, expandedDates, selectedDateIndex]);

  const selectedWindow = dayMap[days[selectedDateIndex].jsDay];

  // compute timezone-aware slots
  const slots = useMemo(() => {
    const out: { label: string; date: Date }[] = [];
    if (!selectedWindow || !selectedWindow.open || !selectedWindow.close) return out;

    const [oh, om] = selectedWindow.open.split(":").map((s) => parseInt(s, 10));
    const [ch, cm] = selectedWindow.close.split(":").map((s) => parseInt(s, 10));

    const base = days[selectedDateIndex].date; // midnight in timeZone
    const openDate = makeInTZFromBase(base, oh, om, timeZone);
    let closeDate = makeInTZFromBase(base, ch, cm, timeZone);
    if (closeDate.getTime() <= openDate.getTime()) closeDate = addMinutes(closeDate, 24 * 60);

    let cur = new Date(openDate);
    while (cur.getTime() + slotMinutes * 60000 <= closeDate.getTime()) {
      out.push({ label: formatTime(cur, timeZone), date: new Date(cur) });
      cur = addMinutes(cur, slotMinutes);
    }

    // hide past slots for today (compared in timezone-aware nowInTZ)
    const selectedDate = days[selectedDateIndex].date;
    const isSelectedDayToday =
      selectedDate.getFullYear() === nowInTZ.getFullYear() &&
      selectedDate.getMonth() === nowInTZ.getMonth() &&
      selectedDate.getDate() === nowInTZ.getDate();

    if (isSelectedDayToday) return out.filter((s) => s.date.getTime() > nowInTZ.getTime());
    return out;
  }, [selectedWindow, days, selectedDateIndex, slotMinutes, timeZone, nowInTZ]);

  const asapAvailable = useMemo(() => {
    if (!selectedWindow || !selectedWindow.open || !selectedWindow.close) return false;
    const [oh, om] = selectedWindow.open.split(":").map((s) => parseInt(s, 10));
    const [ch, cm] = selectedWindow.close.split(":").map((s) => parseInt(s, 10));
    const open = makeInTZFromBase(days[selectedDateIndex].date, oh, om, timeZone);
    let close = makeInTZFromBase(days[selectedDateIndex].date, ch, cm, timeZone);
    if (close.getTime() <= open.getTime()) close = addMinutes(close, 24 * 60);

    const selectedDate = days[selectedDateIndex].date;
    const isToday =
      selectedDate.getFullYear() === nowInTZ.getFullYear() &&
      selectedDate.getMonth() === nowInTZ.getMonth() &&
      selectedDate.getDate() === nowInTZ.getDate();

    return isToday && nowInTZ.getTime() >= open.getTime() && nowInTZ.getTime() <= close.getTime();
  }, [selectedWindow, days, selectedDateIndex, nowInTZ, timeZone]);

  const handleConfirm = () => {
    if (!selectedSlot && !asapAvailable) return;
    // when ASAP, use nowInTZ (an absolute instant consistent with the displayed timezone)
    const iso = selectedSlot ? selectedSlot.toISOString() : nowInTZ.toISOString();
    onConfirm(iso);
    onClose();
  };

  const handleSelectDate = (globalIndex: number) => {
    if (globalIndex === selectedDateIndex) {
      setExpandedDates(false);
      setTimeout(() => {
        const btn = buttonRefs.current[globalIndex];
        if (btn && dateGridRef.current) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }, 220);
      return;
    }

    setSelectedSlot(null);
    setSelectedDateIndex(globalIndex);
    setExpandedDates(false);

    setTimeout(() => {
      const btn = buttonRefs.current[globalIndex];
      if (btn && dateGridRef.current) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }, 220);
  };

  const handleSlotClick = (slotDate: Date | null) => {
    if (slotDate === null) {
      setSelectedSlot(null);
      return;
    }
    setSelectedSlot((prev) => (prev && prev.getTime() === slotDate.getTime() ? null : new Date(slotDate)));
  };

  return (
    <Modal show={show} onHide={onClose} centered dialogClassName="timepicker-modal" contentClassName="rounded-4 shadow-lg">
      <style jsx>{`
        .timepicker-modal .modal-content { background: #0b0b0b; border-radius: 16px; color: #fff; }
        .date-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 12px; align-items:center; }
        .date-grid-wrapper { overflow: hidden; transition: max-height 300ms ease, opacity 220ms ease; max-height: 120px; }
        .date-grid-wrapper.expanded { max-height: 520px; }
        .date-pill { border-radius: 12px; display: flex; justify-content: space-between; align-items: center; gap: 8px; transition: transform 160ms ease, background 160ms ease, box-shadow 160ms ease; }
        .date-pill:hover { transform: translateY(-2px); }
        .date-pill.active { background: #e8841e; border-color: #e8841e; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
        .date-left { font-weight: 600; }
        .date-right { font-size: 12px; opacity: 0.95; background: rgba(255,255,255,0.02); padding: 6px 8px; border-radius: 8px; }
        .slots-scroll { max-height: 46vh; overflow:auto; padding-bottom: 12px; }
        .slot-row { display:flex; align-items:center; gap:12px; padding:14px 12px; border-bottom:1px solid rgba(255,255,255,0.04); cursor:pointer; transition: background 120ms ease; font-size: 14px; border-radius: 10px;}
        .slot-row:hover { background: #fff4e9; }
        .slot-row:hover .slot-radio{border-color: #00282a;}
        .slot-row:hover .slot-radio.checked{border-color: #00282a; background: #00282a;}
        .slot-row:has(.slot-radio.checked) { background-color: #00282a; color: #fff; }
        .slot-row:has(.slot-radio.checked) .slot-radio.checked{ border-color: #e8841e; background: #e8841e; }
        .slot-row:has(.slot-radio.checked):hover .slot-radio.checked{ border-color: #e8841e; background: #e8841e; }
        .slot-radio { width:22px; height:22px; border-radius:50%; border:2px solid #e8841e; display:inline-block; flex:0 0 22px; position:relative; }
        .slot-radio.checked { background: #e8841e; border-color: #e8841e; }
        .slot-label { font-weight:600; }
        .modal-footer.sticky { position: sticky; bottom: 0; background: transparent; padding-top:10px; padding-bottom: 10px; margin-top: 8px; border-top: none; }
        .schedule-btn { width: 100%; border-radius: 10px; padding: 12px 18px; background: #00282a; border: none; color: #fff; font-weight:600; }
        .more-btn { display:flex; align-items:center; justify-content:center; gap: 8px; }
        .chev { width: 14px; height: 14px; display:inline-block; transition: transform 200ms ease; }
        .chev.rotated { transform: rotate(180deg); }
        @media (min-width: 768px) { .date-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>

      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold">Order time</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className={`date-grid-wrapper ${expandedDates ? "expanded" : ""}`}>
          <div className="date-grid" ref={dateGridRef}>
            {visibleDates.map((d) => {
              const globalIndex = days.findIndex((x) => x.date.getTime() === d.date.getTime());
              return (
                <button ref={setBtnRef(globalIndex)} key={d.date.toISOString()} type="button"
                  className={`btn btn-sm btn-outline-dark date-pill ${selectedDateIndex === globalIndex ? "active" : ""}`}
                  onClick={() => handleSelectDate(globalIndex)}>
                  <div className="date-left">{d.label}</div>
                  <div className="date-right">{formatMonthDay(d.date)}</div>
                </button>
              );
            })}

            {expandedDates && days.slice(visibleDates.length).map((d) => {
              const globalIndex = days.findIndex((x) => x.date.getTime() === d.date.getTime());
              return (
                <button ref={setBtnRef(globalIndex)} key={`extra-${d.date.toISOString()}`} type="button"
                  className={`btn btn-sm btn-outline-dark date-pill ${selectedDateIndex === globalIndex ? "active" : ""}`}
                  onClick={() => handleSelectDate(globalIndex)}>
                  <div className="date-left">{d.label}</div>
                  <div className="date-right">{formatMonthDay(d.date)}</div>
                </button>
              );
            })}
          </div>
        </div>

        {days.length > 2 && (
          <div className="mb-3 text-center">
            <button className="more-btn btn btn-outline-dark w-100" onClick={() => setExpandedDates((s) => !s)} type="button" aria-expanded={expandedDates}>
              <span>{expandedDates ? "Less dates" : "More dates"}</span>
              <svg className={`chev ${expandedDates ? "rotated" : ""}`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        <div className="mb-2 small text-muted">
          {selectedWindow && selectedWindow.open ? <span>Open: {selectedWindow.open} — {selectedWindow.close}</span> : <span className="text-danger">Closed</span>}
        </div>

        <div className="slots-scroll">
          {selectedDateIndex === 0 && asapAvailable && (
            <div className={`slot-row`} onClick={() => handleSlotClick(null)}>
              <div className={`slot-radio ${selectedSlot === null ? "checked" : ""}`} />
              <div>
                <div className="slot-label">Order ASAP {asapEstimateMinutes ? ` (~${asapEstimateMinutes} min)` : ""} {timeZone ? ` ${getTzAbbrevWithFallback(nowInTZ, timeZone)}` : ""}</div>
                <div className="small text-muted">{formatTime(nowInTZ, timeZone)}</div>
              </div>
            </div>
          )}

          {slots.map((s, i) => {
            const isSelected = selectedSlot && selectedSlot.getTime() === s.date.getTime();
            const tzAbbrev = timeZone ? getTzAbbrevWithFallback(s.date, timeZone) : "";
            return (
              <div key={i} className="slot-row" onClick={() => handleSlotClick(new Date(s.date))}>
                <div className={`slot-radio ${isSelected ? "checked" : ""}`} />
                <div style={{ flex: 1 }}>
                  <div className="slot-label">{s.label} {tzAbbrev ? ` ${tzAbbrev}` : ""}</div>
                </div>
              </div>
            );
          })}

          {slots.length === 0 && <div className="text-center text-muted py-4">No available slots for this date</div>}
        </div>
      </Modal.Body>

      <Modal.Footer className="sticky">
        <div style={{ width: "100%" }}>
          <Button className="schedule-btn btn-brand-green btn-wide" onClick={handleConfirm} disabled={!asapAvailable && !selectedSlot}>
            {mode === "pickup" ? "Schedule Pickup" : "Schedule Delivery"}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
