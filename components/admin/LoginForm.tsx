"use client";

import { ArrowRight, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not connected yet. Add the environment variables from .env.example.");
      setLoading(false);
      return;
    }
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError("We could not sign you in. Check the email and password, then try again.");
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <form className="login-form" onSubmit={submit}>
      <div className="login-mark"><LockKeyhole /></div>
      <p className="eyebrow">Private archive</p>
      <h1>Welcome back.</h1>
      <p>Sign in to add a chapter, arrange photographs, or update your story.</p>
      <label>Email address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
      <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
      {error && <div className="form-alert" role="alert">{error}</div>}
      <button className="button primary" type="submit" disabled={loading}>
        {loading ? "Opening the archive…" : "Sign in"} <ArrowRight size={16} />
      </button>
      <span className="login-note">No public registration. Access is reserved for the site owner.</span>
    </form>
  );
}
