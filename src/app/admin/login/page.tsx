"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Get stored credentials, fallback to defaults if not set
    const storedEmail =
      localStorage.getItem("admin_email") || "admin@piawai.id";
    const storedPassword = localStorage.getItem("admin_password") || "admin123";

    if (email === storedEmail && password === storedPassword) {
      localStorage.setItem("photobooth_admin_auth", "true");
      router.push("/admin/frames");
    } else {
      setError("Email atau Password salah!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-sky-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm border border-slate-100 text-center animate-fade-in-up">
        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Admin Panel</h1>
        <p className="text-slate-500 mb-6">Login untuk masuk ke dasbor</p>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="masukkan email"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-slate-700 bg-slate-50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 ml-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent font-bold tracking-widest text-slate-700 bg-slate-50"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors shadow-lg active:scale-95"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
