"use client";

import { ChangeEvent, FormEvent, useState, useTransition } from "react";

import { explainDocument } from "@/lib/api";

export function UploadPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof explainDocument>> | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Choose a PDF or TXT file first.");
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        setResult(await explainDocument(file));
      } catch (submissionError) {
        setError(submissionError instanceof Error ? submissionError.message : "Unable to explain this file.");
      }
    });
  };

  return (
    <div className="page-stack">
      <section className="workspace-grid">
        <form className="panel field-grid" onSubmit={onSubmit}>
          <div className="panel-copy">
            <span className="eyebrow">Upload</span>
            <h2>Explain a legal document</h2>
            <p>Upload a notice, FIR, complaint, or agreement and read a simpler summary.</p>
          </div>
          <div className="field-row">
            <label htmlFor="document">File</label>
            <input id="document" type="file" accept=".pdf,.txt" onChange={onFileChange} />
            <span className="field-hint">Supported now: PDF and TXT.</span>
          </div>
          <button className="button" type="submit" disabled={isPending}>
            {isPending ? "Working..." : "Explain"}
          </button>
          {error ? <div className="result-box">{error}</div> : null}
        </form>

        <div className="panel page-stack">
          <span className="eyebrow">Output</span>
          {result ? (
            <>
              <div className="result-box mono">{result.filename}</div>
              <div className="result-box">{result.explanation}</div>
              <ul className="result-list">
                {result.highlights.map((highlight) => (
                  <li key={highlight} className="result-box">
                    {highlight}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="empty-state">The summary will appear here after upload.</div>
          )}
        </div>
      </section>
    </div>
  );
}
