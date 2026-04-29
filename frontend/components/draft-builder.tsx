"use client";

import { FormEvent, useState, useTransition } from "react";

import { createDraft } from "@/lib/api";

export function DraftBuilder() {
  const [form, setForm] = useState({
    name: "Alex Rao",
    date: "",
    location: "Mumbai",
    description: "Draft an FIR-style document for a workplace theft incident involving office electronics.",
  });
  const [draftText, setDraftText] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setDraftText(null);

    startTransition(async () => {
      try {
        const generated = await createDraft(form);
        setDraftText(generated);
      } catch (submissionError) {
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : "Unable to generate the draft. Please try again.",
        );
      }
    });
  };

  return (
    <div className="page-stack">
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form className="panel space-y-6" onSubmit={onSubmit}>
          <div className="panel-copy">
            <span className="eyebrow">Draft</span>
            <h2>Generate a legal draft</h2>
            <p className="text-sm leading-6 text-[var(--muted)]">
              Provide the details below and generate a professional draft output.
            </p>
          </div>

          <div className="field-row">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Your name or client name"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="field-row">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              />
            </div>

            <div className="field-row">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                value={form.location}
                onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                placeholder="City or venue"
              />
            </div>
          </div>

          <div className="field-row">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={6}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Describe the facts, purpose, and any legal context"
            />
          </div>

          <button className="button" type="submit" disabled={isPending}>
            {isPending ? "Generating Draft…" : "Generate Draft"}
          </button>

          {error ? <div className="result-box text-sm text-[#8b3225]">{error}</div> : null}
        </form>

        <div className="space-y-4">
          <div className="panel-copy">
            <span className="eyebrow">Generated draft</span>
            <p className="text-sm leading-6 text-[var(--muted)]">
              The draft appears here after generation. Review the text and preserve line breaks.
            </p>
          </div>

          <div className="min-h-[320px] overflow-y-auto rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 text-[var(--text)]">
            {draftText ? (
              <pre className="whitespace-pre-wrap font-mono text-sm leading-7">{draftText}</pre>
            ) : (
              <p className="text-[var(--muted)]">
                Complete the form and click Generate Draft to display the output.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
