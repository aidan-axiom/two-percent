import { useState } from "react";
import { useAuth } from "./AuthContext";
import AuthForm from "./components/AuthForm";
import Demo from "./components/Demo";
import Kitchen from "./components/Kitchen";
import SavedRecipes from "./components/SavedRecipes";
import Settings from "./components/Settings";
import SuggestionsView from "./components/SuggestionsView";
import type { RecipeSuggestions } from "./types";
import "./App.css";

type Tab = "kitchen" | "suggestions" | "saved" | "demo" | "settings";

const TABS: { id: Tab; label: string }[] = [
  { id: "kitchen", label: "Kitchen" },
  { id: "suggestions", label: "Suggestions" },
  { id: "saved", label: "Saved" },
  { id: "demo", label: "Demo" },
  { id: "settings", label: "Settings" },
];

export default function App() {
  const { user, loading, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("kitchen");
  const [showDemo, setShowDemo] = useState(false);
  // lifted so switching tabs doesn't lose results
  const [suggestions, setSuggestions] = useState<RecipeSuggestions | null>(null);

  if (loading) return <div className="center">Loading…</div>;
  if (!user) {
    return showDemo ? (
      <div className="app">
        <header>
          <h1>
          2<span className="logo-dot">%</span>
        </h1>
          <button className="link" onClick={() => setShowDemo(false)}>
            Back to sign in
          </button>
        </header>
        <Demo onGetStarted={() => setShowDemo(false)} />
      </div>
    ) : (
      <AuthForm onShowDemo={() => setShowDemo(true)} />
    );
  }

  return (
    <div className="app">
      <header>
        <h1>
          2<span className="logo-dot">%</span>
        </h1>
        <div className="user-info">
          <span>{user.email}</span>
          <button className="link" onClick={logout}>
            Log out
          </button>
        </div>
      </header>
      <nav>
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            className={tab === id ? "tab active" : "tab"}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      <main>
        {tab === "kitchen" && <Kitchen />}
        {tab === "suggestions" && (
          <SuggestionsView
            suggestions={suggestions}
            onSuggestions={setSuggestions}
            onOpenSettings={() => setTab("settings")}
          />
        )}
        {tab === "saved" && <SavedRecipes />}
        {tab === "demo" && <Demo />}
        {tab === "settings" && <Settings />}
      </main>
    </div>
  );
}
