import "server-only";

import { sanitizeText } from "@/lib/api-security";
import { readOptionalEnv } from "@/lib/env";

const OPENAI_API_URL = "https://api.openai.com/v1/responses";

async function callOpenAI(systemPrompt: string, userPrompt: string) {
  const apiKey = readOptionalEnv("OPENAI_API_KEY").trim();

  if (!apiKey) {
    return "";
  }

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      max_output_tokens: 250,
    }),
  });

  if (!response.ok) {
    return "";
  }

  const data = (await response.json()) as {
    output_text?: string;
  };

  return sanitizeText(data.output_text, 1800);
}

export async function generateReviewReplyDraft(params: {
  reviewerName: string;
  rating: number;
  reviewText: string;
}) {
  const fallback = [
    `Hi ${params.reviewerName || "there"},`,
    "",
    "Thank you for sharing your feedback. We appreciate you taking the time to review ZeroCool Development.",
    "",
    params.rating >= 4
      ? "We are glad we could help and look forward to supporting you again whenever you need us."
      : "We are sorry your experience did not meet expectations. Please contact us directly so we can make this right.",
    "",
    "ZeroCool Development",
  ].join("\n");

  const generated = await callOpenAI(
    "You draft concise, professional, human-sounding review replies for a technology services business. Avoid legal claims. Avoid guarantees. Keep under 120 words.",
    `Business: ZeroCool Development\nReviewer: ${sanitizeText(params.reviewerName, 80)}\nRating: ${params.rating}\nReview: ${sanitizeText(params.reviewText, 1000)}\nWrite a professional reply with a warm tone and clear next step if the review is negative.`
  );

  return generated || fallback;
}

export async function generateLocalPostDraft(params: {
  topic: string;
  callToAction: string;
}) {
  const fallback = [
    `${params.topic} update from ZeroCool Development: We are helping local clients improve reliability, performance, and security this week.`,
    "Need help now? Request a free estimate and we will recommend the fastest next steps.",
    `${params.callToAction}`,
  ].join(" ");

  const generated = await callOpenAI(
    "You write local business Google profile post drafts for a technology company. Keep posts direct, promotional but trustworthy, and between 80 and 220 words.",
    `Business: ZeroCool Development\nTopic: ${sanitizeText(params.topic, 120)}\nCall to action: ${sanitizeText(params.callToAction, 180)}\nWrite one post draft with a strong local-service tone and a concrete benefit.`
  );

  return generated || fallback;
}
