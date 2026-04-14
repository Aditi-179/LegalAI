"use client";

import { FormEvent, useState, useTransition } from "react";

import { queryAssistant } from "@/lib/api";

const examplePrompts = [
  "Explain IPC 420 and the relevant BNS sections.",
  "Summarize the essential elements of Section 375 IPC.",
  "What are the common defences to criminal negligence?",
  "Review the draft clause for a service agreement with legal risk in mind.",
];

export function ChatWorkbench() {
  const [question, setQuestion] = useState(
    "Explain IPC 420 and the related BNS section.",
  );
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
        setError(
          submissionError instanceof Error
            ? submissionError.message
            : "Unable to process the query.",
        );
      }
    });
  };

  return (
    <div className="space-y-6 pb-10">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="panel">
          <div className="panel-copy space-y-3">
            <span className="eyebrow">Assistant</span>
            <h2 className="text-2xl font-semibold text-[var(--text)]">
              Ask LegalAI
            </h2>
            <p className="text-sm leading-6 text-[var(--muted)]">
              Submit a question and review the assistant’s explanation alongside
              the returned legal context.
            </p>
          </div>

          <div className="mt-6 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 text-sm text-[var(--muted)]">
            Use the prompt list below to explore legal research and drafting
            questions quickly.
          </div>

          <div className="mt-6 grid gap-3">
            {examplePrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setQuestion(prompt)}
                className="w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-left text-sm text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--surface-soft)]"
              >
                {prompt}
              </button>
            ))}
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-[#e5c4b0] bg-[#fff1ee] p-4 text-sm font-medium text-[#8b3225]">
              {error}
            </div>
          ) : null}
        </div>

        <div className="grid gap-6">
          <div className="panel">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Answer</span>
              <span className="text-xs text-[var(--muted)]">
                {isPending ? "Working..." : "Latest response"}
              </span>
            </div>
            <div className="mt-4 min-h-[220px] rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 text-[var(--text)]">
              {answer ? (
                <p className="whitespace-pre-wrap leading-7">{answer}</p>
              ) : (
                <p className="text-[var(--muted)]">
                  The response will appear here.
                </p>
              )}
            </div>
          </div>

          <div className="panel">
            <span className="eyebrow">Context</span>
            {contexts.length ? (
              <ul className="mt-4 space-y-3">
                {contexts.map((context) => (
                  <li
                    key={context}
                    className="result-box text-[var(--text)] leading-6"
                  >
                    {context}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-5 text-[var(--muted)]">
                Relevant context will appear here after you send a question.
              </div>
            )}
          </div>
        </div>
      </section>

      <form
        onSubmit={onSubmit}
        className="mx-auto flex w-full max-w-6xl flex-col gap-3 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_18px_44px_rgba(0,0,0,0.18)] sm:flex-row sm:items-center"
      >
        <button
          type="button"
          className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--bg)] text-[var(--accent)] transition hover:border-[var(--accent)] hover:bg-[var(--surface-soft)]"
          aria-label="Attach options"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 5v14m7-7H5"
            />
          </svg>
        </button>

        <input
          type="text"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about IPC 420, document review, or draft guidance."
          className="min-h-[56px] w-full rounded-2xl border border-[var(--line)] bg-[var(--bg)] px-4 text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
        />

        <button
          type="button"
          className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--surface-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25"
          aria-label="Voice input"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-6 w-6"
          >
            <path strokeLinecap="round" d="M6 15V9m4 6V7m4 8V6m4 6v-2" />
          </svg>
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-14 items-center justify-center rounded-2xl bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
