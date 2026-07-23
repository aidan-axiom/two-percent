import { useState, type FormEvent } from "react";
import { useAuth } from "../AuthContext";

export default function AuthForm({ onShowDemo }: { onShowDemo?: () => void }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-card">
      <h1>
        2<span className="logo-dot">%</span>
      </h1>
      <p className="tagline">Cook what you have.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={mode === "register" ? "Password (8+ characters)" : "Password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={mode === "register" ? 8 : undefined}
          required
        />
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={busy}>
          {busy ? "..." : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>
      <button
        className="link"
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setError(null);
        }}
      >
        {mode === "login"
          ? "New here? Create an account"
          : "Already have an account? Log in"}
      </button>
      {onShowDemo && (
        <button className="link" onClick={onShowDemo}>
          See how it works first
        </button>
      )}
    </div>
  );
}
