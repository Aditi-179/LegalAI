"use client";

import { useEffect, useState } from "react";

import { fetchHistory } from "@/lib/api";

export function HistoryFeed() {
  const [items, setItems] = useState<Awaited<ReturnType<typeof fetchHistory>>>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const result = await fetchHistory();
        if (!ignore) {
          setItems(result);
        }
      } catch (historyError) {
        if (!ignore) {
          setError(historyError instanceof Error ? historyError.message : "Unable to load history.");
        }
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="page-stack">
      <section className="panel">
        <span className="eyebrow">History</span>
        <h2>Recent activity</h2>
        <p>Questions, document summaries, and drafts saved to your account appear here.</p>
      </section>

      <section className="timeline-card">
        {error ? <div className="result-box">{error}</div> : null}
        {items.length ? (
          <ul className="timeline-list">
            {items.map((item, index) => (
              <li key={`${item.kind}-${index}`} className="result-box">
                <strong>{item.kind.toUpperCase()}</strong>
                <div>{item.title}</div>
                <div className="muted">{item.summary}</div>
                <div className="mono muted">{item.created_at}</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">Nothing saved yet.</div>
        )}
      </section>
    </div>
  );
}
