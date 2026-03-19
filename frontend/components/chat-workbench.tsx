"use client";

import { FormEvent, useState, useTransition } from "react";

import { Citation, queryAssistant } from "@/lib/api";

export function ChatWorkbench() {
  const [question, setQuestion] = useState("My neighbor stole my motorcycle. What is the punishment?");
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState<Citation[]>([]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        const result = await queryAssistant(question);
        setAnswer(result.answer);
        setCitations(result.citations ?? []);
      } catch (submissionError) {
        setError(submissionError instanceof Error ? submissionError.message : "Unable to process the query.");
      }
    });
  };

  return (
    <div className="page-stack">
      <section className="hero">
        <div className="page-stack">
          <span className="eyebrow">Indian Legal AI</span>
          <h1>Ask a legal question and review the laws behind the answer.</h1>
          <p className="hero-copy">
            This frontend is aligned to the current backend: one focused assistant flow that sends your prompt to the
            `/chat` endpoint and returns both the AI answer and cited legal sections.
          </p>
        </div>
        <div className="focus-card accent page-stack">
          <span className="card-kicker">How It Works</span>
          <h2>Chat + citations</h2>
          <p>
            Ask in plain English, then inspect the returned legal snippets, act names, section numbers, and similarity
            scores.
          </p>
          <div className="result-box">Example: &quot;What is the punishment for cheating under Indian law?&quot;</div>
        </div>
      </section>

      <section className="workspace-grid">
        <form className="panel field-grid" onSubmit={onSubmit}>
          <div className="panel-copy">
            <span className="eyebrow">Prompt</span>
            <h2>Ask the assistant</h2>
            <p>Keep the question factual and specific to improve retrieval quality.</p>
          </div>

          <div className="field-row">
            <label htmlFor="question">Your legal question</label>
            <textarea
              id="question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Example: My employer withheld wages for two months. What legal remedies may apply?"
            />
          </div>

          <div className="status-row">
            <button className="button" type="submit" disabled={isPending}>
              {isPending ? "Searching..." : "Ask AI"}
            </button>
            <span className="field-hint">Backend endpoint: `POST /chat`</span>
          </div>

          {error ? <div className="result-box">{error}</div> : null}
        </form>

        <div className="panel page-stack">
          <div className="page-stack">
            <span className="eyebrow">Answer</span>
            <div className="result-box chat-answer" style={{ whiteSpace: "pre-wrap" }}>
              {answer || "The assistant response will appear here."}
            </div>
          </div>

          <div className="page-stack">
            <span className="eyebrow">Sources</span>
            {citations.length ? (
              <ul className="result-list">
                {citations.map((citation, index) => (
                  <li key={`${citation.act_name}-${citation.section}-${index}`} className="result-box page-stack">
                    <strong>
                      {citation.act_name} Section {citation.section}
                    </strong>
                    <div>{citation.title || "Untitled section"}</div>
                    <div className="muted">{citation.content}</div>
                    <div className="mono muted">Confidence: {(citation.score * 100).toFixed(1)}%</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">Relevant legal citations will appear here after you send a question.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
