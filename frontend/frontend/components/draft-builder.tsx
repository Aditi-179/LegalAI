"use client";

import { FormEvent, useState, useTransition } from "react";

import { createDraft } from "@/lib/api";

const draftTypes = ["Legal Notice", "Complaint", "Affidavit", "Agreement"];

export function DraftBuilder() {
  const [form, setForm] = useState({
    draft_type: "Legal Notice",
    title: "Notice for non-payment of dues",
    parties: "Sender: ABC Services | Recipient: XYZ Traders",
    facts: "Payment for services remains outstanding despite repeated reminders.",
    relief_sought: "Clear the dues within 15 days from receipt of notice.",
    extra_instructions: "Maintain formal tone and leave signature lines.",
  });
  const [result, setResult] = useState<Awaited<ReturnType<typeof createDraft>> | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        setResult(await createDraft(form));
      } catch (submissionError) {
        setError(submissionError instanceof Error ? submissionError.message : "Unable to generate this draft.");
      }
    });
  };

  return (
    <div className="page-stack">
      <section className="workspace-grid">
        <form className="panel field-grid" onSubmit={onSubmit}>
          <div className="panel-copy">
            <span className="eyebrow">Draft</span>
            <h2>Generate a first version</h2>
            <p>Fill in the details and generate a structured legal draft you can refine later.</p>
          </div>

          <div className="field-row">
            <label htmlFor="draft_type">Type</label>
            <select
              id="draft_type"
              value={form.draft_type}
              onChange={(event) => setForm((current) => ({ ...current, draft_type: event.target.value }))}
            >
              {draftTypes.map((draftType) => (
                <option key={draftType} value={draftType}>
                  {draftType}
                </option>
              ))}
            </select>
          </div>

          {(["title", "parties", "facts", "relief_sought", "extra_instructions"] as const).map((field) => (
            <div key={field} className="field-row">
              <label htmlFor={field}>{field.replaceAll("_", " ")}</label>
              {field === "facts" || field === "extra_instructions" ? (
                <textarea
                  id={field}
                  value={form[field]}
                  onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                />
              ) : (
                <input
                  id={field}
                  value={form[field]}
                  onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                />
              )}
            </div>
          ))}

          <button className="button" type="submit" disabled={isPending}>
            {isPending ? "Generating..." : "Generate"}
          </button>
          {error ? <div className="result-box">{error}</div> : null}
        </form>

        <div className="panel page-stack">
          <span className="eyebrow">Draft output</span>
          <div className="result-box mono" style={{ whiteSpace: "pre-wrap" }}>
            {result?.content || "Generated text will appear here."}
          </div>
        </div>
      </section>
    </div>
  );
}
