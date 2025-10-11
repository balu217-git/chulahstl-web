"use client";

import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    message?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false); // new state for button

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // clear error on change
  };

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");

    // Validation
    const newErrors: typeof errors = {};
    if (!formData.name || formData.name.trim().length < 2)
      newErrors.name = "Name must be at least 2 characters.";
    if (!formData.email || !validateEmail(formData.email))
      newErrors.email = "Please enter a valid email.";
    if (!formData.message || formData.message.trim().length < 5)
      newErrors.message = "Message must be at least 5 characters.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true); // disable button
      setStatus("Submitting...");

      const res = await fetch(`/api/submit-contact-form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setStatus(data.message);
      setFormData({ name: "", email: "", message: "" }); // reset form
    } catch (error) {
      setStatus("Something went wrong!");
    } finally {
      setIsSubmitting(false); // enable button again
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <input
            type="text"
            name="name"
            className="form-control"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        <div className="form-group mb-3">
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
        </div>
        <div className="form-group mb-3">
          <textarea
            className="form-control"
            name="message"
            rows={4}
            placeholder="Message"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>
          {errors.message && (
            <p className="text-red-500 text-sm">{errors.message}</p>
          )}
        </div>
        <button type="submit" className={`btn btn-wide btn-brand-green px-4 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={isSubmitting}>
          Submit
        </button>
      </form>
      {status && <p className="mt-3">{status}</p>}
    </div>
  );
}
