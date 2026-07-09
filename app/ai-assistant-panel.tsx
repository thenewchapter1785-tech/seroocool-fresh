"use client";

import { useMemo, useState } from "react";

type AssistantState = "idle" | "sending" | "error";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type LeadState = {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  preferredContactMethod: string;
  audienceType: string;
  urgency: string;
  budgetRange: string;
  timeline: string;
  company: string;
  problemDescription: string;
  appointmentType: (typeof appointmentOptions)[number];
};

const appointmentOptions = [
  "phone call",
  "video call",
  "remote support",
  "on-site consultation",
  "website consultation",
  "AI consultation",
  "computer repair drop-off",
] as const;

export default function AiAssistantPanel() {
  const [prompt, setPrompt] = useState("");
  const [state, setState] = useState<AssistantState>("idle");
  const [errorText, setErrorText] = useState("");
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [qualifiedCaptured, setQualifiedCaptured] = useState(false);
  const [conversation, setConversation] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Tell me what is happening and I will help diagnose the issue. I can also recommend the right service and booking option.",
    },
  ]);
  const [lead, setLead] = useState<LeadState>({
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
    appointmentType: appointmentOptions[0],
  });

  const lastAssistantMessage = useMemo(() => {
    const reversed = [...conversation].reverse();
    return reversed.find((message) => message.role === "assistant")?.content ?? "";
  }, [conversation]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      return;
    }

    const nextConversation: ChatMessage[] = [
      ...conversation,
      {
        role: "user",
        content: trimmedPrompt,
      },
    ];

    setConversation(nextConversation);
    setPrompt("");
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
          history: nextConversation,
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

      setConversation((current) => [
        ...current,
        {
          role: "assistant",
          content: responseBody.answer ?? "I can help with that. Tell me more details.",
        },
      ]);
      setMissingFields(responseBody.missingLeadFields ?? []);
      setQualifiedCaptured(Boolean(responseBody.qualifiedLeadCaptured));
      setState("idle");
    } catch (error) {
      setState("error");
      setErrorText(
        error instanceof Error ? error.message : "Unable to process assistant request"
      );
    }
  }

  return (
    <section className="glass-panel rounded-3xl p-6 md:p-8" aria-labelledby="ai-assistant-title">
      <h2 id="ai-assistant-title" className="section-title">
        AI Diagnostic Assistant
      </h2>
      <p className="section-copy mt-3">
        Ask troubleshooting questions, get service recommendations, and prepare for scheduling in
        one conversation.
      </p>

      <div className="assistant-chat mt-4" aria-live="polite">
        {conversation.map((message, index) => (
          <article
            key={`${message.role}-${index}`}
            className={`assistant-bubble ${message.role === "assistant" ? "is-assistant" : "is-user"}`}
          >
            <p className="response-note">{message.role === "assistant" ? "Assistant" : "You"}</p>
            <p className="section-copy mt-1">{message.content}</p>
          </article>
        ))}
      </div>

      <form className="lead-form mt-4" onSubmit={handleSubmit}>
        <label htmlFor="assistantPrompt">Your Message</label>
        <textarea
          id="assistantPrompt"
          name="assistantPrompt"
          rows={4}
          placeholder="Example: My computer is very slow and keeps freezing when I open email and browser tabs."
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
            <label htmlFor="assistant-project-type">Service Needed</label>
            <input
              id="assistant-project-type"
              value={lead.projectType}
              onChange={(event) =>
                setLead((current) => ({ ...current, projectType: event.target.value }))
              }
              placeholder="Computer repair, website, AI automation, etc."
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
              <option value="text">Text</option>
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
              <option value="soon">Soon</option>
              <option value="urgent">Urgent</option>
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
              placeholder="$500-$2k"
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
              placeholder="ASAP, 1-2 weeks, 1-2 months"
            />
          </div>
          <div>
            <label htmlFor="assistant-appointment">Preferred Appointment Type</label>
            <select
              id="assistant-appointment"
              value={lead.appointmentType}
              onChange={(event) =>
                setLead((current) => ({
                  ...current,
                  appointmentType: event.target.value as (typeof appointmentOptions)[number],
                }))
              }
            >
              {appointmentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label htmlFor="assistant-company">Business Name (optional)</label>
        <input
          id="assistant-company"
          value={lead.company}
          onChange={(event) =>
            setLead((current) => ({ ...current, company: event.target.value }))
          }
        />

        <label htmlFor="assistant-problem-description">Problem Description (optional)</label>
        <textarea
          id="assistant-problem-description"
          rows={3}
          value={lead.problemDescription}
          onChange={(event) =>
            setLead((current) => ({ ...current, problemDescription: event.target.value }))
          }
          placeholder="Share any context you want included in your consultation summary."
        />

        <button type="submit" className="cta-secondary" disabled={state === "sending"}>
          {state === "sending" ? "Thinking..." : "Send Message"}
        </button>
      </form>

      {missingFields.length > 0 ? (
        <p className="response-note mt-3">
          Missing qualification fields: {missingFields.join(", ")}. Add these details for faster
          scheduling.
        </p>
      ) : null}

      {qualifiedCaptured ? (
        <p className="lead-status success mt-3">
          Qualified lead captured and summary sent for follow-up scheduling.
        </p>
      ) : null}

      {lastAssistantMessage ? (
        <a href="/book-service" className="cta-primary mt-4 inline-flex">
          Book This Recommendation
        </a>
      ) : null}

      {state === "error" ? (
        <p className="lead-status error mt-3">{errorText || "Assistant request failed."}</p>
      ) : null}
    </section>
  );
}
