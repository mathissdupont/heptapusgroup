"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [msg, setMsg] = useState(""); const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setMsg("");
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ email, password }) });
    const j = await res.json();
    if (!res.ok) return setMsg(j?.error || "login failed");
    router.push("/admin");
  }

  return (
    <div className="mx-auto max-w-sm p-6 text-slate-200">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
      <form onSubmit={onSubmit} className="space-y-2">
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" className="w-full border px-2 py-1 bg-transparent" />
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="password" className="w-full border px-2 py-1 bg-transparent" />
        {msg && <div className="text-red-400 text-sm">{msg}</div>}
        <button className="px-3 py-1 rounded bg-emerald-600 text-white">Login</button>
      </form>
    </div>
  );
}
