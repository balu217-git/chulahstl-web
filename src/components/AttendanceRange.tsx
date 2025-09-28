"use client";

import { useState } from "react";
// import "./range.css";

export default function AttendanceRange() {
  const [range, setRange] = useState({ min: 20, max: 60 });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRange((prev) => {
      const newVal = Number(value);
      if (name === "min" && newVal <= prev.max) {
        return { ...prev, min: newVal };
      }
      if (name === "max" && newVal >= prev.min) {
        return { ...prev, max: newVal };
      }
      return prev;
    });
  };

  // Calculate percentage for background
  const minPercent = (range.min / 100) * 100;
  const maxPercent = (range.max / 100) * 100;

  return (
    <div className="mb-4">
      <label className="form-label mb-3">
        Attendance* ({range.min} – {range.max})
      </label>
      <div className="slider-wrapper">
        <input
          type="range"
          name="min"
          min="0"
          max="100"
          step="5"
          value={range.min}
          onChange={handleChange}
          className="thumb thumb-left"
          style={{
            background: `linear-gradient(
              to right,
              #ddd ${minPercent}%,
              var(--brand-green) ${minPercent}%,
              var(--brand-green) ${maxPercent}%,
              #ddd ${maxPercent}%
            )`,
          }}
        />
        <input
          type="range"
          name="max"
          min="0"
          max="100"
          step="5"
          value={range.max}
          onChange={handleChange}
          className="thumb thumb-right"
          style={{
            background: `linear-gradient(
              to right,
              #ddd ${minPercent}%,
              var(--brand-green) ${minPercent}%,
              var(--brand-green) ${maxPercent}%,
              #ddd ${maxPercent}%
            )`,
          }}
        />
      </div>
    </div>
  );
}
