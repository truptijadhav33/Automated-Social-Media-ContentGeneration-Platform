import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const steps = [
  {
    icon: (
      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "Describe your feature",
    desc: "Fill out a short brief — feature name, description, key benefit, and pick your platforms.",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: "AI generates content",
    desc: "Groq's LLaMA 3.3 crafts platform-optimised captions, hashtags, and alternatives in seconds.",
  },
  {
    icon: (
      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    title: "Copy, export, publish",
    desc: "Review, pick your favourite variant, copy to clipboard, or export as JSON / Markdown.",
  },
];

const platforms = [
  { name: "LinkedIn", color: "bg-[#0A66C2]", text: "text-white", desc: "3000 char professional posts" },
  { name: "Twitter", color: "bg-[#1DA1F2]", text: "text-white", desc: "280 char punchy tweets" },
  { name: "Instagram", color: "bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]", text: "text-white", desc: "2200 char captions + hashtags" },
  { name: "WhatsApp", color: "bg-[#25D366]", text: "text-slate-900", desc: "1024 char conversational messages" },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-gradient-to-b from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero */}
      <section className="text-center px-4 py-20 sm:py-28 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
          Generate Social Media Content in Seconds
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
          AI-powered captions for LinkedIn, Twitter, Instagram & WhatsApp — from one feature brief.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {isAuthenticated ? (
            <>
              <Link
                to="/launch"
                className="inline-flex items-center gap-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Go to Launch &rarr;
              </Link>
              <Link
                to="/history"
                className="inline-flex items-center gap-1 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                View History
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex items-center gap-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Get Started &rarr;
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-1 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-6 py-3 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
          How it works
        </h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/40 mb-4">
                {step.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Platform cards */}
      <section className="px-4 py-16 max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
          Platforms we support
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {platforms.map((p) => (
            <div
              key={p.name}
              className={`${p.color} ${p.text} rounded-xl p-6 flex flex-col justify-between min-h-[100px]`}
            >
              <h3 className="text-xl font-bold">{p.name}</h3>
              <p className="text-sm opacity-90 mt-1">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="text-center px-4 py-16">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Built with Groq + LLaMA 3.3
        </p>
        <Link
          to={isAuthenticated ? "/launch" : "/register"}
          className="inline-flex items-center gap-1 bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
        >
          Start your first launch &rarr;
        </Link>
      </section>
    </div>
  );
}
