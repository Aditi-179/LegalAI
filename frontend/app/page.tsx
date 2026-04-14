import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 md:px-10">
        <header className="flex items-center justify-between pb-6">
          <Link href="/chat" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#bea97c] text-base font-semibold text-white">
              L
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-[#6f6558]">
                LegalAI
              </p>
              <p className="text-xs text-[#6f6558]">
                Professional legal workspace
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-[#4f4639] hover:text-[#2f2924]"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="rounded-2xl bg-[#bea97c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9c8d6a]"
            >
              Get started
            </Link>
          </nav>
        </header>

        <main className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-[#d8c5a9] bg-[#f8f2e8] px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#726a5f]">
              Trusted legal workspace
            </span>
            <h1 className="mt-8 text-4xl font-semibold tracking-tight text-[var(--text)] md:text-5xl">
              Bring legal research, document review, and drafting into one
              polished workspace.
            </h1>
            <p className="mt-6 text-base leading-7 text-[#635b50]">
              A calm, professional platform for legal teams to simplify
              documents, review section references, and generate reliable draft
              material with confidence.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl bg-[#bea97c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#9c8d6a]"
              >
                Start drafting
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-[#d8c5a9] bg-white px-6 py-3 text-sm font-semibold text-[#4f4639] transition hover:bg-[#f5efe4]"
              >
                Watch demo
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] border border-[var(--line)] bg-[var(--card)] p-8 shadow-[0_24px_45px_rgba(58,50,41,0.08)]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-[#726a5f]">
                  Workspace preview
                </p>
                <h2 className="mt-3 text-xl font-semibold text-[#26211b]">
                  A quiet, reliable legal workflow
                </h2>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4 text-sm text-[var(--text)]">
                Ask legal questions and review returned context in one place.
              </div>
              <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4 text-sm text-[var(--text)]">
                Search section references, explain documents, and manage drafts.
              </div>
              <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-4 text-sm text-[var(--text)]">
                Designed for lawyers who need a calm, trustworthy workspace.
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
