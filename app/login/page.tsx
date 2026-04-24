"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin:   "Incorrect username or password.",
  SessionRequired:     "Please sign in to continue.",
  Default:             "An error occurred. Please try again.",
};

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const urlError     = searchParams.get("error");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState(
    urlError ? (ERROR_MESSAGES[urlError] ?? ERROR_MESSAGES.Default) : ""
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(ERROR_MESSAGES[result.error] ?? ERROR_MESSAGES.Default);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Glowdesk</h1>
          <p className="text-[13px] text-gray-400 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-gray-500 font-medium">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your username"
                required
                autoComplete="username"
                className="px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-gray-500 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
              />
            </div>

            {error && (
              <p className="text-[12px] text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-2.5 bg-gray-900 text-white text-[13px] font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-4">
          Contact your administrator if you need access.
        </p>
      </div>
    </div>
  );
}