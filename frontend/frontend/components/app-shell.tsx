"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { clearSession, getStoredUser } from "@/lib/api";

const navItems = [
  { 
    href: "/chat", 
    label: "Assistant",
    icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
  },
  { 
    href: "/mapping", 
    label: "Mapping",
    icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
  },
  { 
    href: "/upload", 
    label: "Documents",
    icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
  },
  { 
    href: "/draft", 
    label: "Drafts",
    icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
  },
  { 
    href: "/history", 
    label: "History",
    icon: <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
];

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/chat": { title: "Assistant", subtitle: "Ask legal questions and review the returned context." },
  "/mapping": { title: "Mapping", subtitle: "Search IPC and BNS section references directly." },
  "/upload": { title: "Documents", subtitle: "Upload a file and get a simpler explanation." },
  "/draft": { title: "Drafts", subtitle: "Generate a first draft from structured details." },
  "/history": { title: "History", subtitle: "Review your recent saved activity." },
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

  const handleLogout = () => {
    clearSession();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex h-screen bg-white text-gray-900 font-sans">
      {/* ChatGPT Style Dark Sidebar */}
      <aside className="w-64 bg-[#171717] text-[#ececec] flex flex-col transition-all duration-300">
        <div className="p-4 py-6">
          <Link href="/chat" className="flex items-center gap-3 px-2 mb-6 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-[#E85D04] rounded flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-orange-900/50">L</div>
            <span className="text-lg font-semibold tracking-wide text-white">LegalAI</span>
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-[#2f2f2f] text-white" : "text-gray-300 hover:bg-[#212121] hover:text-white"}`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile Area */}
        <div className="mt-auto p-3 mb-2">
          <div className="flex items-center w-full p-2 rounded-xl hover:bg-[#2f2f2f] transition-colors group relative">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-orange-400 to-[#E85D04] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-inner">
              {userName.slice(0, 1).toUpperCase()}
            </div>
            <div className="ml-3 overflow-hidden flex-1 text-left">
              <div className="text-sm font-medium text-white truncate">{userName}</div>
              <div className="text-xs text-gray-400 truncate">{userEmail}</div>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-gray-600/30" title="Log out">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-white">
        <header className="h-14 flex items-center justify-between px-6 border-b border-gray-100 bg-white/90 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-gray-800 flex items-center gap-2">
              {current.title} <span className="text-sm font-normal text-gray-400 hidden sm:inline-block">— {current.subtitle}</span>
            </h2>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
