"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Phone } from "lucide-react";
import { useStore } from "@/lib/store-context";
import Logo from "@/components/Logo";

function AuthForm() {
  const router = useRouter();
  const { refreshUser } = useStore();
  const [demoMode, setDemoMode] = useState(false);
  useEffect(() => {
    fetch("/api/health").then((r) => r.json()).then((j) => {
      if (j && j.databaseConfigured === false) setDemoMode(true);
    }).catch(() => {});
  }, []);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError("");
    if (!email.trim() || !password) { setError("Email and password are required."); return; }
    if (mode === "signup" && !name.trim()) { setError("Please enter your name."); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/auth", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, name, email, mobile, password }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed");
      await refreshUser();
      router.push("/account");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const input = "w-full border border-neutral-200 rounded-xl pl-11 pr-4 py-3.5 text-[14px] bg-white";

  return (
    <div className="min-h-[70vh] grid lg:grid-cols-2 max-w-5xl mx-auto my-6 sm:my-10 mx-4 sm:mx-6 lg:mx-auto rounded-3xl overflow-hidden border border-neutral-200">
      <div className="hidden lg:flex flex-col justify-between bg-black p-10 hero-grain relative">
        <Logo light />
        <div>
          <h2 className="font-display font-black text-white text-4xl leading-tight">Welcome to<br /><span className="gold-text">Reload Jodhpur.</span></h2>
          <p className="text-neutral-400 text-sm mt-3 max-w-xs">Track orders, sync wishlist, faster checkout & early access to drops.</p>
        </div>
        <p className="text-neutral-500 text-xs">Madhuban Main Road · Jodhpur · YOUR SEARCH END HERE</p>
      </div>
      <div className="p-6 sm:p-10 bg-white">
        <div className="lg:hidden mb-6"><Logo /></div>
        <div className="grid grid-cols-2 bg-neutral-100 rounded-xl p-1 mb-6">
          {(["login", "signup"] as const).map((m) => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} className={`py-2.5 rounded-lg text-[13px] font-extrabold tracking-wider transition ${mode === m ? "bg-black text-[#ffffff]" : "text-neutral-500"}`}>
              {m === "login" ? "LOGIN" : "SIGN UP"}
            </button>
          ))}
        </div>
        <h1 className="font-display font-extrabold text-2xl">{mode === "login" ? "Welcome back" : "Create account"}</h1>
        <p className="text-[13px] text-neutral-500 mt-1">{mode === "login" ? "Login to track orders & sync wishlist." : "One account for web + store benefits."}</p>
        {demoMode && (
          <p className="mt-3 text-[12.5px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
            Demo mode — accounts will be enabled once the database is connected. Cart & wishlist work on this device.
          </p>
        )}
        <div className="space-y-3 mt-6">
          {mode === "signup" && (
            <>
              <div className="relative"><User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" /><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={input} /></div>
              <div className="relative"><Phone size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" /><input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Mobile (optional)" inputMode="numeric" maxLength={10} className={input} /></div>
            </>
          )}
          <div className="relative"><Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" /><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" type="email" className={input} /></div>
          <div className="relative"><Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" /><input value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Password" type="password" className={input} /></div>
        </div>
        {error && <p className="mt-3 text-[13px] font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
        <button onClick={submit} disabled={busy} className="mt-5 w-full py-4 rounded-xl bg-black text-[#ffffff] font-extrabold text-[13px] tracking-[0.12em] disabled:opacity-60">
          {busy ? "PLEASE WAIT…" : mode === "login" ? "LOGIN" : "CREATE ACCOUNT"}
        </button>
        <p className="text-center text-[12px] text-neutral-500 mt-4">
          {mode === "login" ? "New here? " : "Already have an account? "}
          <button onClick={() => setMode(mode === "login" ? "signup" : "login")} className="font-bold text-[#ff0000]">{mode === "login" ? "Create account" : "Login"}</button>
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-sm">Loading…</div>}>
      <AuthForm />
    </Suspense>
  );
}
