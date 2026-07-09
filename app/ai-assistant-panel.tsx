"use client";

import { useState } from "react";

type AssistantState = "idle" | "sending" | "error";

export default function AiAssistantPanel() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [state, setState] = useState<AssistantState>("idle");
  const [errorText, setErrorText] = useState("");
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [qualifiedCaptured, setQualifiedCaptured] = useState(false);
  const [lead, setLead] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "",
    preferredContactMethod: "email",
    audienceType: "personal",
    urgency: "normal",
    budgetRange: "",
    timeline: "",
    company: "",
    problemDescription: "",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      return;
    }

    setState("sending");
    setErrorText("");
    setQualifiedCaptured(false);

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: trimmedPrompt,
          lead,
        }),
      });

      const responseBody = (await response.json().catch(() => null)) as
        | {
            ok?: boolean;
            answer?: string;
            error?: string;
            missingLeadFields?: string[];
            qualifiedLeadCaptured?: boolean;
          }
        | null;

      if (!response.ok || !responseBody?.ok) {
        throw new Error(responseBody?.error ?? "Assistant request failed");
      }

      setAnswer(responseBody.answer ?? "");
      setMissingFields(responseBody.missingLeadFields ?? []);
      setQualifiedCaptured(Boolean(responseBody.qualifiedLeadCaptured));
      setPrompt("");
      setState("idle");
    } catch (error) {
      setState("error");
      setErrorText(
        error instanceof Error ? error.message : "Unable to process request"
      );
    }
  }

  return (
    <section className="glass-panel rounded-3xl p-6 md:p-8" aria-labelledby="ai-assistant-title">
      <h2 id="ai-assistant-title" className="section-title">
        AI Lead Assistant
      </h2>
      <p className="section-copy mt-3">
        Ask service questions and optionally provide lead details so we can qualify your request
        and recommend a free consultation.
      </p>

      <form className="lead-form mt-4" onSubmit={handleSubmit}>
        <label htmlFor="assistantPrompt">Your Question</label>
        <textarea
          id="assistantPrompt"
          name="assistantPrompt"
          rows={4}
          placeholder="Example: What is the fastest way to automate lead follow-up with HubSpot and AI?"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          required
        />

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label htmlFor="assistant-name">Name</label>
            <input
              id="assistant-name"
              value={lead.name}
              onChange={(event) =>
                setLead((current) => ({ ...current, name: event.target.value }))
              }
            />
          </div>
          <div>
            <label htmlFor="assistant-email">Email</label>
            <input
              id="assistant-email"
              type="email"
              value={lead.email}
              onChange={(event) =>
                setLead((current) => ({ ...current, email: event.target.value }))
              }
            />
          </div>
          <div>
            <label htmlFor="assistant-phone">Phone</label>
            <input
              id="assistant-phone"
              type="tel"
              value={lead.phone}
              onChange={(event) =>
                setLead((current) => ({ ...current, phone: event.target.value }))
              }
            />
          </div>
          <div>
            <label htmlFor="assistant-project-type">Project Type</label>
            <input
              id="assistant-project-type"
              value={lead.projectType}
              onChange={(event) =>
                setLead((current) => ({ ...current, projectType: event.target.value }))
              }
              placeholder="Web development, AI automation, etc."
            />
          </div>
          <div>
            <label htmlFor="assistant-contact-method">Preferred Contact Method</label>
            <select
              id="assistant-contact-method"
              value={lead.preferredContactMethod}
              onChange={(event) =>
                setLead((current) => ({
                  ...current,
                  preferredContactMethod: event.target.value,
                }))
              }
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="text">Text Message</option>
            </select>
          </div>
          <div>
            <label htmlFor="assistant-audience-type">Business or Personal</label>
            <select
              id="assistant-audience-type"
              value={lead.audienceType}
              onChange={(event) =>
                setLead((current) => ({ ...current, audienceType: event.target.value }))
              }
            >
              <option value="personal">Personal</option>
              <option value="business">Business</option>
            </select>
          </div>
          <div>
            <label htmlFor="assistant-urgency">Urgency</label>
            <select
              id="assistant-urgency"
              value={lead.urgency}
              onChange={(event) =>
                setLead((current) => ({ ...current, urgency: event.target.value }))
              }
            >
              <option value="normal">Normal</option>
              <option value="soon">Soon (1-3 days)</option>
              <option value="urgent">Urgent (same day)</option>
            </select>
          </div>
          <div>
            <label htmlFor="assistant-budget">Budget</label>
            <input
              id="assistant-budget"
              value={lead.budgetRange}
              onChange={(event) =>
                setLead((current) => ({ ...current, budgetRange: event.target.value }))
              }
              placeholder="$2k-$5k"
            />
          </div>
          <div>
            <label htmlFor="assistant-timeline">Timeline</label>
            <input
              id="assistant-timeline"
              value={lead.timeline}
              onChange={(event) =>
                setLead((current) => ({ ...current, timeline: event.target.value }))
              }
              placeholder="1-2 months"
            />
          </div>
        </div>

        <label htmlFor="assistant-problem-description">Problem Description (optional)</label>
        <textarea
          id="assistant-problem-description"
          rows={3}
          value={lead.problemDescription}
          onChange={(event) =>
            setLead((current) => ({ ...current, problemDescription: event.target.value }))
          }
          placeholder="Example: My laptop is slow and freezes when I open multiple tabs."
        />

        <button type="submit" className="cta-secondary" disabled={state === "sending"}>
          {state === "sending" ? "Thinking..." : "Ask Assistant"}
        </button>
      </form>

      {answer ? (
        <article className="assistant-answer mt-4" aria-live="polite">
          <h3 className="section-heading">Response</h3>
          <p className="section-copy mt-2">{answer}</p>
        </article>
      ) : null}

      {missingFields.length > 0 ? (
        <p className="response-note mt-3">
          Missing lead fields for qualification: {missingFields.join(", ")}.
        </p>
      ) : null}

      {qualifiedCaptured ? (
        <p className="lead-status success mt-3">
          Qualified lead captured and sent for consultation follow-up.
        </p>
      ) : null}

      {state === "error" ? (
        <p className="lead-status error mt-3">{errorText || "Assistant request failed."}</p>
      ) : null}
    </section>
  );
}
