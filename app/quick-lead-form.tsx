"use client";

import { useState } from "react";
import { serviceCatalog } from "@/lib/services";

type QuickLeadFormProps = {
  title: string;
  description: string;
  projectType: string;
  formType:
    | "free_computer_diagnostic"
    | "free_website_consultation"
    | "free_business_technology_review"
    | "free_ai_automation_consultation"
    | "free_consultation"
    | "website_audit_request";
  ctaLabel: string;
};

type SubmitState = "idle" | "sending" | "success" | "error";

export default function QuickLeadForm({
  title,
  description,
  projectType,
  formType,
  ctaLabel,
}: QuickLeadFormProps) {
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    preferredContactMethod: "email",
    clientType: "personal",
    serviceNeeded: "computer-repair",
    urgency: "normal",
    budgetRange: "not_sure",
    timeline: "asap",
    problemDescription: "",
    website: "",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setError("");

    try {
      const selectedService = serviceCatalog.find(
        (service) => service.slug === formData.serviceNeeded
      );

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          preferredContactMethod: formData.preferredContactMethod,
          clientType: formData.clientType,
          projectType: selectedService?.name ?? projectType,
          formType,
          urgency: formData.urgency,
          budgetRange: formData.budgetRange,
          timeline: formData.timeline,
          message: formData.problemDescription,
          website: formData.website,
          submittedAt: Date.now() - 2000,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? "Submission failed");
      }

      setState("success");
      setFormData({
        name: "",
        email: "",
        phone: "",
        preferredContactMethod: "email",
        clientType: "personal",
        serviceNeeded: "computer-repair",
        urgency: "normal",
        budgetRange: "not_sure",
        timeline: "asap",
        problemDescription: "",
        website: "",
      });
    } catch (submitError) {
      setState("error");
      setError(submitError instanceof Error ? submitError.message : "Unable to submit request");
    }
  }

  return (
    <article className="glass-panel rounded-3xl p-6 md:p-8">
      <h3 className="section-heading">{title}</h3>
      <p className="section-copy mt-3">{description}</p>

      <form className="lead-form mt-4" onSubmit={handleSubmit}>
        <label htmlFor={`${formType}-name`}>Name</label>
        <input
          id={`${formType}-name`}
          required
          value={formData.name}
          onChange={(event) =>
            setFormData((current) => ({ ...current, name: event.target.value }))
          }
        />

        <label htmlFor={`${formType}-email`}>Email</label>
        <input
          id={`${formType}-email`}
          type="email"
          required
          value={formData.email}
          onChange={(event) =>
            setFormData((current) => ({ ...current, email: event.target.value }))
          }
        />

        <label htmlFor={`${formType}-phone`}>Phone</label>
        <input
          id={`${formType}-phone`}
          type="tel"
          required
          value={formData.phone}
          onChange={(event) =>
            setFormData((current) => ({ ...current, phone: event.target.value }))
          }
        />

        <label htmlFor={`${formType}-preferred-contact`}>Preferred Contact Method</label>
        <select
          id={`${formType}-preferred-contact`}
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
          <option value="text">Text Message</option>
        </select>

        <label htmlFor={`${formType}-client-type`}>Business or Personal</label>
        <select
          id={`${formType}-client-type`}
          value={formData.clientType}
          onChange={(event) =>
            setFormData((current) => ({ ...current, clientType: event.target.value }))
          }
        >
          <option value="personal">Personal</option>
          <option value="business">Business</option>
        </select>

        <label htmlFor={`${formType}-service`}>Service Needed</label>
        <select
          id={`${formType}-service`}
          value={formData.serviceNeeded}
          onChange={(event) =>
            setFormData((current) => ({ ...current, serviceNeeded: event.target.value }))
          }
        >
          {serviceCatalog.map((service) => (
            <option key={service.slug} value={service.slug}>
              {service.name}
            </option>
          ))}
        </select>

        <label htmlFor={`${formType}-urgency`}>Urgency</label>
        <select
          id={`${formType}-urgency`}
          value={formData.urgency}
          onChange={(event) =>
            setFormData((current) => ({ ...current, urgency: event.target.value }))
          }
        >
          <option value="normal">Normal</option>
          <option value="soon">Soon (1-3 days)</option>
          <option value="urgent">Urgent (same day)</option>
        </select>

        <label htmlFor={`${formType}-budget`}>Budget (optional)</label>
        <select
          id={`${formType}-budget`}
          value={formData.budgetRange}
          onChange={(event) =>
            setFormData((current) => ({ ...current, budgetRange: event.target.value }))
          }
        >
          <option value="not_sure">Not sure yet</option>
          <option value="under_500">Under $500</option>
          <option value="500_2k">$500 - $2k</option>
          <option value="2k_5k">$2k - $5k</option>
          <option value="5k_10k">$5k - $10k</option>
          <option value="10k_plus">$10k+</option>
        </select>

        <label htmlFor={`${formType}-timeline`}>Timeline</label>
        <select
          id={`${formType}-timeline`}
          value={formData.timeline}
          onChange={(event) =>
            setFormData((current) => ({ ...current, timeline: event.target.value }))
          }
        >
          <option value="asap">As soon as possible</option>
          <option value="1_2_weeks">1-2 weeks</option>
          <option value="1_2_months">1-2 months</option>
          <option value="exploring">Exploring options</option>
        </select>

        <label htmlFor={`${formType}-description`}>Problem Description</label>
        <textarea
          id={`${formType}-description`}
          rows={4}
          required
          value={formData.problemDescription}
          onChange={(event) =>
            setFormData((current) => ({ ...current, problemDescription: event.target.value }))
          }
        />

        <div className="hidden-field" aria-hidden="true">
          <label htmlFor={`${formType}-website`}>Website</label>
          <input
            id={`${formType}-website`}
            tabIndex={-1}
            autoComplete="off"
            value={formData.website}
            onChange={(event) =>
              setFormData((current) => ({ ...current, website: event.target.value }))
            }
          />
        </div>

        <button type="submit" className="cta-primary" disabled={state === "sending"}>
          {state === "sending" ? "Sending..." : ctaLabel}
        </button>

        {state === "success" ? (
          <p className="lead-status success">Request received. We will respond quickly.</p>
        ) : null}

        {state === "error" ? <p className="lead-status error">{error}</p> : null}
      </form>
    </article>
  );
}
