"use client";

import { FormEvent, useState, useRef, useEffect, ChangeEvent } from "react";
import { queryAssistantStream, getStoredUser, explainDocument } from "@/lib/api";

type Message = {
  role: "user" | "assistant";
  content: string;
  contexts?: string[];
  isDoc?: boolean;
  fileName?: string;
  isUploadAction?: boolean;
};

export function ChatWorkbench() {
  const user = getStoredUser();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [activeDoc, setActiveDoc] = useState<{ name: string; content: string } | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPending]);

  const onFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPendingFile(file);
      setError("");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!question.trim() && !pendingFile) return;
    if (isPending) return;

    const currentQuestion = question;
    const currentFile = pendingFile;
    
    // Add user message(s)
    const newMessages: Message[] = [];
    if (currentFile) {
      newMessages.push({ 
        role: "user", 
        content: currentQuestion || `Uploaded ${currentFile.name}`, 
        isUploadAction: true,
        fileName: currentFile.name 
      });
    } else {
      newMessages.push({ role: "user", content: currentQuestion });
    }
    
    setMessages((prev) => [...prev, ...newMessages]);
    setQuestion("");
    setPendingFile(null);
    setError("");
    setIsPending(true);

    try {
      let contextText = activeDoc?.content || "";
      
      // 1. If file, upload first
      if (currentFile) {
        const uploadResult = await explainDocument(currentFile);
        contextText = uploadResult.explanation;
        setActiveDoc({ name: currentFile.name, content: uploadResult.explanation });
      }

      // 2. Prepare assistant placeholder
      const assistantIdx = messages.length + newMessages.length;
      setMessages((prev) => [...prev, { role: "assistant", content: "", contexts: [] }]);

      // 3. Stream query
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const queryText = currentQuestion || "Please explain this document.";
      
      const stream = queryAssistantStream(queryText, history, contextText);
      let fullAnswer = "";
      
      for await (const chunk of stream) {
        // Check for context metadata
        if (chunk.startsWith("__CONTEXT__:")) {
          const contextJson = chunk.replace("__CONTEXT__:", "").trim();
          try {
            const contexts = JSON.parse(contextJson);
            setMessages((prev) => {
              const updated = [...prev];
              updated[assistantIdx] = { ...updated[assistantIdx], contexts };
              return updated;
            });
          } catch (e) {
            console.error("Context parse error:", e);
          }
          continue;
        }

        fullAnswer += chunk;
        setMessages((prev) => {
          const updated = [...prev];
          updated[assistantIdx] = { ...updated[assistantIdx], content: fullAnswer };
          return updated;
        });
      }

    } catch (submissionError) {
      console.error("Submission Error:", submissionError);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const removePendingFile = () => {
    setPendingFile(null);
  };

  const suggestions = [
    "I'm an intern and being asked to overwork. What are my rights?",
    "How to send a legal notice for unpaid salary?",
    "What are the grounds for divorce in India?",
    "Explain my rights if my landlord refuses to return my deposit."
  ];

  return (
    <div className="messenger-shell">
      <div className="messenger-messages">
        {messages.length === 0 ? (
          <div className="messenger-welcome">
            <h1>Hi {user?.name || "there"}</h1>
            <h2>Where should we start?</h2>
            <div className="suggestion-grid">
              {suggestions.map((s) => (
                <button 
                  key={s} 
                  className="suggestion-chip"
                  onClick={() => setQuestion(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`message-row ${msg.role}`}>
              {msg.role === "user" ? (
                <div className="flex flex-col items-end gap-2 max-w-[85%]">
                  {msg.isUploadAction && (
                    <div className="user-file-chip">
                      <div className="file-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <div className="file-info">
                        <div className="file-name">{msg.fileName}</div>
                        <div className="file-type">PDF Document</div>
                      </div>
                    </div>
                  )}
                  {msg.content && (!msg.isUploadAction || msg.content !== msg.fileName) && (
                    <div className="user-bubble">{msg.content}</div>
                  )}
                </div>
              ) : (
                <div className={`ai-container message-content ${isPending && idx === messages.length - 1 ? 'stream-active' : ''}`}>
                  <div className="ai-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                    </svg>
                  </div>
                  <div className="ai-body">
                    <div className="ai-text">
                      {msg.content}
                      {isPending && idx === messages.length - 1 && <span className="typing-cursor"></span>}
                    </div>
                    {msg.contexts && msg.contexts.length > 0 && (
                      <div className="ai-citations">
                        <span className="eyebrow" style={{ display: 'block', marginBottom: '8px' }}>Sources</span>
                        <div className="flex flex-wrap gap-2">
                          {msg.contexts.map((ctx, cIdx) => (
                            <div key={cIdx} className="citation-chip">
                              {ctx.split('\n')[0]}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        
        {isPending && messages[messages.length - 1]?.content === "" && (
          <div className="message-row assistant">
             <div className="ai-container message-content">
                <div className="ai-icon">
                   <div className="thinking-dot-container">
                      <div className="thinking-dot"></div>
                      <div className="thinking-dot"></div>
                      <div className="thinking-dot"></div>
                   </div>
                </div>
                <div className="ai-text thinking-text">Thinking...</div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="messenger-input-area">
        <div className="flex flex-col gap-2 mb-3 px-4">
          {activeDoc && !pendingFile && (
            <div className="active-doc-badge self-start">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <span>Active: {activeDoc.name}</span>
              <button onClick={() => setActiveDoc(null)} className="ml-1 hover:text-orange-900">×</button>
            </div>
          )}
          
          {pendingFile && (
            <div className="user-file-chip pending self-start" style={{ marginBottom: 0, borderStyle: 'dashed', borderColor: 'var(--accent)' }}>
              <div className="file-icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div className="file-info">
                <div className="file-name">{pendingFile.name}</div>
                <div className="file-type">Ready to upload</div>
              </div>
              <button onClick={removePendingFile} className="ml-4 text-gray-400 hover:text-red-500 text-lg">×</button>
            </div>
          )}
        </div>
        
        <form onSubmit={onSubmit} className="messenger-input-wrapper">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={onFileSelect} 
            className="hidden" 
            accept=".pdf,.txt"
          />
          <button 
            type="button" 
            className="messenger-button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach legal document"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <input
            className="messenger-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={pendingFile ? `Ask about ${pendingFile.name}...` : "Ask anything"}
          />
          <div className="messenger-actions">
            {error && <span className="field-hint" style={{ color: '#d96570', marginRight: '10px' }}>{error}</span>}
            <button 
              type="submit" 
              className={`messenger-button primary ${(isPending || (!question.trim() && !pendingFile)) ? 'opacity-40 cursor-not-allowed' : ''}`} 
              disabled={isPending || (!question.trim() && !pendingFile)}
            >
               <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
               </svg>
            </button>
          </div>
        </form>
        <p className="field-hint input-footer-text">
          LegalAI can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
