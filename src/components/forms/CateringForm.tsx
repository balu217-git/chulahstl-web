"use client";

import AttendanceRange from "../AttendanceRange";
import { useState } from "react";

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  attendance: number;
  notes: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  date?: string;
  time?: string;
  attendance?: string;
  notes?: string;
}

export default function CateringForm() {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    attendance: 5,
    notes: "",
  });

  const [status, setStatus] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: undefined });
  };

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");

    // Validation
    const newErrors: FormErrors = {};
    if (!formData.fullName || formData.fullName.trim().length < 2)
      newErrors.fullName = "Name must be at least 2 characters.";
    if (!formData.email || !validateEmail(formData.email))
      newErrors.email = "Please enter a valid email.";
    if (!formData.phone || formData.phone.trim().length < 10)
      newErrors.phone = "Please enter a valid phone number.";
    if (!formData.date) newErrors.date = "Please select a date.";
    if (!formData.time) newErrors.time = "Please select a time.";
     if (!formData.notes || formData.notes.trim().length < 5)
      newErrors.notes = "Details must be at least 5 characters.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus("Submitting...");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/submit-catering-form`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data: { message: string } = await res.json(); // typed response
      setStatus(data.message || "Submitted successfully!");

      setFormData({
        fullName: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        attendance: 5,
        notes: "",
      });
    } catch (err) {
      console.error(err);
      setStatus("Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-wrap">
      <form className="text-white" onSubmit={handleSubmit}>
        {/* Full Name */}
        <div className="mb-3">
          <label htmlFor="fullName" className="form-label">
            Full Name*
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            className="form-control"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
          />
          {errors.fullName && (
            <p className="text-brand-green">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email Address*
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-control"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="text-brand-green">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div className="mb-3">
          <label htmlFor="phone" className="form-label">
            Phone Number*
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="form-control"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
          />
          {errors.phone && <p className="text-brand-green">{errors.phone}</p>}
        </div>

        {/* Date & Time */}
        <div className="mb-3 row">
          <div className="col-md-6">
            <label htmlFor="date" className="form-label">
              Select Date*
            </label>
            <input
              type="date"
              id="date"
              name="date"
              className="form-control"
              min={new Date().toISOString().split("T")[0]} // ✅ Prevent back dates
              value={formData.date}
              onChange={handleChange}
            />
            {errors.date && <p className="text-brand-green">{errors.date}</p>}
          </div>

          <div className="col-md-6">
            <label htmlFor="time" className="form-label">
              Select Time*
            </label>
            <input
              type="time"
              id="time"
              name="time"
              className="form-control"
              value={formData.time}
              onChange={handleChange}
            />
            {errors.time && <p className="text-brand-green">{errors.time}</p>}
          </div>
        </div>

        {/* Attendance */}
        <AttendanceRange
          min={0}
          max={formData.attendance}
          onChange={(_, max) => setFormData({ ...formData, attendance: max })}
        />

        {/* Notes */}
        <div className="mb-3">
          <label htmlFor="notes" className="form-label">
            Please Fill in your Detailed Order / Instructions / Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            className="form-control"
            rows={3}
            placeholder="Enter details"
            value={formData.notes}
            onChange={handleChange}
          />
          {errors.notes && <p className="text-brand-green">{errors.notes}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`btn btn-lg btn-wide w-100 btn-brand-green fw-bold text-uppercase mt-3 ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>

        {/* Status message */}
        {status && <p className="mt-3">{status}</p>}
      </form>
    </div>
  );
}
