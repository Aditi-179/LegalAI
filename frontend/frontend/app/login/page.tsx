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
    <div className="min-h-screen bg-[#FCFBF8] flex flex-col justify-center items-center font-sans p-4 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 hover:opacity-80 transition-opacity z-20">
        <div className="w-8 h-8 bg-[#E85D04] rounded flex items-center justify-center text-white font-bold text-xl shadow-sm">L</div>
        <span className="text-xl font-bold tracking-tight text-gray-900">LegalAI</span>
      </Link>

      <div className="max-w-[400px] w-full bg-white rounded-2xl shadow-xl shadow-orange-900/5 border border-orange-100 p-8 sm:p-10 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Welcome back</h2>
          <p className="text-sm text-gray-500 mt-2 font-medium">Enter your credentials to access your workspace</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email address</label>
            <input
              type="email"
              defaultValue="demo@legalai.local"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-[#E85D04] outline-none transition-all text-gray-900 font-medium"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              defaultValue="password123"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-[#E85D04] outline-none transition-all text-gray-900 font-medium"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#E85D04] text-white font-bold py-3.5 rounded-xl hover:bg-[#CC5200] transition-colors mt-4 shadow-md shadow-orange-500/20"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}