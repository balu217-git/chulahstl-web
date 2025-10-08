"use client";

interface AttendanceRangeProps {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}

export default function AttendanceRange({ min, max, onChange }: AttendanceRangeProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newVal = Number(value);

    if (name === "min" && newVal <= max) {
      onChange(newVal, max);
    } else if (name === "max" && newVal >= min) {
      onChange(min, newVal);
    }
  };

  const minPercent = (min / 100) * 100;
  const maxPercent = (max / 100) * 100;

  return (
    <div className="mb-4">
      <label className="form-label mb-3">
        Attendance* ({min} – {max})
      </label>
      <div className="slider-wrapper">
        <input
          type="range"
          name="min"
          min="0"
          max="100"
          step="5"
          value={min}
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
          value={max}
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
