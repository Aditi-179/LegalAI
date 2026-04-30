"use client";

import { ChangeEvent, FormEvent, useState, useTransition } from "react";
import { explainDocument } from "@/lib/api";

export function UploadPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ filename: string; explanation: string; highlights: string[] } | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] ?? null);
    setResult(null); // Clear previous results on new file select
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Please select a PDF or TXT file first.");
      return;
    }
    setError("");
    setResult(null);
    
    startTransition(async () => {
      try {
        const data = await explainDocument(file);
        setResult(data);
      } catch (submissionError) {
        console.error("Upload Error:", submissionError);
        setError(submissionError instanceof Error ? submissionError.message : "Unable to process this document.");
      }
    });
  };

  return (
    <div className="messenger-shell" style={{ maxWidth: '800px' }}>
      <div className="messenger-welcome" style={{ marginTop: '30px' }}>
        <h1>Document Explainer</h1>
        <h2>Simplify complex legal paperwork instantly.</h2>
      </div>

      <section className="page-stack" style={{ gap: '24px' }}>
        <form className="panel field-grid" onSubmit={onSubmit} style={{ background: 'var(--card)' }}>
          <div className="field-row">
            <label htmlFor="document">Select Legal Document</label>
            <div className="messenger-input-wrapper" style={{ padding: '4px 16px', marginTop: '8px' }}>
              <input 
                id="document" 
                type="file" 
                accept=".pdf,.txt" 
                onChange={onFileChange}
                style={{ border: 'none', background: 'transparent', padding: '10px 0', width: '100%' }}
              />
            </div>
            <span className="field-hint" style={{ marginTop: '8px' }}>Supported formats: PDF and Plain Text.</span>
          </div>
          
          <div className="status-row" style={{ justifyContent: 'flex-end' }}>
             {error && <span className="field-hint" style={{ color: '#d96570' }}>{error}</span>}
             <button className={`button ${isPending ? 'opacity-50' : ''}`} type="submit" disabled={isPending}>
               {isPending ? "Analyzing Document..." : "Generate Summary"}
             </button>
          </div>
        </form>

        {(isPending || result) && (
          <div className="panel page-stack" style={{ animation: 'fadeIn 0.4s ease-out' }}>
            <span className="eyebrow">Analysis Result</span>
            {isPending ? (
              <div className="ai-container message-content">
                <div className="ai-icon animate-spin">
                   <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                   </svg>
                </div>
                <div className="ai-text" style={{ color: '#c4c7c5' }}>Reading and summarizing your document...</div>
              </div>
            ) : result && (
              <div className="ai-body" style={{ display: 'grid', gap: '20px' }}>
                <div className="ai-container">
                  <div className="ai-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg>
                  </div>
                  <div className="ai-text" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                    Summary for {result.filename}
                  </div>
                </div>

                <div className="result-box" style={{ background: 'var(--bg-elevated)', border: 'none', lineHeight: '1.8', fontSize: '1rem' }}>
                  {result.explanation}
                </div>

                {result.highlights.length > 0 && (
                  <div>
                    <span className="eyebrow" style={{ display: 'block', marginBottom: '12px' }}>Key Highlights</span>
                    <div className="suggestion-grid" style={{ marginTop: '0' }}>
                      {result.highlights.map((h, i) => (
                        <div key={i} className="suggestion-chip" style={{ cursor: 'default', background: 'var(--accent-soft)', borderColor: 'rgba(222,122,34,0.1)' }}>
                          {h}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
