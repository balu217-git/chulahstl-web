// components/TimePickerModal.tsx
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
  // e.g. "Nov 15"
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function formatShortWeekday(date: Date) {
  // e.g. "Sat"
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

/* ---------- timezone abbrev helper (Intl + small fallback) ---------- */
/**
 * Returns a timezone short label for a given date and IANA timezone, preferring
 * Intl.DateTimeFormat(..., { timeZoneName: "short" }). Falls back to a small mapping
 * (e.g. "America/Chicago" -> ["CST","CDT"]) if Intl doesn't provide a readable short name.
 */
const tzFallbackMap: Record<string, [string, string]> = {
  "America/Chicago": ["CST", "CDT"],
  "America/New_York": ["EST", "EDT"],
  "America/Denver": ["MST", "MDT"],
  "America/Los_Angeles": ["PST", "PDT"],
  "Europe/London": ["GMT", "BST"],
  // add more zones you need
};

function getTzAbbrevWithFallback(date: Date, timeZone?: string) {
  if (!timeZone) return "";
  // 1) try Intl
  try {
    const formatted = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" }).format(date);
    // formatted examples: "11/1/2025, 9:00 PM CST" or "9:00 PM GMT+2" depending on runtime
    const parts = formatted.split(" ");
    const last = parts[parts.length - 1].replace(/[.,]/g, "");
    // Accept typical short alphabetic abbr like "CST", "CDT", "BST" or "GMT+2"
    if (/^[A-Za-z]{2,5}$/.test(last) || /^GMT/.test(last)) return last;
  } catch (e) {
    // fallthrough to fallback below
  }

  // 2) fallback mapping if available
  const pair = tzFallbackMap[timeZone];
  if (pair) {
    // determine whether this date is in DST in that timezone by comparing offsets
    try {
      // compute offset (minutes) of the timezone for the date and for Jan/Jul to detect DST usage
      const offsetForDate = new Date(date.toLocaleString("en-US", { timeZone })).getTimezoneOffset();
      const jan = new Date(date.getFullYear(), 0, 1);
      const jul = new Date(date.getFullYear(), 6, 1);
      const janOffset = new Date(jan.toLocaleString("en-US", { timeZone })).getTimezoneOffset();
      const julOffset = new Date(jul.toLocaleString("en-US", { timeZone })).getTimezoneOffset();
      const usesDST = janOffset !== julOffset;
      if (!usesDST) return pair[0];
      // pick based on actual offset comparison (safer than month heuristic)
      // If offsetForDate equals the smaller offset -> DST (because DST usually reduces offset minutes)
      const smallerOffset = Math.min(janOffset, julOffset);
      const inDST = offsetForDate === smallerOffset;
      return inDST ? pair[1] : pair[0];
    } catch (e) {
      // in case of any error, choose standard
      return pair[0];
    }
  }

  return "";
}

/* ---------- component ---------- */
export default function TimePickerModal({
  show,
  onClose,
  mode,
  weekdayText,
  timeZone,
  slotMinutes = 15,
  daysAhead = 9, // Today + Tomorrow + up to 7 more when expanded
  onConfirm,
}: TimePickerModalProps) {
  // compute "now" in provided timezone for consistent comparisons
  const nowInTZ = useMemo(
    () => (timeZone ? new Date(new Date().toLocaleString("en-US", { timeZone })) : new Date()),
    [timeZone, show]
  );

  const dayMap = useMemo(() => weekdayTextToMap(weekdayText), [weekdayText]);

  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [expandedDates, setExpandedDates] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  // refs for scrolling selected date into view
  const dateGridRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  // type-safe ref factory: returns a callback ref that assigns and returns void
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

  const days = useMemo(() => {
    const list: { label: string; date: Date; jsDay: number }[] = [];
    for (let i = 0; i < daysAhead; i++) {
      const d = new Date(nowInTZ);
      d.setDate(nowInTZ.getDate() + i);
      list.push({
        label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : formatShortWeekday(d),
        date: new Date(d.getFullYear(), d.getMonth(), d.getDate()),
        jsDay: new Date(d.getFullYear(), d.getMonth(), d.getDate()).getDay(),
      });
    }
    return list;
  }, [nowInTZ, daysAhead]);

  // visibleDates: custom behavior:
  // - when expanded: show up to 9 (Today + Tomorrow + 7)
  // - when collapsed: show Today + Tomorrow normally, BUT if a different date is selected,
  //   show Today + selected date (so selected area remains visible)
  const visibleDates = useMemo(() => {
    if (expandedDates) {
      const max = Math.min(days.length, 9);
      return days.slice(0, max);
    }
    // collapsed:
    if (selectedDateIndex === 0) return days.slice(0, 2); // Today + Tomorrow
    // selected date isn't today: make compact view show Today + selected
    const selected = days[selectedDateIndex];
    // if selected is tomorrow (index 1) -> same as default
    if (selectedDateIndex === 1) return days.slice(0, 2);
    // otherwise show Today + selected
    return [days[0], selected];
  }, [days, expandedDates, selectedDateIndex]);

  const selectedWindow = dayMap[days[selectedDateIndex].jsDay];

  // compute slots
  const slots = useMemo(() => {
    const out: { label: string; date: Date }[] = [];
    if (!selectedWindow || !selectedWindow.open || !selectedWindow.close) return out;

    const [oh, om] = selectedWindow.open.split(":").map((s) => parseInt(s, 10));
    const [ch, cm] = selectedWindow.close.split(":").map((s) => parseInt(s, 10));

    const base = new Date(days[selectedDateIndex].date);
    const openDate = new Date(base);
    openDate.setHours(oh, om, 0, 0);
    let closeDate = new Date(base);
    closeDate.setHours(ch, cm, 0, 0);
    if (closeDate.getTime() <= openDate.getTime()) closeDate = addMinutes(closeDate, 24 * 60);

    let cur = new Date(openDate);
    while (cur.getTime() + slotMinutes * 60000 <= closeDate.getTime()) {
      out.push({ label: formatTime(cur, timeZone), date: new Date(cur) });
      cur = addMinutes(cur, slotMinutes);
    }

    // hide past slots for the selected date (compared in timezone)
    const selectedDate = days[selectedDateIndex].date;
    const isSelectedDayToday =
      selectedDate.getFullYear() === nowInTZ.getFullYear() &&
      selectedDate.getMonth() === nowInTZ.getMonth() &&
      selectedDate.getDate() === nowInTZ.getDate();

    if (isSelectedDayToday) {
      // allow slots strictly after nowInTZ
      return out.filter((s) => s.date.getTime() > nowInTZ.getTime());
    }
    return out;
  }, [selectedWindow, days, selectedDateIndex, slotMinutes, timeZone, nowInTZ]);

  // ASAP availability for today (only if now is within today's open window)
  const asapAvailable = useMemo(() => {
    if (!selectedWindow || !selectedWindow.open || !selectedWindow.close) return false;
    const [oh, om] = selectedWindow.open.split(":").map((s) => parseInt(s, 10));
    const [ch, cm] = selectedWindow.close.split(":").map((s) => parseInt(s, 10));
    const open = new Date(days[selectedDateIndex].date);
    open.setHours(oh, om, 0, 0);
    const close = new Date(days[selectedDateIndex].date);
    close.setHours(ch, cm, 0, 0);
    if (close.getTime() <= open.getTime()) close.setDate(close.getDate() + 1);

    // ASAP valid only when *today* and now is between open and close
    const selectedDate = days[selectedDateIndex].date;
    const isToday =
      selectedDate.getFullYear() === nowInTZ.getFullYear() &&
      selectedDate.getMonth() === nowInTZ.getMonth() &&
      selectedDate.getDate() === nowInTZ.getDate();

    return isToday && nowInTZ.getTime() >= open.getTime() && nowInTZ.getTime() <= close.getTime();
  }, [selectedWindow, days, selectedDateIndex, nowInTZ]);

  const handleConfirm = () => {
    if (!selectedSlot && !asapAvailable) return;
    const chosen = selectedSlot ?? new Date();
    onConfirm(chosen.toISOString());
    onClose();
  };

  // when user selects a date from the expanded list: collapse and scroll selected into view
  const handleSelectDate = (globalIndex: number) => {
    // if the same date clicked, keep selection (no-op)
    if (globalIndex === selectedDateIndex) {
      // if expanded, collapse so user can see compact highlight
      setExpandedDates(false);
      setTimeout(() => {
        const btn = buttonRefs.current[globalIndex];
        if (btn && dateGridRef.current) btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }, 220);
      return;
    }

    // date changed -> clear selected slot (prevent stale)
    setSelectedSlot(null);
    setSelectedDateIndex(globalIndex);

    // collapse the list so compact view shows Today + selected
    setExpandedDates(false);

    // scroll selected button into view after collapse
    setTimeout(() => {
      const btn = buttonRefs.current[globalIndex];
      if (btn && dateGridRef.current) {
        btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }, 220); // match collapse transition timing
  };

  // toggle slot selection: clicking same slot deselects it
  const handleSlotClick = (slotDate: Date | null) => {
    if (slotDate === null) {
      // selecting ASAP always sets selectedSlot to null (ASAP sentinel)
      setSelectedSlot(null);
      return;
    }
    setSelectedSlot((prev) => (prev && prev.getTime() === slotDate.getTime() ? null : new Date(slotDate)));
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      dialogClassName="timepicker-modal"
      contentClassName="rounded-4 shadow-lg"
    >
      <style jsx>{`
        .timepicker-modal .modal-content { background: #0b0b0b; border-radius: 16px; color: #fff; }
        .date-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 12px; align-items:center; }
        .date-grid-wrapper { overflow: hidden; transition: max-height 300ms ease, opacity 220ms ease; max-height: 120px; }
        .date-grid-wrapper.expanded { max-height: 520px; }
        .date-pill {
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          transition: transform 160ms ease, background 160ms ease, box-shadow 160ms ease;
        }
        .date-pill:hover { transform: translateY(-2px); }
        .date-pill.active { background: #e8841e; border-color: #e8841e; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
        .date-left { font-weight: 600; }
        .date-right { font-size: 12px; opacity: 0.95; background: rgba(255,255,255,0.02); padding: 6px 8px; border-radius: 8px; }
        .slots-scroll { max-height: 46vh; overflow:auto; padding-bottom: 12px; }
        .slot-row { display:flex; align-items:center; gap:12px; padding:14px 12px; border-bottom:1px solid rgba(255,255,255,0.04); cursor:pointer; transition: background 120ms ease; font-size: 14px; border-radius: 10px;}
        .slot-row:hover { background: #fff4e9; }
        .slot-row:hover .slot-radio{border-color: #00282a;}
        .slot-row:hover .slot-radio.checked{border-color: #00282a; background: #00282a;}
        .slot-row:has(.slot-radio.checked) {
  background-color: #00282a;
  color: #fff;
}
  .slot-row:has(.slot-radio.checked) .slot-radio.checked{
      border-color: #e8841e; background: #e8841e;
  }
  .slot-row:has(.slot-radio.checked):hover .slot-radio.checked{
      border-color: #e8841e; background: #e8841e;
  }
        .slot-radio { width:22px; height:22px; border-radius:50%; border:2px solid #e8841e; display:inline-block; flex:0 0 22px; position:relative; }
        .slot-radio.checked { background: #e8841e; border-color: #e8841e; }
        .slot-label { font-weight:600; }
        .modal-footer.sticky { position: sticky; bottom: 0; background: transparent; padding-top:10px; padding-bottom: 10px; margin-top: 8px; border-top: none; }
        .schedule-btn { width: 100%; border-radius: 10px; padding: 12px 18px; background: #00282a; border: none; color: #fff; font-weight:600; }

        .more-btn { display:flex; align-items:center; justify-content:center; gap: 8px; }
        .chev { width: 14px; height: 14px; display:inline-block; transition: transform 200ms ease; }
        .chev.rotated { transform: rotate(180deg); }

        /* small responsiveness */
        @media (min-width: 768px) {
          .date-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold">Order time</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* animated date grid wrapper */}
        <div className={`date-grid-wrapper ${expandedDates ? "expanded" : ""}`}>
          <div className="date-grid" ref={dateGridRef}>
            {visibleDates.map((d) => {
              // map visible date back to its global index in days[]
              const globalIndex = days.findIndex((x) => x.date.getTime() === d.date.getTime());
              return (
                <button
                  ref={setBtnRef(globalIndex)}
                  key={d.date.toISOString()}
                  type="button"
                  className={`btn btn-sm btn-outline-dark date-pill ${selectedDateIndex === globalIndex ? "active" : ""}`}
                  onClick={() => handleSelectDate(globalIndex)}
                >
                  <div className="date-left">{d.label}</div>
                  <div className="date-right">{formatMonthDay(d.date)}</div>
                </button>
              );
            })}

            {expandedDates &&
              days.slice(visibleDates.length).map((d) => {
                const globalIndex = days.findIndex((x) => x.date.getTime() === d.date.getTime());
                return (
                  <button
                    ref={setBtnRef(globalIndex)}
                    key={`extra-${d.date.toISOString()}`}
                    type="button"
                    className={`btn btn-sm btn-outline-dark date-pill ${selectedDateIndex === globalIndex ? "active" : ""}`}
                    onClick={() => handleSelectDate(globalIndex)}
                  >
                    <div className="date-left">{d.label}</div>
                    <div className="date-right">{formatMonthDay(d.date)}</div>
                  </button>
                );
              })}
          </div>
        </div>

        {/* more/less toggle */}
        {days.length > 2 && (
          <div className="mb-3 text-center">
            <button
              className="more-btn btn btn-outline-dark w-100"
              onClick={() => setExpandedDates((s) => !s)}
              type="button"
              aria-expanded={expandedDates}
            >
              <span>{expandedDates ? "Less dates" : "More dates"}</span>
              <svg
                className={`chev ${expandedDates ? "rotated" : ""}`}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        {/* open/closed info */} 
        <div className="mb-2 small text-muted">
          {selectedWindow && selectedWindow.open ? (
            <span>Open: {selectedWindow.open} — {selectedWindow.close}</span>
          ) : (
            <span className="text-danger">Closed</span>
          )}
        </div>

        {/* slots area */}
        <div className="slots-scroll">
          {/* ASAP */}
          {selectedDateIndex === 0 && asapAvailable && (
            <div className={`slot-row`} onClick={() => handleSlotClick(null)}>
              <div className={`slot-radio ${selectedSlot === null ? "checked" : ""}`} />
              <div>
                <div className="slot-label">Order ASAP {timeZone ? ` ${getTzAbbrevWithFallback(new Date(), timeZone)}` : ""}</div>
                <div className="small text-muted">{formatTime(new Date(), timeZone)}</div>
              </div>
            </div>
          )}

          {/* slots */}
          {slots.map((s, i) => {
            const isSelected = selectedSlot && selectedSlot.getTime() === s.date.getTime();
            // tz abbreviation for this slot (CST/CDT depending on date)
            const tzAbbrev = timeZone ? getTzAbbrevWithFallback(s.date, timeZone) : "";
            return (
              <div
                key={i}
                className="slot-row"
                onClick={() => handleSlotClick(new Date(s.date))}
              >
                <div className={`slot-radio ${isSelected ? "checked" : ""}`} />
                <div style={{ flex: 1 }}>
                  <div className="slot-label">
                    {s.label} {tzAbbrev ? ` ${tzAbbrev}` : ""}
                  </div>
                </div>
              </div>
            );
          })}

          {slots.length === 0 && <div className="text-center text-muted py-4">No available slots for this date</div>}
        </div>
      </Modal.Body>

      <Modal.Footer className="sticky">
        <div style={{ width: "100%" }}>
          <Button className="schedule-btn btn-brand-green" onClick={handleConfirm} disabled={!asapAvailable && !selectedSlot}>
            {mode === "pickup" ? "Schedule Pickup" : "Schedule Delivery"}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
