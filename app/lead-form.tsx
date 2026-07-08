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
  const [source, setSource] = useState(trackingData.source);
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

      <label htmlFor="source">How did you find me?</label>
      <select
        id="source"
        name="source"
        value={source}
        onChange={(event) => setSource(event.target.value)}
      >
        <option value="facebook">Facebook</option>
        <option value="instagram">Instagram</option>
        <option value="organic">Website Search</option>
        <option value="referral">Referral</option>
      </select>

      <label htmlFor="message">Project Details</label>
      <textarea
        id="message"
        name="message"
        rows={5}
        required
        value={formData.message}
        onChange={(event) =>
          setFormData((current) => ({ ...current, message: event.target.value }))
        }
      />

      <button type="submit" className="cta-primary" disabled={state === "sending"}>
        {state === "sending" ? "Sending..." : "Send Project Request"}
      </button>

      {state === "success" ? (
        <p className="lead-status success">Thanks. Your request was sent successfully.</p>
      ) : null}

      {state === "error" ? (
        <p className="lead-status error">Something went wrong. Please try again.</p>
      ) : null}
    </form>
  );
}
