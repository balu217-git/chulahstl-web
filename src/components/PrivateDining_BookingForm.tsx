"use client"; // needed because we use useState + event handlers

import AttendanceRange from "./AttendanceRange";
import React, { useState } from "react";


export default function PrivateDining_BookingForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    countryCode: "US",
    phone: "",
    date: "",
    time: "",
    attendance: 50,
    notes: "",
  });

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    alert("Form submitted! Check console for details.");
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
            className="form-control"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email Address*
          </label>
          <input
            type="email"
            id="email"
            className="form-control"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Phone with Country Code */}
        <div className="mb-3 row">
          <div className="col-3">
            <label htmlFor="countryCode" className="form-label">
              Code
            </label>
            <select
              id="countryCode"
              className="form-select"
              value={formData.countryCode}
              onChange={handleChange}
            >
              <option value="US">US</option>
              <option value="IN">IN</option>
              <option value="UK">UK</option>
            </select>
          </div>
          <div className="col-9">
            <label htmlFor="phone" className="form-label">
              Phone Number*
            </label>
            <input
              type="tel"
              id="phone"
              className="form-control"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
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
              className="form-control"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="time" className="form-label">
              Select Time*
            </label>
            <input
              type="time"
              id="time"
              className="form-control"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        

        {/* Attendance */}
        <AttendanceRange />

        {/* Notes */}
        <div className="mb-3">
          <label htmlFor="notes" className="form-label">
            Additional Instructions / Notes
          </label>
          <textarea
            id="notes"
            className="form-control"
            rows={3}
            placeholder="Enter details"
            value={formData.notes}
            onChange={handleChange}
          />
        </div>

        {/* Submit */}
        <button type="submit" className="btn btn-lg btn-wide w-100 btn-brand-green fw-bold text-uppercase mt-3">
          Submit
        </button>
      </form>
    </div>
  );
}
