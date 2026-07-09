"use client";

import { useState } from "react";

type QuickLeadFormProps = {
  title: string;
  description: string;
  projectType: string;
  formType: "free_consultation" | "website_audit_request";
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
    websiteUrl: "",
    budgetRange: "not_sure",
    timeline: "asap",
    message: "",
    website: "",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          formType,
          projectType,
          submittedAt: Date.now() - 1800,
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
        websiteUrl: "",
        budgetRange: "not_sure",
        timeline: "asap",
        message: "",
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
          value={formData.phone}
          onChange={(event) =>
            setFormData((current) => ({ ...current, phone: event.target.value }))
          }
        />

        {formType === "website_audit_request" ? (
          <>
            <label htmlFor={`${formType}-website-url`}>Website URL</label>
            <input
              id={`${formType}-website-url`}
              type="url"
              placeholder="https://example.com"
              required
              value={formData.websiteUrl}
              onChange={(event) =>
                setFormData((current) => ({ ...current, websiteUrl: event.target.value }))
              }
            />
          </>
        ) : null}

        <label htmlFor={`${formType}-budget`}>Budget Range</label>
        <select
          id={`${formType}-budget`}
          value={formData.budgetRange}
          onChange={(event) =>
            setFormData((current) => ({ ...current, budgetRange: event.target.value }))
          }
        >
          <option value="not_sure">Not sure yet</option>
          <option value="under_2k">Under $2k</option>
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
          <option value="1_2_months">1-2 months</option>
          <option value="this_quarter">This quarter</option>
          <option value="exploring">Exploring options</option>
        </select>

        <label htmlFor={`${formType}-message`}>Details</label>
        <textarea
          id={`${formType}-message`}
          rows={4}
          required
          value={formData.message}
          onChange={(event) =>
            setFormData((current) => ({ ...current, message: event.target.value }))
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
