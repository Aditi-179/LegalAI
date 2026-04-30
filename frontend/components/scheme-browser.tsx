"use client";

import { useState, useTransition } from "react";
import { searchSchemes, Scheme } from "@/lib/api";

export function SchemeBrowser() {
  const [query, setQuery] = useState("");
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [isPending, startTransition] = useTransition();
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    startTransition(async () => {
      try {
        const data = await searchSchemes(query);
        setSchemes(data.schemes);
        setHasSearched(true);
      } catch (err) {
        console.error("Search failed:", err);
      }
    });
  };

  return (
    <div className="messenger-shell" style={{ maxWidth: '1000px' }}>
      <div className="messenger-welcome" style={{ marginTop: '20px' }}>
        <h1>GovScheme Awareness</h1>
        <h2>Find government schemes you are eligible for.</h2>
      </div>

      <form onSubmit={handleSearch} className="messenger-input-area" style={{ marginBottom: '30px' }}>
        <div className="messenger-input-wrapper" style={{ padding: '4px 16px' }}>
          <input
            className="messenger-input"
            placeholder="Search for schemes (e.g., 'college scholarship', 'business loan for women')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isPending}
          />
          <button type="submit" className="messenger-button primary" disabled={isPending}>
             {isPending ? "..." : "Search"}
          </button>
        </div>
      </form>

      <div className="page-stack">
        {isPending && (
          <div className="ai-container" style={{ padding: '20px' }}>
            <div className="ai-icon">
               <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg>
            </div>
            <div className="ai-text">GovScheme-Agent is searching official government portals...</div>
          </div>
        )}

        {!isPending && hasSearched && schemes.length === 0 && (
          <div className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
             No official schemes found for your query. Try different keywords.
          </div>
        )}

        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {schemes.map((scheme, idx) => (
            <div 
              key={idx} 
              className="panel tool-card clickable" 
              onClick={() => setSelectedScheme(scheme)}
              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
            >
              <div className="eyebrow" style={{ color: 'var(--accent)' }}>GOVERNMENT SCHEME</div>
              <h3 style={{ margin: '8px 0', fontSize: '1.2rem' }}>{scheme.scheme_name}</h3>
              <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{scheme.short_description}</p>
              <div style={{ marginTop: '12px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)' }}>
                View Details →
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedScheme && (
        <div className="modal-overlay" onClick={() => setSelectedScheme(null)}>
          <div className="modal-content panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-start" style={{ marginBottom: '20px' }}>
               <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{selectedScheme.scheme_name}</h2>
               <button className="messenger-button" onClick={() => setSelectedScheme(null)}>✕</button>
            </div>

            <div className="page-stack" style={{ gap: '24px' }}>
              <section>
                <div className="eyebrow">Description</div>
                <p style={{ marginTop: '8px', lineHeight: '1.6' }}>{selectedScheme.short_description}</p>
              </section>

              <section>
                <div className="eyebrow">Eligibility</div>
                <div className="result-box" style={{ marginTop: '8px', background: 'var(--bg-elevated)' }}>
                   {selectedScheme.eligibility}
                </div>
              </section>

              <section>
                <div className="eyebrow">Benefits</div>
                <div className="result-box" style={{ marginTop: '8px', background: 'var(--bg-elevated)' }}>
                   {selectedScheme.benefits}
                </div>
              </section>

              <div className="status-row" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
                 <a 
                   href={selectedScheme.official_link} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="button primary" 
                   style={{ flex: 1, padding: '16px' }}
                 >
                   Apply Now / View Official Portal
                 </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal-content {
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .clickable:hover {
          transform: translateY(-4px);
          border-color: var(--accent);
          box-shadow: 0 8px 30px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
