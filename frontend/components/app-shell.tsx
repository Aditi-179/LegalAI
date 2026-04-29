"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { clearSession, getStoredUser } from "@/lib/api";

const navItems = [
  {
    href: "/chat",
    label: "Assistant",
    icon: (
      <svg
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5 text-[var(--accent)]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
        />
      </svg>
    ),
  },
  {
    href: "/upload",
    label: "Documents",
    icon: (
      <svg
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5 text-[var(--accent)]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
    ),
  },
  {
    href: "/draft",
    label: "Drafts",
    icon: (
      <svg
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5 text-[var(--accent)]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
        />
      </svg>
    ),
  },
  {
    href: "/history",
    label: "History",
    icon: (
      <svg
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5 text-[var(--accent)]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/chat": {
    title: "Assistant",
    subtitle: "Ask legal questions and review returned context.",
  },
  "/upload": {
    title: "Documents",
    subtitle: "Upload a file and get a simpler explanation.",
  },
  "/draft": {
    title: "Drafts",
    subtitle: "Generate a first draft from structured details.",
  },
  "/history": {
    title: "History",
    subtitle: "Review your recent saved activity.",
  },
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const current = pageMeta[pathname] ?? pageMeta["/chat"];
  const [userName] = useState(() => {
    const user = getStoredUser();
    return user?.name ?? "LegalAI User";
  });
  const [userEmail] = useState(() => {
    const user = getStoredUser();
    return user?.email ?? "demo@legalai.local";
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("legalai-theme");
    const systemDefault = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    setTheme(
      storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : systemDefault,
    );
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("theme-dark", theme === "dark");
    window.localStorage.setItem("legalai-theme", theme);
  }, [theme]);

  const handleLogout = () => {
    clearSession();
    router.push("/login");
    router.refresh();
  };

  const toggleTheme = () =>
    setTheme((current) => (current === "dark" ? "light" : "dark"));

  return (
    <div className="app-shell h-screen font-sans">
      <aside
        className={`sidebar flex flex-col transition-all duration-300 ${isCollapsed ? "w-20" : "w-72"}`}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-4">
          <Link href="/chat" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#bea97c] text-base font-semibold text-white">
              L
            </div>
            {/*  CHANGE 1: LegalAI brand text — lighter gold-tan */}
            <span
              className={`text-base font-semibold tracking-wide text-[#c4ae8a] ${isCollapsed ? "hidden" : "block"}`}
            >
              LegalAI
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setIsCollapsed((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#d8c5a9] bg-white text-[#6f6558] transition hover:bg-[#f1ebe3]"
            aria-label="Toggle sidebar"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 7h16M4 12h16M4 17h16"
              />
            </svg>
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-2 px-2 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? //  CHANGE 2: Active nav — subtle muted beige, no harsh contrast
                      "bg-[#ddd0c0]/60 text-[#c4ae8a]"
                    : "text-[#5f574c] hover:bg-[#efe7dd] hover:text-[#2f2924]"
                }`}
              >
                {item.icon}
                <span className={`${isCollapsed ? "hidden" : "block"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto px-3 pb-4">
          <div className="group flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-3 transition hover:border-[var(--accent)]">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--accent)] text-sm font-semibold text-white">
              {userName.slice(0, 1).toUpperCase()}
            </div>
            <div className={`${isCollapsed ? "hidden" : "block"} min-w-0`}>
              {/*  CHANGE 3: User name — lighter warm tan */}
              <div className="text-sm font-semibold text-[#b8a07a] truncate">
                {userName}
              </div>
              <div className="text-xs text-[#6f6558] truncate">{userEmail}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-sm font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--text)] ${isCollapsed ? "hidden" : "inline-flex"}`}
          >
            <svg
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden bg-[var(--bg)]">
        <header className="sticky top-0 z-10 border-b border-[var(--line)] bg-[var(--surface)] px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-[var(--muted)]">
                {current.title}
              </p>
              <p className="mt-1 text-lg font-semibold text-[var(--text)]">
                {current.subtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0l-1.414-1.414M7.05 7.05L5.636 5.636M12 7a5 5 0 100 10 5 5 0 000-10z"
                  />
                </svg>
              )}
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </main>
    </div>
  );
}
