"use client";

import { FormEvent, useState, useTransition } from "react";

import { queryAssistant } from "@/lib/api";

export function ChatWorkbench() {
  const [question, setQuestion] = useState("Explain IPC 420 and the related BNS section.");
  const [answer, setAnswer] = useState("");
  const [contexts, setContexts] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const result = await queryAssistant(question);
        setAnswer(result.answer);
        setContexts(result.contexts);
      } catch (submissionError) {
        setError(submissionError instanceof Error ? submissionError.message : "Unable to process the query.");
      }
    });
  };

  return (
    <div className="page-stack">
      <section className="workspace-grid">
        <form className="panel field-grid" onSubmit={onSubmit}>
          <div className="panel-copy">
            <span className="eyebrow">Message</span>
            <h2>Ask LegalAI</h2>
            <p>Enter your question and review both the answer and the retrieved context.</p>
          </div>

          <div className="field-row">
            <label htmlFor="question">Your question</label>
            <textarea
              id="question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Example: What should someone check before filing a cheating complaint?"
            />
          </div>
          <div className="status-row">
            <button className="button" type="submit" disabled={isPending}>
              {isPending ? "Thinking..." : "Send"}
            </button>
            <span className="field-hint">Login is required before sending a protected request.</span>
          </div>
          {error ? <div className="result-box">{error}</div> : null}
        </form>

        <div className="panel page-stack">
          <div>
            <span className="eyebrow">Answer</span>
            <div className="result-box chat-answer">{answer || "The response will appear here."}</div>
          </div>
          <div>
            <span className="eyebrow">Context</span>
            {contexts.length ? (
              <ul className="result-list">
                {contexts.map((context) => (
                  <li key={context} className="result-box">
                    {context}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">Relevant context will appear here after you send a question.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
