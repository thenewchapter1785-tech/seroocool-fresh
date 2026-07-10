"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { serviceCatalog } from "@/lib/services";

declare global {
  interface Window {
    _hsq?: Array<unknown>;
  }
}

type SubmitState = "idle" | "sending" | "success" | "error";

function detectSource(utmSource: string | null) {
  const source = (utmSource ?? "").toLowerCase();

  if (source.includes("facebook") || source === "fb") {
    return "facebook";
  }

  if (source.includes("instagram") || source === "ig") {
    return "instagram";
  }

  return "organic";
}

function getInitialTrackingData() {
  if (typeof window === "undefined") {
    return {
      utmSource: "",
      utmCampaign: "",
      source: "organic",
    };
  }

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source") ?? "";
  const utmCampaign = params.get("utm_campaign") ?? "";

  return {
    utmSource,
    utmCampaign,
    source: detectSource(utmSource),
  };
}

export default function LeadForm() {
  const router = useRouter();
  const [trackingData] = useState(getInitialTrackingData);
  const [source] = useState(trackingData.source);
  const [formStartAt] = useState(() => Date.now());
  const [state, setState] = useState<SubmitState>("idle");

  useEffect(() => {
    window._hsq?.push([
      "trackCustomBehavioralEvent",
      {
        name: "intake_form_view",
      },
    ]);
  }, []);

  const initial = useMemo(
    () => ({
      name: "",
      email: "",
      phone: "",
      preferredContactMethod: "email",
      clientType: "personal",
      serviceNeeded: "computer-repair",
      urgency: "normal",
      budgetRange: "not_sure",
      timeline: "asap",
      company: "",
      problemDescription: "",
      website: "",
    }),
    []
  );

  const [formData, setFormData] = useState(initial);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");

    window._hsq?.push([
      "trackCustomBehavioralEvent",
      {
        name: "intake_form_submit_attempt",
      },
    ]);

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
          company: formData.company,
          projectType: selectedService?.name ?? formData.serviceNeeded,
          preferredContactMethod: formData.preferredContactMethod,
          clientType: formData.clientType,
          urgency: formData.urgency,
          budgetRange: formData.budgetRange,
          timeline: formData.timeline,
          message: formData.problemDescription,
          website: formData.website,
          submittedAt: formStartAt,
          source,
          utmSource: trackingData.utmSource,
          utmCampaign: trackingData.utmCampaign,
        }),
      });

      if (!response.ok) {
        const responseBody = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(responseBody?.error ?? "Failed to submit lead form");
      }

      window._hsq?.push([
        "identify",
        {
          email: formData.email,
          firstname: formData.name.split(" ")[0] ?? "",
          project_source: source,
        },
      ]);
      window._hsq?.push(["trackPageView"]);
      window._hsq?.push([
        "trackCustomBehavioralEvent",
        {
          name: "intake_form_submit_success",
        },
      ]);

      setState("success");
      setFormData(initial);
      router.push("/thank-you");
    } catch (error) {
      window._hsq?.push([
        "trackCustomBehavioralEvent",
        {
          name: "intake_form_submit_error",
        },
      ]);
      console.error("Lead form submission failed", error);
      setState("error");
    }
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <p className="form-kicker">
        Tell us what is happening in your own words. We will reply with simple next steps and a
        free estimate.
      </p>

      <label htmlFor="name">Name</label>
      <input
        id="name"
        name="name"
        required
        value={formData.name}
        onChange={(event) =>
          setFormData((current) => ({ ...current, name: event.target.value }))
        }
      />

      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        name="email"
        required
        value={formData.email}
        onChange={(event) =>
          setFormData((current) => ({ ...current, email: event.target.value }))
        }
      />

      <label htmlFor="phone">Phone</label>
      <input
        id="phone"
        type="tel"
        name="phone"
        required
        value={formData.phone}
        onChange={(event) =>
          setFormData((current) => ({ ...current, phone: event.target.value }))
        }
      />

      <label htmlFor="preferredContactMethod">Preferred Contact Method</label>
      <select
        id="preferredContactMethod"
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

      <label htmlFor="clientType">Business or Personal</label>
      <select
        id="clientType"
        value={formData.clientType}
        onChange={(event) =>
          setFormData((current) => ({ ...current, clientType: event.target.value }))
        }
      >
        <option value="personal">Personal</option>
        <option value="business">Business</option>
      </select>

      <label htmlFor="company">Business Name (optional)</label>
      <input
        id="company"
        value={formData.company}
        onChange={(event) =>
          setFormData((current) => ({ ...current, company: event.target.value }))
        }
      />

      <label htmlFor="serviceNeeded">Service Needed</label>
      <select
        id="serviceNeeded"
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

      <label htmlFor="urgency">Urgency</label>
      <select
        id="urgency"
        value={formData.urgency}
        onChange={(event) =>
          setFormData((current) => ({ ...current, urgency: event.target.value }))
        }
      >
        <option value="normal">Normal</option>
        <option value="soon">Soon (1-3 days)</option>
        <option value="urgent">Urgent (same day)</option>
      </select>

      <label htmlFor="budgetRange">Budget (optional)</label>
      <select
        id="budgetRange"
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

      <label htmlFor="timeline">Timeline</label>
      <select
        id="timeline"
        value={formData.timeline}
        onChange={(event) =>
          setFormData((current) => ({ ...current, timeline: event.target.value }))
        }
      >
        <option value="asap">As soon as possible</option>
        <option value="1_2_weeks">1-2 weeks</option>
        <option value="1_2_months">1-2 months</option>
        <option value="exploring">Just exploring options</option>
      </select>

      <label htmlFor="problemDescription">Problem Description</label>
      <textarea
        id="problemDescription"
        rows={5}
        required
        placeholder="Tell us what is happening in plain language."
        value={formData.problemDescription}
        onChange={(event) =>
          setFormData((current) => ({ ...current, problemDescription: event.target.value }))
        }
      />

      <div className="hidden-field" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          tabIndex={-1}
          autoComplete="off"
          value={formData.website}
          onChange={(event) =>
            setFormData((current) => ({ ...current, website: event.target.value }))
          }
        />
      </div>

      <button type="submit" className="cta-primary" disabled={state === "sending"}>
        {state === "sending" ? "Sending..." : "Send My Request"}
      </button>

      <p className="response-note">Most people hear back within one business day.</p>

      {state === "success" ? (
        <p className="lead-status success">Thanks. Your request is on the way.</p>
      ) : null}

      {state === "error" ? (
        <p className="lead-status error">
          Something went wrong. Please verify your details and try again.
        </p>
      ) : null}
    </form>
  );
}
