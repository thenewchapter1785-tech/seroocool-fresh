"use client";

import { useState } from "react";
import Link from "next/link";

declare global {
  interface Window {
    _hsq?: Array<unknown>;
  }
}

type SubmitState = "idle" | "sending" | "success" | "error";

type ProblemOption = {
  label: string;
  icon: string;
  href: string;
  analyticsEvent: string;
};

const options: ProblemOption[] = [
  {
    label: "My Computer Is Slow",
    icon: "PC",
    href: "/estimate?serviceType=computer-repair&problem=slow-computer",
    analyticsEvent: "problem_finder_slow_computer",
  },
  {
    label: "My Laptop Won't Turn On",
    icon: "LP",
    href: "/estimate?serviceType=laptop-repair&problem=laptop-wont-turn-on",
    analyticsEvent: "problem_finder_laptop_power",
  },
  {
    label: "I Think I Have a Virus",
    icon: "VR",
    href: "/estimate?serviceType=virus-removal&problem=virus-signs",
    analyticsEvent: "problem_finder_virus",
  },
  {
    label: "My Phone Isn't Working Right",
    icon: "PH",
    href: "/estimate?serviceType=phone-troubleshooting&problem=phone-troubleshooting",
    analyticsEvent: "problem_finder_phone",
  },
  {
    label: "My Wi-Fi Keeps Disconnecting",
    icon: "WF",
    href: "/estimate?serviceType=wifi-setup&problem=wifi-disconnecting",
    analyticsEvent: "problem_finder_wifi",
  },
  {
    label: "I Need Help Setting Up a Device",
    icon: "DV",
    href: "/estimate?serviceType=device-setup&problem=device-setup",
    analyticsEvent: "problem_finder_device_setup",
  },
  {
    label: "I Need a Website",
    icon: "WB",
    href: "/estimate?serviceType=website-development&problem=need-website",
    analyticsEvent: "problem_finder_website",
  },
  {
    label: "I Want More Customers Online",
    icon: "SEO",
    href: "/services/seo-optimization",
    analyticsEvent: "problem_finder_more_customers_online",
  },
  {
    label: "I Want to Automate My Business",
    icon: "AT",
    href: "/estimate?serviceType=business-automation&problem=business-automation",
    analyticsEvent: "problem_finder_business_automation",
  },
];

export default function CustomerProblemFinder() {
  const [showDiagnosticForm, setShowDiagnosticForm] = useState(false);
  const [state, setState] = useState<SubmitState>("idle");
  const [errorText, setErrorText] = useState("");
  const [formData, setFormData] = useState(() => ({
    name: "",
    email: "",
    phone: "",
    deviceOrService: "computer",
    symptoms: "",
    whenStarted: "",
    urgency: "normal",
    audienceType: "personal",
    preferredContactMethod: "email",
    website: "",
    submittedAt: Date.now() - 2000,
  }));

  function track(eventName: string) {
    window._hsq?.push([
      "trackCustomBehavioralEvent",
      {
        name: eventName,
      },
    ]);
  }

  function handleUnsureClick() {
    setShowDiagnosticForm((current) => !current);
    track("problem_finder_not_sure");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setErrorText("");

    try {
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
          audienceType: formData.audienceType,
          urgency: formData.urgency,
          timeline: formData.whenStarted,
          projectType: `Problem Finder - ${formData.deviceOrService}`,
          formType: "problem_finder_diagnostic",
          message: [
            `Device or service: ${formData.deviceOrService}`,
            `What is happening: ${formData.symptoms}`,
            `When it started: ${formData.whenStarted || "not provided"}`,
            `Urgency: ${formData.urgency}`,
            `Personal or business: ${formData.audienceType}`,
            `Preferred contact method: ${formData.preferredContactMethod}`,
          ].join("\n"),
          website: formData.website,
          submittedAt: formData.submittedAt,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error ?? "Could not submit your diagnostic request");
      }

      track("problem_finder_diagnostic_submitted");
      setState("success");
      setFormData((current) => ({
        ...current,
        name: "",
        email: "",
        phone: "",
        symptoms: "",
        whenStarted: "",
        website: "",
      }));
    } catch (error) {
      setState("error");
      setErrorText(error instanceof Error ? error.message : "Request failed");
    }
  }

  return (
    <section className="glass-panel rounded-3xl p-6 md:p-8" id="problem-finder">
      <h2 className="section-title">What&apos;s Going On Today?</h2>
      <p className="section-copy mt-3">
        You do not need to know the technical name of the problem. Just choose what sounds closest
        and we will help you figure it out.
      </p>

      <div className="problem-finder-grid mt-5">
        {options.map((option) => (
          <Link
            key={option.label}
            href={option.href}
            className="problem-option"
            onClick={() => track(option.analyticsEvent)}
          >
            <span className="problem-option-icon" aria-hidden="true">
              {option.icon}
            </span>
            <span>{option.label}</span>
          </Link>
        ))}

        <button type="button" className="problem-option" onClick={handleUnsureClick}>
          <span className="problem-option-icon" aria-hidden="true">
            ?
          </span>
          <span>I&apos;m Not Sure What&apos;s Wrong</span>
        </button>
      </div>

      {showDiagnosticForm ? (
        <form className="lead-form mt-6" onSubmit={handleSubmit}>
          <h3 className="section-heading">Beginner-Friendly Diagnostic Request</h3>

          <label htmlFor="diagnostic-name">Name</label>
          <input
            id="diagnostic-name"
            required
            value={formData.name}
            onChange={(event) =>
              setFormData((current) => ({ ...current, name: event.target.value }))
            }
          />

          <label htmlFor="diagnostic-email">Email</label>
          <input
            id="diagnostic-email"
            type="email"
            required
            value={formData.email}
            onChange={(event) =>
              setFormData((current) => ({ ...current, email: event.target.value }))
            }
          />

          <label htmlFor="diagnostic-phone">Phone</label>
          <input
            id="diagnostic-phone"
            type="tel"
            required
            value={formData.phone}
            onChange={(event) =>
              setFormData((current) => ({ ...current, phone: event.target.value }))
            }
          />

          <label htmlFor="diagnostic-device">What device or service is involved?</label>
          <select
            id="diagnostic-device"
            value={formData.deviceOrService}
            onChange={(event) =>
              setFormData((current) => ({ ...current, deviceOrService: event.target.value }))
            }
          >
            <option value="computer">Computer</option>
            <option value="laptop">Laptop</option>
            <option value="phone">Phone</option>
            <option value="wifi">Wi-Fi / internet</option>
            <option value="printer">Printer</option>
            <option value="email">Email</option>
            <option value="website">Website</option>
            <option value="business-tech">Business technology</option>
          </select>

          <label htmlFor="diagnostic-symptoms">What is happening?</label>
          <textarea
            id="diagnostic-symptoms"
            rows={4}
            required
            value={formData.symptoms}
            onChange={(event) =>
              setFormData((current) => ({ ...current, symptoms: event.target.value }))
            }
          />

          <label htmlFor="diagnostic-when">When did it start?</label>
          <input
            id="diagnostic-when"
            placeholder="Example: this morning, last week, or about a month ago"
            value={formData.whenStarted}
            onChange={(event) =>
              setFormData((current) => ({ ...current, whenStarted: event.target.value }))
            }
          />

          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label htmlFor="diagnostic-urgency">Is it urgent?</label>
              <select
                id="diagnostic-urgency"
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
              <label htmlFor="diagnostic-audience">Personal or business?</label>
              <select
                id="diagnostic-audience"
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
              <label htmlFor="diagnostic-contact-method">How should we contact you?</label>
              <select
                id="diagnostic-contact-method"
                value={formData.preferredContactMethod}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, preferredContactMethod: event.target.value }))
                }
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="text">Text</option>
              </select>
            </div>
          </div>

          <div className="hidden-field" aria-hidden="true">
            <label htmlFor="diagnostic-website">Website</label>
            <input
              id="diagnostic-website"
              tabIndex={-1}
              autoComplete="off"
              value={formData.website}
              onChange={(event) =>
                setFormData((current) => ({ ...current, website: event.target.value }))
              }
            />
          </div>

          <button type="submit" className="cta-primary" disabled={state === "sending"}>
            {state === "sending" ? "Sending..." : "Get Help"}
          </button>

          {state === "success" ? (
            <p className="lead-status success">
              Thanks. We received your request and will guide you through next steps.
            </p>
          ) : null}

          {state === "error" ? <p className="lead-status error">{errorText}</p> : null}
        </form>
      ) : null}
    </section>
  );
}
