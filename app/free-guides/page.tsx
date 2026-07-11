"use client";

import { useState } from "react";
import { submitLeadForm } from "@/lib/client/lead-form-submit";
import { leadMagnets } from "@/lib/lead-magnets";

export default function FreeGuidesPage() {
  const [unlocked, setUnlocked] = useState<Record<string, boolean>>({});
  const [errorText, setErrorText] = useState("");
  const [formData, setFormData] = useState(() => ({
    name: "",
    email: "",
    website: "",
  }));

  async function unlockGuide(slug: string, title: string) {
    setErrorText("");

    try {
      const payload = await submitLeadForm("/api/contact", {
        name: formData.name,
        email: formData.email,
        projectType: title,
        formType: "lead_magnet_download",
        message: `Lead guide requested: ${title}`,
        website: formData.website,
      });

      if (!payload.ok) {
        throw new Error(payload.message ?? "Failed to unlock guide");
      }

      setUnlocked((current) => ({ ...current, [slug]: true }));
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Unable to unlock guide");
    }
  }

  return (
    <div className="site-shell">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12">
        <header className="glass-panel rounded-3xl p-7 md:p-10">
          <p className="label-chip inline-flex">Free Guides</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-blue-100 md:text-5xl">
            Download Free Technology Guides
          </h1>
          <p className="section-copy mt-4 max-w-3xl">
            Enter your name and email to unlock each guide. We will also send a free estimate follow-up.
          </p>
        </header>

        <section className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="section-title">Unlock Downloads</h2>
          <form className="lead-form mt-4">
            <label htmlFor="guides-name">Name</label>
            <input
              id="guides-name"
              required
              value={formData.name}
              onChange={(event) =>
                setFormData((current) => ({ ...current, name: event.target.value }))
              }
            />

            <label htmlFor="guides-email">Email</label>
            <input
              id="guides-email"
              type="email"
              required
              value={formData.email}
              onChange={(event) =>
                setFormData((current) => ({ ...current, email: event.target.value }))
              }
            />

            <div className="hidden-field" aria-hidden="true">
              <label htmlFor="guides-website">Website</label>
              <input
                id="guides-website"
                tabIndex={-1}
                autoComplete="off"
                value={formData.website}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, website: event.target.value }))
                }
              />
            </div>
          </form>

          {errorText ? <p className="lead-status error mt-3">{errorText}</p> : null}
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {leadMagnets.map((guide) => (
            <article key={guide.slug} className="project-card">
              <p className="project-tag">Lead Magnet</p>
              <h2 className="project-title">{guide.title}</h2>
              <p className="project-copy">{guide.description}</p>
              {unlocked[guide.slug] ? (
                <a href={guide.filePath} className="cta-primary mt-4 inline-flex">
                  Download Guide
                </a>
              ) : (
                <button
                  type="button"
                  className="cta-secondary mt-4"
                  onClick={() => unlockGuide(guide.slug, guide.title)}
                  disabled={!formData.name || !formData.email}
                >
                  Unlock Guide
                </button>
              )}
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
