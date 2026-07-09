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
      company: "",
      projectType: "custom_website_development",
      budgetRange: "not_sure",
      timeline: "asap",
      website: "",
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
      router.push(
        `/thank-you?source=${encodeURIComponent(source)}&projectType=${encodeURIComponent(formData.projectType)}`
      );
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
        Share your goals for web development, app development, automation, AI
        integration, or consulting. You will get a practical response with
        scope and next steps.
      </p>

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

      <label htmlFor="company">Company</label>
      <input
        id="company"
        name="company"
        placeholder="Company name (optional)"
        value={formData.company}
        onChange={(event) =>
          setFormData((current) => ({ ...current, company: event.target.value }))
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
        <option value="custom_website_development">Custom Website Development</option>
        <option value="mobile_application_development">Mobile Application Development (Android / iOS)</option>
        <option value="custom_business_software">Custom Business Software</option>
        <option value="software_automation">Software Automation</option>
        <option value="ai_integration">AI Integration</option>
        <option value="technology_consulting">Technology Consulting</option>
        <option value="ui_ux_design">UI/UX Design</option>
        <option value="computer_repair">Computer Repair</option>
        <option value="custom_pc_builds">Custom PC Builds</option>
        <option value="hardware_diagnostics_repair">Hardware Diagnostics & Repair</option>
        <option value="computer_upgrades">Computer Upgrades</option>
        <option value="virus_malware_removal">Virus & Malware Removal</option>
        <option value="performance_optimization">Performance Optimization</option>
        <option value="phone_troubleshooting">Phone Troubleshooting</option>
        <option value="network_wifi_troubleshooting">Network & Wi-Fi Troubleshooting</option>
        <option value="general_technical_support">General Technical Support</option>
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
        placeholder="What do you need built, fixed, optimized, or automated?"
        required
        value={formData.message}
        onChange={(event) =>
          setFormData((current) => ({ ...current, message: event.target.value }))
        }
      />

      <div className="hidden-field" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={formData.website}
          onChange={(event) =>
            setFormData((current) => ({ ...current, website: event.target.value }))
          }
        />
      </div>

      <button type="submit" className="cta-primary" disabled={state === "sending"}>
        {state === "sending" ? "Sending..." : "Get My Technology Plan"}
      </button>

      <p className="response-note">Most replies go out within one business day.</p>

      {state === "success" ? (
        <p className="lead-status success">Thanks. Your request was sent successfully.</p>
      ) : null}

      {state === "error" ? (
        <p className="lead-status error">
          Something went wrong. Please verify your details and try again.
        </p>
      ) : null}
    </form>
  );
}
