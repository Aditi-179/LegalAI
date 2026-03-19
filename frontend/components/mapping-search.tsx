"use client";

import { FormEvent, useState, useTransition } from "react";

import { fetchMapping } from "@/lib/api";

export function MappingSearch() {
  const [code, setCode] = useState("420");
  const [result, setResult] = useState<Awaited<ReturnType<typeof fetchMapping>> | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        setResult(await fetchMapping(code));
      } catch (submissionError) {
        setError(submissionError instanceof Error ? submissionError.message : "Unable to search mapping.");
      }
    });
  };

  return (
    <div className="page-stack">
      <section className="workspace-grid">
        <form className="panel field-grid" onSubmit={onSubmit}>
          <div className="panel-copy">
            <span className="eyebrow">Section search</span>
            <h2>Find a mapping</h2>
            <p>Enter an IPC or BNS section number to view the linked reference.</p>
          </div>
          <div className="field-row">
            <label htmlFor="code">Section code</label>
            <input id="code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="420" />
          </div>
          <div className="status-row">
            <button className="button" type="submit" disabled={isPending}>
              {isPending ? "Searching..." : "Search"}
            </button>
          </div>
          {error ? <div className="result-box">{error}</div> : null}
        </form>

        <div className="panel page-stack">
          <span className="eyebrow">Result</span>
          {result ? (
            <>
              <div className="result-box">
                <strong>IPC {result.ipc_section}</strong> to <strong>BNS {result.bns_section}</strong>
              </div>
              <div className="result-box">{result.title}</div>
              <div className="result-box">{result.summary}</div>
              <div className="result-box">{result.notes}</div>
            </>
          ) : (
            <div className="empty-state">Search results will appear here.</div>
          )}
        </div>
      </section>
    </div>
  );
}
