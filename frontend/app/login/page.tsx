"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    // For UI mocking purposes, immediately push to the app shell workspace.
    // Hook up real auth logic here when ready.
    router.push("/chat");
  };

  return (
    <div className="min-h-screen bg-[#f7f1e8] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[28px] border border-[#d8c5a9] bg-white p-8 shadow-[0_24px_45px_rgba(58,50,41,0.08)]">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-3 text-[#26211b]">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#bea97c] text-sm font-semibold text-white">
              L
            </div>
            <span className="text-lg font-semibold tracking-tight">LegalAI</span>
          </Link>
        </div>

        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.28em] text-[#6f6558]">Professional access</p>
          <h1 className="mt-4 text-3xl font-semibold text-[#26211b]">Sign in to your workspace</h1>
          <p className="mt-3 text-sm leading-6 text-[#635b50]">
            Enter your credentials to continue with your secure LegalAI workspace.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#2f2924] mb-2">Email address</label>
            <input
              type="email"
              defaultValue="demo@legalai.local"
              className="w-full rounded-2xl border border-[#d8c5a9] bg-[#fbf5ec] px-4 py-3 text-[#2f2924] outline-none transition focus:border-[#bea97c] focus:ring-2 focus:ring-[#bea97c]/20"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2f2924] mb-2">Password</label>
            <input
              type="password"
              defaultValue="password123"
              className="w-full rounded-2xl border border-[#d8c5a9] bg-[#fbf5ec] px-4 py-3 text-[#2f2924] outline-none transition focus:border-[#bea97c] focus:ring-2 focus:ring-[#bea97c]/20"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-2xl bg-[#bea97c] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#9c8d6a]"
          >
            Sign in
          </button>
        </form>

        <div className="mt-6 rounded-2xl border border-[#ebe1d2] bg-[#f8f2e8] px-4 py-3 text-sm text-[#6f6558]">
          Demo credentials are prefilled for quick access.
        </div>
      </div>
    </div>
  );
}