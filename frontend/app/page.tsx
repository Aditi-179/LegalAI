import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FCFBF8] text-gray-900 selection:bg-orange-200 selection:text-orange-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 md:px-10">
        <header className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E85D04] text-lg font-bold text-white">
              L
            </div>
            <div>
              <div className="text-xl font-semibold tracking-tight">LegalAI</div>
              <div className="text-sm text-gray-500">Indian legal assistant</div>
            </div>
          </div>
          <Link
            href="/chat"
            className="rounded-full bg-[#E85D04] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#CC5200]"
          >
            Open Assistant
          </Link>
        </header>

        <main className="grid flex-1 items-center gap-10 py-12 md:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <section>
            <div className="inline-flex rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold uppercase tracking-wide text-[#E85D04]">
              Chat-first frontend
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
              Ask Indian legal questions and inspect the cited sections.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              The frontend has been simplified around the backend you wanted to keep. It now centers on Aditi&apos;s
              retrieval-plus-answer flow instead of showing extra workspace sections the backend does not support.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/chat"
                className="rounded-full bg-[#E85D04] px-7 py-4 text-lg font-semibold text-white transition-colors hover:bg-[#CC5200]"
              >
                Start Chatting
              </Link>
            </div>
          </section>

          <section className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-xl shadow-orange-900/5">
            <div className="rounded-[1.5rem] border border-gray-200 bg-[#fffaf2] p-5">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl bg-white p-4 text-sm text-gray-700 shadow-sm">
                  My employer withheld wages for two months. What legal remedies may apply?
                </div>
                <div className="rounded-2xl bg-orange-50 p-4 text-sm text-gray-700">
                  The assistant returns an answer plus cited acts, section numbers, and confidence scores.
                </div>
                <div className="rounded-2xl border border-dashed border-orange-200 p-4 text-sm text-gray-500">
                  One focused workflow. No fake auth gates. No unsupported sidebar tools.
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
