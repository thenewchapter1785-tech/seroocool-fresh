"use client";

import { useState } from "react";
import { submitLeadForm } from "@/lib/client/lead-form-submit";

type SubmitState = "idle" | "sending" | "success" | "error";

type BookingFormState = {
  name: string;
  email: string;
  phone: string;
  preferredContactMethod: string;
  audienceType: string;
  appointmentType: (typeof appointmentTypes)[number];
  preferredDate: string;
  urgency: string;
  details: string;
  website: string;
  submittedAt: number;
};

const appointmentTypes = [
  "Phone Call",
  "Video Call",
  "Remote Support",
  "Computer Repair Drop-Off",
  "Website Consultation",
  "AI Automation Consultation",
  "Business Tech Review",
  "Emergency Support",
] as const;

export default function BookingForm() {
  const [state, setState] = useState<SubmitState>("idle");
  const [errorText, setErrorText] = useState("");
  const [formData, setFormData] = useState<BookingFormState>(() => ({
    name: "",
    email: "",
    phone: "",
    preferredContactMethod: "email",
    audienceType: "personal",
    appointmentType: appointmentTypes[0],
    preferredDate: "",
    urgency: "normal",
    details: "",
    website: "",
    submittedAt: Date.now() - 2000,
  }));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setErrorText("");

    try {
      const payload = await submitLeadForm("/api/contact", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        preferredContactMethod: formData.preferredContactMethod,
        audienceType: formData.audienceType,
        urgency: formData.urgency,
        projectType: formData.appointmentType,
        timeline: formData.preferredDate || "flexible",
        message: [
          `Appointment type: ${formData.appointmentType}`,
          `Preferred date/time: ${formData.preferredDate || "not provided"}`,
          `Request details: ${formData.details || "not provided"}`,
        ].join("\n"),
        formType: "appointment_booking",
        website: formData.website,
      });

      if (!payload.ok) {
        throw new Error(payload.message ?? "Could not submit booking request");
      }

      setState("success");
      setFormData((current) => ({
        ...current,
        name: "",
        email: "",
        phone: "",
        preferredDate: "",
        details: "",
        website: "",
      }));
    } catch (error) {
      setState("error");
      setErrorText(error instanceof Error ? error.message : "Booking failed");
    }
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <label htmlFor="booking-name">Name</label>
      <input
        id="booking-name"
        required
        value={formData.name}
        onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
      />

      <label htmlFor="booking-email">Email</label>
      <input
        id="booking-email"
        type="email"
        required
        value={formData.email}
        onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
      />

      <label htmlFor="booking-phone">Phone</label>
      <input
        id="booking-phone"
        required
        value={formData.phone}
        onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
      />

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label htmlFor="booking-type">Appointment Type</label>
          <select
            id="booking-type"
            value={formData.appointmentType}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                appointmentType: event.target.value as (typeof appointmentTypes)[number],
              }))
            }
          >
            {appointmentTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="booking-date">Preferred Date/Time</label>
          <input
            id="booking-date"
            placeholder="Example: Tuesday after 3 PM"
            value={formData.preferredDate}
            onChange={(event) =>
              setFormData((current) => ({ ...current, preferredDate: event.target.value }))
            }
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label htmlFor="booking-contact-method">Preferred Contact Method</label>
          <select
            id="booking-contact-method"
            value={formData.preferredContactMethod}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                preferredContactMethod: event.target.value,
              }))
            }
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="text">Text</option>
          </select>
        </div>
        <div>
          <label htmlFor="booking-audience">Business or Personal</label>
          <select
            id="booking-audience"
            value={formData.audienceType}
            onChange={(event) =>
              setFormData((current) => ({ ...current, audienceType: event.target.value }))
            }
          >
            <option value="personal">Personal</option>
            <option value="business">Business</option>
          </select>
        </div>
        <div>
          <label htmlFor="booking-urgency">Urgency</label>
          <select
            id="booking-urgency"
            value={formData.urgency}
            onChange={(event) => setFormData((current) => ({ ...current, urgency: event.target.value }))}
          >
            <option value="normal">Normal</option>
            <option value="soon">Soon</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <label htmlFor="booking-details">What do you need help with?</label>
      <textarea
        id="booking-details"
        rows={4}
        required
        value={formData.details}
        onChange={(event) => setFormData((current) => ({ ...current, details: event.target.value }))}
      />

      <div className="hidden-field" aria-hidden="true">
        <label htmlFor="booking-website">Website</label>
        <input
          id="booking-website"
          tabIndex={-1}
          autoComplete="off"
          value={formData.website}
          onChange={(event) => setFormData((current) => ({ ...current, website: event.target.value }))}
        />
      </div>

      <button type="submit" className="cta-primary" disabled={state === "sending"}>
        {state === "sending" ? "Submitting..." : "Book Appointment"}
      </button>

      {state === "success" ? (
        <p className="lead-status success">Booking request received. We will contact you shortly.</p>
      ) : null}

      {state === "error" ? <p className="lead-status error">{errorText}</p> : null}
    </form>
  );
}
