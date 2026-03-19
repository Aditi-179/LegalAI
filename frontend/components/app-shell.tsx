"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [{ href: "/chat", label: "Assistant" }];

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/chat": {
    title: "Assistant",
    subtitle: "Ask questions, inspect citations, and work directly against Aditi's backend flow.",
  },
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const current = pageMeta[pathname] ?? pageMeta["/chat"];

  return (
    <div className="flex min-h-screen bg-white text-gray-900">
      <aside className="w-72 border-r border-gray-200 bg-[#fffaf2]">
        <div className="flex h-full flex-col p-6">
          <Link href="/" className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E85D04] text-lg font-bold text-white">
              L
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">LegalAI</div>
              <div className="text-sm text-gray-500">Frontend aligned to chat backend</div>
            </div>
          </Link>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive ? "bg-[#E85D04] text-white" : "bg-white text-gray-700 hover:bg-orange-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-3xl border border-orange-100 bg-white p-5">
            <div className="eyebrow">Backend</div>
            <h2 className="mt-2 text-lg font-semibold text-gray-900">Kept as-is</h2>
            <p className="mt-2 text-sm text-gray-600">
              This workspace now assumes the existing backend contract instead of auth, drafts, uploads, and history
              routes.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1">
        <header className="border-b border-gray-100 bg-white/90 px-8 py-5 backdrop-blur">
          <h1 className="text-xl font-semibold text-gray-900">{current.title}</h1>
          <p className="mt-1 text-sm text-gray-500">{current.subtitle}</p>
        </header>
        <div className="p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </main>
    </div>
  );
}
