import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FCFBF8] text-gray-900 flex flex-col font-sans selection:bg-orange-200 selection:text-orange-900">
      <header className="px-6 py-5 md:px-12 md:py-6 flex items-center justify-between sticky top-0 bg-[#FCFBF8]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#E85D04] rounded flex items-center justify-center text-white font-bold text-xl shadow-sm">L</div>
          <span className="text-xl font-bold tracking-tight">LegalAI</span>
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-[#E85D04] transition-colors">
            Login
          </Link>
          <Link href="/login" className="text-sm font-semibold bg-[#E85D04] text-white px-5 py-2.5 rounded-full hover:bg-[#CC5200] transition-colors shadow-sm shadow-orange-500/30">
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center pt-16 md:pt-24 px-4 text-center max-w-5xl mx-auto mb-20 w-full">
        <div className="inline-block mb-6 px-4 py-1.5 bg-orange-100 text-[#E85D04] rounded-full text-sm font-bold tracking-wide uppercase">
          Meet Your Legal Copilot
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1]">
          Draft, Search, and Simplify <br className="hidden md:block" />
          <span className="text-[#E85D04]">Legal Documents</span> in Seconds
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-3xl leading-relaxed">
          The ultimate workspace for legal professionals. Instantly map IPC to BNS, get AI-powered explanations for complex PDFs, and generate reliable legal drafts effortlessly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
          <Link href="/login" className="bg-[#E85D04] text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-[#CC5200] transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5">
            Start Drafting Now
          </Link>
          <Link href="/login" className="bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
            Watch Demo
          </Link>
        </div>
        
        {/* Placeholder for Hero Image or Dashboard Mockup */}
        <div className="mt-16 w-full max-w-4xl relative group">
            {/* Subtle glow effect behind the mockup */}
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-amber-300 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 overflow-hidden h-80 md:h-[28rem] w-full flex flex-col">
                <div className="w-full h-full bg-gray-50 rounded-t-xl border border-gray-100 flex flex-col">
                    <div className="h-10 border-b border-gray-200 flex items-center px-4 gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="flex-1 p-6 flex flex-col gap-4 opacity-50">
                        <div className="w-3/4 h-8 bg-gray-200 rounded-md"></div>
                        <div className="w-1/2 h-4 bg-gray-200 rounded-md"></div>
                        <div className="w-full h-32 bg-gray-100 rounded-md mt-4 border border-gray-200"></div>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}