"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
      projectType: "website",
      budgetRange: "not_sure",
      timeline: "asap",
      message: "",
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
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          source,
          utmSource: trackingData.utmSource,
          utmCampaign: trackingData.utmCampaign,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit lead form");
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
      router.push(
        `/thank-you?source=${encodeURIComponent(source)}&projectType=${encodeURIComponent(formData.projectType)}`
      );
    } catch {
      window._hsq?.push([
        "trackCustomBehavioralEvent",
        {
          name: "intake_form_submit_error",
        },
      ]);
      setState("error");
    }
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <p className="form-kicker">Get a reply with scope, next steps, and timing.</p>

      <label htmlFor="name">Name</label>
      <input
        id="name"
        name="name"
        placeholder="Your name"
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
        placeholder="you@company.com"
        required
        value={formData.email}
        onChange={(event) =>
          setFormData((current) => ({ ...current, email: event.target.value }))
        }
      />

      <label htmlFor="projectType">Project Type</label>
      <select
        id="projectType"
        name="projectType"
        value={formData.projectType}
        onChange={(event) =>
          setFormData((current) => ({
            ...current,
            projectType: event.target.value,
          }))
        }
      >
        <option value="website">Business Website</option>
        <option value="webapp">Custom Web App</option>
        <option value="android">Android App</option>
        <option value="automation">Automation / API Project</option>
        <option value="other">Other</option>
      </select>

      <label htmlFor="budgetRange">Budget Range</label>
      <select
        id="budgetRange"
        name="budgetRange"
        value={formData.budgetRange}
        onChange={(event) =>
          setFormData((current) => ({
            ...current,
            budgetRange: event.target.value,
          }))
        }
      >
        <option value="not_sure">Not sure yet</option>
        <option value="under_2k">Under $2k</option>
        <option value="2k_5k">$2k - $5k</option>
        <option value="5k_10k">$5k - $10k</option>
        <option value="10k_plus">$10k+</option>
      </select>

      <label htmlFor="timeline">Desired Timeline</label>
      <select
        id="timeline"
        name="timeline"
        value={formData.timeline}
        onChange={(event) =>
          setFormData((current) => ({
            ...current,
            timeline: event.target.value,
          }))
        }
      >
        <option value="asap">As soon as possible</option>
        <option value="1_2_months">1-2 months</option>
        <option value="this_quarter">This quarter</option>
        <option value="exploring">Just exploring options</option>
      </select>

      <label htmlFor="message">Project Details</label>
      <textarea
        id="message"
        name="message"
        rows={5}
        placeholder="What do you need built, fixed, or automated?"
        required
        value={formData.message}
        onChange={(event) =>
          setFormData((current) => ({ ...current, message: event.target.value }))
        }
      />

      <button type="submit" className="cta-primary" disabled={state === "sending"}>
        {state === "sending" ? "Sending..." : "Get My Project Estimate"}
      </button>

      <p className="response-note">Most replies go out within one business day.</p>

      {state === "success" ? (
        <p className="lead-status success">Thanks. Your request was sent successfully.</p>
      ) : null}

      {state === "error" ? (
        <p className="lead-status error">Something went wrong. Please try again.</p>
      ) : null}
    </form>
  );
}
