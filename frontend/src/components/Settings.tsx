import { useState, type FormEvent } from "react";
import * as api from "../api";
import { useAuth } from "../AuthContext";
import type { Provider } from "../types";

const PROVIDER_LABELS: Record<Provider, string> = {
  gemini: "Google Gemini",
  claude: "Claude (Anthropic)",
};

export default function Settings() {
  const { user, setUser } = useAuth();
  const [provider, setProvider] = useState<Provider>("gemini");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const activeSource = user.own_key_provider
    ? `your own ${PROVIDER_LABELS[user.own_key_provider]} key`
    : user.default_provider
      ? `the app's built-in ${PROVIDER_LABELS[user.default_provider]} key`
      : "nothing — no AI provider is configured";

  async function save(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      setUser(await api.setApiKey(provider, apiKey.trim()));
      setApiKey("");
      setNotice("Key saved. Your suggestions now use it.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save key");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      setUser(await api.removeApiKey());
      setNotice("Key removed. Back to the app default.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove key");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="settings">
      <h2>AI provider</h2>
      <p>
        Suggestions are currently powered by <strong>{activeSource}</strong>.
      </p>
      <p className="hint">
        Optionally use your own API key instead — from{" "}
        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
          Google AI Studio
        </a>{" "}
        (free tier available) or{" "}
        <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">
          Anthropic
        </a>
        . Your key is stored encrypted and only used for your own requests.
      </p>
      <form className="key-form" onSubmit={save}>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as Provider)}
        >
          <option value="gemini">Google Gemini</option>
          <option value="claude">Claude (Anthropic)</option>
        </select>
        <input
          type="password"
          placeholder="Paste your API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          minLength={10}
          required
        />
        <button type="submit" disabled={busy || !apiKey.trim()}>
          Save key
        </button>
      </form>
      {user.own_key_provider && (
        <button className="link danger" disabled={busy} onClick={remove}>
          Remove my key
        </button>
      )}
      {notice && <p className="notice">{notice}</p>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
