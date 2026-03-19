"use client";

import { FormEvent, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { loginUser, registerUser, storeSession } from "@/lib/api";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({
    name: "LegalAI Demo User",
    email: "demo@legalai.local",
    password: "password123",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    startTransition(async () => {
      try {
        if (mode === "register") {
          await registerUser(form);
          setMessage("Account created. You can log in now.");
          setMode("login");
          return;
        }
        const result = await loginUser({ email: form.email, password: form.password });
        storeSession(result.access_token, result.user);
        setMessage(`Signed in as ${result.user.name}.`);
        router.push("/chat");
        router.refresh();
      } catch (authError) {
        setError(authError instanceof Error ? authError.message : "Authentication failed.");
      }
    });
  };

  return (
    <div className="auth-page">
      <section className="auth-hero">
        <div className="auth-intro">
          <span className="eyebrow">Login</span>
          <h1>Access your main workspace.</h1>
          <p className="hero-copy">Login first, then continue into the main app screen with sidebar and account footer.</p>
          <div className="auth-points">
            <div className="result-box">Assistant</div>
            <div className="result-box">Mapping</div>
            <div className="result-box">Documents</div>
            <div className="result-box">Drafts</div>
          </div>
          <div className="hero-actions">
            <Link href="/" className="ghost-link">
              Back to home
            </Link>
          </div>
        </div>

        <form className="panel field-grid auth-panel" onSubmit={onSubmit}>
          <div className="panel-copy">
            <span className="eyebrow">{mode === "login" ? "Login" : "Register"}</span>
            <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
            <p>
              {mode === "login"
                ? "Access your assistant, documents, mappings, drafts, and saved history."
                : "Create an account to start using the workspace."}
            </p>
          </div>

          <div className="auth-switch">
            <button className={`auth-tab ${mode === "login" ? "active" : ""}`} type="button" onClick={() => setMode("login")}>
              Login
            </button>
            <button
              className={`auth-tab ${mode === "register" ? "active" : ""}`}
              type="button"
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>

          {mode === "register" ? (
            <div className="field-row">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
          ) : null}

          <div className="field-row">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
          </div>

          <div className="field-row">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
          </div>

          <button className="button" type="submit" disabled={isPending}>
            {isPending ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </button>

          {message ? <div className="result-box">{message}</div> : null}
          {error ? <div className="result-box">{error}</div> : null}
        </form>

        <div className="panel auth-side">
          <span className="card-kicker">After Login</span>
          <h2>Main app screen</h2>
          <p>The workspace opens with Assistant, Mapping, Documents, Drafts, and History in the sidebar.</p>
          <div className="auth-flow-list">
            <div className="result-box">Sidebar navigation for all features.</div>
            <div className="result-box">User account block pinned at the bottom.</div>
            <div className="result-box">Cleaner dashboard-style layout after sign in.</div>
          </div>
        </div>
      </section>
    </div>
  );
}
