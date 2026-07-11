"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { submitLeadForm } from "@/lib/client/lead-form-submit";

type ServiceType =
  | "computer-repair"
  | "laptop-repair"
  | "phone-troubleshooting"
  | "wifi-setup"
  | "device-setup"
  | "pc-diagnostics"
  | "virus-removal"
  | "data-backup"
  | "gaming-pc-build"
  | "website-development"
  | "app-development"
  | "ai-automation"
  | "hubspot-crm"
  | "business-automation"
  | "cloud-security";

type SubmitState = "idle" | "sending" | "success" | "error";

type ServiceConfig = {
  label: string;
  min: number;
  max: number;
  question: string;
  questionPlaceholder: string;
  upsells: string[];
};

const serviceConfig: Record<ServiceType, ServiceConfig> = {
  "computer-repair": {
    label: "Computer Repair",
    min: 120,
    max: 420,
    question: "What issue are you seeing on your computer?",
    questionPlaceholder: "Example: system crashes on startup and runs very slow.",
    upsells: ["Data Backup", "SSD Upgrade", "Virus Protection"],
  },
  "laptop-repair": {
    label: "Laptop Repair",
    min: 140,
    max: 540,
    question: "What happens when you power on the laptop?",
    questionPlaceholder: "Example: black screen, battery drain, or overheating.",
    upsells: ["Battery Replacement", "Thermal Cleanup", "Data Backup"],
  },
  "phone-troubleshooting": {
    label: "Phone Troubleshooting",
    min: 90,
    max: 320,
    question: "What phone issues are you experiencing?",
    questionPlaceholder: "Example: freezing, app crashes, or charging problems.",
    upsells: ["Device Cleanup", "Backup Setup", "Security Hardening"],
  },
  "wifi-setup": {
    label: "Wi-Fi Setup and Troubleshooting",
    min: 120,
    max: 360,
    question: "What is happening with your Wi-Fi?",
    questionPlaceholder: "Example: connection drops, slow speed, or weak signal in certain rooms.",
    upsells: ["Router Optimization", "Whole-Home Coverage Plan", "Network Security Setup"],
  },
  "device-setup": {
    label: "Device Setup",
    min: 90,
    max: 320,
    question: "What device do you need help setting up?",
    questionPlaceholder: "Example: new printer, smart TV, tablet, or work laptop.",
    upsells: ["Account Sync", "Security Setup", "Backup Configuration"],
  },
  "pc-diagnostics": {
    label: "PC Diagnostics",
    min: 99,
    max: 280,
    question: "What symptoms should we diagnose first?",
    questionPlaceholder: "Example: random restarts and high CPU usage.",
    upsells: ["Repair Plan", "Upgrade Plan", "Preventive Maintenance"],
  },
  "virus-removal": {
    label: "Virus Removal",
    min: 130,
    max: 450,
    question: "What suspicious behavior have you noticed?",
    questionPlaceholder: "Example: popups, unknown software, account alerts.",
    upsells: ["Endpoint Protection", "Backup Plan", "Security Audit"],
  },
  "data-backup": {
    label: "Data Backup",
    min: 120,
    max: 600,
    question: "What data needs protection or recovery?",
    questionPlaceholder: "Example: family photos, business files, or databases.",
    upsells: ["Cloud Sync", "Recovery Plan", "Disaster Playbook"],
  },
  "gaming-pc-build": {
    label: "Gaming PC Build",
    min: 900,
    max: 4200,
    question: "What games and performance goals are most important?",
    questionPlaceholder: "Example: 1440p high FPS streaming and future upgrade path.",
    upsells: ["Performance Tuning", "Thermal Optimization", "Maintenance Plan"],
  },
  "website-development": {
    label: "Website Development",
    min: 1800,
    max: 12000,
    question: "What should your website help people do?",
    questionPlaceholder: "Example: call us, request a quote, or book a visit.",
    upsells: ["SEO Setup", "Google Business Profile Help", "Monthly Website Care"],
  },
  "app-development": {
    label: "App Development",
    min: 4500,
    max: 36000,
    question: "What should the app help users do first?",
    questionPlaceholder: "Example: schedule services, track jobs, and send updates.",
    upsells: ["Analytics Dashboard", "CRM Integration", "Ongoing Support"],
  },
  "ai-automation": {
    label: "AI Automation",
    min: 2500,
    max: 28000,
    question: "What repetitive task should automation handle first?",
    questionPlaceholder: "Example: follow-up messages, ticket sorting, or reminders.",
    upsells: ["CRM Integration", "Business Automation", "Analytics"],
  },
  "hubspot-crm": {
    label: "HubSpot CRM Setup",
    min: 900,
    max: 9800,
    question: "Where are leads getting stuck right now?",
    questionPlaceholder: "Example: new leads not getting follow-ups.",
    upsells: ["Pipeline Setup", "Automation Rules", "Reporting Setup"],
  },
  "business-automation": {
    label: "Business Automation",
    min: 1800,
    max: 24000,
    question: "Which repetitive process is costing you the most time?",
    questionPlaceholder: "Example: intake forms, reminders, approvals, or reports.",
    upsells: ["AI Automation", "CRM Setup", "Operations Dashboard"],
  },
  "cloud-security": {
    label: "Website Security and Hosting",
    min: 1200,
    max: 18000,
    question: "What website safety or outage problem worries you most?",
    questionPlaceholder: "Example: spam attacks, downtime, or weak login settings.",
    upsells: ["Cloudflare Setup", "Backup Plan", "Security Checkups"],
  },
};

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function calculateRange(params: {
  serviceType: ServiceType;
  urgency: string;
  complexity: string;
  scope: string;
}) {
  const config = serviceConfig[params.serviceType];
  let multiplier = 1;

  if (params.urgency === "urgent") {
    multiplier += 0.25;
  }

  if (params.complexity === "complex") {
    multiplier += 0.35;
  }

  if (params.scope === "large") {
    multiplier += 0.3;
  }

  if (params.scope === "small") {
    multiplier -= 0.1;
  }

  return {
    min: Math.round(config.min * multiplier),
    max: Math.round(config.max * multiplier),
    label: config.label,
    upsells: config.upsells,
  };
}

export default function LiveEstimator() {
  const searchParams = useSearchParams();
  const prefilledServiceType = searchParams.get("serviceType");
  const prefilledProblem = searchParams.get("problem");
  const prefilledUrgency = searchParams.get("urgency");
  const prefilledAudienceType = searchParams.get("audienceType");

  const [state, setState] = useState<SubmitState>("idle");
  const [errorText, setErrorText] = useState("");
  const [formData, setFormData] = useState(() => ({
    serviceType:
      prefilledServiceType && prefilledServiceType in serviceConfig
        ? (prefilledServiceType as ServiceType)
        : ("computer-repair" as ServiceType),
    urgency: prefilledUrgency || "normal",
    complexity: "standard",
    scope: "medium",
    timeline: "asap",
    preferredAppointmentTime: "",
    serviceQuestionAnswer: prefilledProblem
      ? `Customer-selected issue: ${prefilledProblem.replace(/-/g, " ")}`
      : "",
    preferredContactMethod: "email",
    audienceType: prefilledAudienceType || "personal",
    name: "",
    email: "",
    phone: "",
    company: "",
    website: "",
    submittedAt: Date.now() - 2000,
  }));

  const estimate = useMemo(
    () =>
      calculateRange({
        serviceType: formData.serviceType,
        urgency: formData.urgency,
        complexity: formData.complexity,
        scope: formData.scope,
      }),
    [formData.complexity, formData.scope, formData.serviceType, formData.urgency]
  );

  const currentConfig = serviceConfig[formData.serviceType];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setErrorText("");

    try {
      const payload = await submitLeadForm("/api/contact", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        preferredContactMethod: formData.preferredContactMethod,
        audienceType: formData.audienceType,
        urgency: formData.urgency,
        budgetRange: `${formatUsd(estimate.min)} - ${formatUsd(estimate.max)}`,
        timeline: formData.timeline,
        projectType: currentConfig.label,
        message: [
          `Instant quote request for ${currentConfig.label}`,
          `Complexity: ${formData.complexity}`,
          `Scope: ${formData.scope}`,
          `Timeline preference: ${formData.timeline}`,
          `Preferred appointment time: ${formData.preferredAppointmentTime || "not provided"}`,
          `${currentConfig.question} ${formData.serviceQuestionAnswer || "not provided"}`,
          `Upsell recommendations shown: ${estimate.upsells.join(", ")}`,
          `Estimated range shown: ${formatUsd(estimate.min)} - ${formatUsd(estimate.max)}`,
        ].join("\n"),
        formType: "live_estimate",
        website: formData.website,
      });

      if (!payload.ok) {
        throw new Error(payload.message ?? "Could not submit estimate request");
      }

      setState("success");
    } catch (error) {
      setState("error");
      setErrorText(error instanceof Error ? error.message : "Request failed");
    }
  }

  return (
    <section className="glass-panel rounded-3xl p-6 md:p-8" id="live-estimator">
      <p className="label-chip inline-flex">Price Estimator</p>
      <h2 className="section-title mt-4">Get a Quick Price Range</h2>
      <p className="section-copy mt-3">
        Pick a service, answer a few questions, and we will show a realistic estimate range.
      </p>

      <form className="lead-form mt-5" onSubmit={handleSubmit}>
        <label htmlFor="estimator-service">Service Type</label>
        <select
          id="estimator-service"
          value={formData.serviceType}
          onChange={(event) =>
            setFormData((current) => ({
              ...current,
              serviceType: event.target.value as ServiceType,
              serviceQuestionAnswer: "",
            }))
          }
        >
          <option value="computer-repair">Computer Repair</option>
          <option value="laptop-repair">Laptop Repair</option>
          <option value="phone-troubleshooting">Phone Troubleshooting</option>
          <option value="wifi-setup">Wi-Fi Setup and Troubleshooting</option>
          <option value="device-setup">Device Setup</option>
          <option value="pc-diagnostics">PC Diagnostics</option>
          <option value="virus-removal">Virus Removal</option>
          <option value="data-backup">Data Backup</option>
          <option value="gaming-pc-build">Gaming PC Build</option>
          <option value="website-development">Website Development</option>
          <option value="app-development">App Development</option>
          <option value="ai-automation">AI Automation</option>
          <option value="hubspot-crm">HubSpot CRM</option>
          <option value="business-automation">Business Automation</option>
          <option value="cloud-security">Website Security and Hosting</option>
        </select>

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label htmlFor="estimator-urgency">Urgency</label>
            <select
              id="estimator-urgency"
              value={formData.urgency}
              onChange={(event) =>
                setFormData((current) => ({ ...current, urgency: event.target.value }))
              }
            >
              <option value="normal">Normal</option>
              <option value="soon">Soon</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label htmlFor="estimator-complexity">Problem Difficulty</label>
            <select
              id="estimator-complexity"
              value={formData.complexity}
              onChange={(event) =>
                setFormData((current) => ({ ...current, complexity: event.target.value }))
              }
            >
              <option value="standard">Typical</option>
              <option value="complex">Complex</option>
            </select>
          </div>
          <div>
            <label htmlFor="estimator-scope">Job Size</label>
            <select
              id="estimator-scope"
              value={formData.scope}
              onChange={(event) =>
                setFormData((current) => ({ ...current, scope: event.target.value }))
              }
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>

        <label htmlFor="estimator-service-question">{currentConfig.question}</label>
        <textarea
          id="estimator-service-question"
          rows={4}
          required
          placeholder={currentConfig.questionPlaceholder}
          value={formData.serviceQuestionAnswer}
          onChange={(event) =>
            setFormData((current) => ({ ...current, serviceQuestionAnswer: event.target.value }))
          }
        />

        <h3 className="section-heading mt-3">Contact Details (required before showing estimate)</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label htmlFor="estimator-name">Name</label>
            <input
              id="estimator-name"
              required
              value={formData.name}
              onChange={(event) =>
                setFormData((current) => ({ ...current, name: event.target.value }))
              }
            />
          </div>
          <div>
            <label htmlFor="estimator-email">Email</label>
            <input
              id="estimator-email"
              type="email"
              required
              value={formData.email}
              onChange={(event) =>
                setFormData((current) => ({ ...current, email: event.target.value }))
              }
            />
          </div>
          <div>
            <label htmlFor="estimator-phone">Phone</label>
            <input
              id="estimator-phone"
              required
              value={formData.phone}
              onChange={(event) =>
                setFormData((current) => ({ ...current, phone: event.target.value }))
              }
            />
          </div>
          <div>
            <label htmlFor="estimator-company">Business Name (optional)</label>
            <input
              id="estimator-company"
              value={formData.company}
              onChange={(event) =>
                setFormData((current) => ({ ...current, company: event.target.value }))
              }
            />
          </div>
          <div>
            <label htmlFor="estimator-contact-method">Preferred Contact Method</label>
            <select
              id="estimator-contact-method"
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
            <label htmlFor="estimator-appointment-time">Preferred Appointment Time</label>
            <input
              id="estimator-appointment-time"
              placeholder="Example: Tuesday after 3 PM"
              value={formData.preferredAppointmentTime}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  preferredAppointmentTime: event.target.value,
                }))
              }
            />
          </div>
          <div>
            <label htmlFor="estimator-audience">Business or Personal</label>
            <select
              id="estimator-audience"
              value={formData.audienceType}
              onChange={(event) =>
                setFormData((current) => ({ ...current, audienceType: event.target.value }))
              }
            >
              <option value="personal">Personal</option>
              <option value="business">Business</option>
            </select>
          </div>
        </div>

        <div className="hidden-field" aria-hidden="true">
          <label htmlFor="estimator-website">Website</label>
          <input
            id="estimator-website"
            tabIndex={-1}
            autoComplete="off"
            value={formData.website}
            onChange={(event) =>
              setFormData((current) => ({ ...current, website: event.target.value }))
            }
          />
        </div>

        <button type="submit" className="cta-primary" disabled={state === "sending"}>
          {state === "sending" ? "Calculating..." : "Show My Estimate"}
        </button>
      </form>

      {state === "success" ? (
        <div className="assistant-answer mt-5" aria-live="polite">
          <h3 className="section-heading">Estimated Price Range</h3>
          <p className="section-copy mt-2">
            {estimate.label}: {formatUsd(estimate.min)} to {formatUsd(estimate.max)}
          </p>
          <h4 className="section-heading mt-4">Helpful Add-Ons</h4>
          <ul className="mt-2 grid gap-2 text-sm text-slate-200/90">
            {estimate.upsells.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
          <p className="response-note mt-3">
            Your request was sent. Book a call if you want a detailed quote and next-step plan.
          </p>
          <a href="/book-service" className="cta-secondary mt-4 inline-flex">
            Book a Call
          </a>
        </div>
      ) : null}

      {state === "error" ? <p className="lead-status error mt-4">{errorText}</p> : null}
    </section>
  );
}
