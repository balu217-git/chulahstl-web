"use client";

interface AttendanceRangeProps {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
  rangeLimit?: number; // new prop (default 100)
  step?: number; // optional step customization (default 5)
}

export default function AttendanceRange({
  min,
  max,
  onChange,
  rangeLimit = 100, // default limit
  step = 5, // default step
}: AttendanceRangeProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newVal = Number(value);

    if (name === "min" && newVal <= max) {
      onChange(newVal, max);
    } else if (name === "max" && newVal >= min) {
      onChange(min, newVal);
    }
  };

  const minPercent = (min / rangeLimit) * 100;
  const maxPercent = (max / rangeLimit) * 100;

  const sliderStyle = {
    background: `linear-gradient(
      to right,
      #ddd ${minPercent}%,
      var(--brand-green) ${minPercent}%,
      var(--brand-green) ${maxPercent}%,
      #ddd ${maxPercent}%
    )`,
  };

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
          max={rangeLimit}
          step={step}
          value={min}
          onChange={handleChange}
          className="thumb thumb-left"
          style={sliderStyle}
        />
        <input
          type="range"
          name="max"
          min="0"
          max={rangeLimit}
          step={step}
          value={max}
          onChange={handleChange}
          className="thumb thumb-right"
          style={sliderStyle}
        />
      </div>
    </div>
  );
}
