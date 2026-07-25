import { useState } from "react";
import { apiSend, setAuthSession } from "../api";

export default function LoginPage({ onLoginSuccess, onGoToRegister }) {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await apiSend("/auth/login", "POST", {
      identifier: form.identifier,
      password: form.password,
    });

    setLoading(false);

    if (result.isSuccess && result.data) {
      setAuthSession(result.data);
      onLoginSuccess(result.data);
    } else {
      setError(result.message || "Login failed. Check your credentials.");
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg)",
      padding: "24px",
    }}>
      <div className="modal" style={{ maxWidth: 420, animation: "modalIn 0.25s ease" }}>
        <div className="modal-header" style={{ flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
          <div className="flex-center gap-12">
            <div className="sidebar-logo-icon">Nx</div>
            <div className="sidebar-logo-text" style={{ fontSize: 20 }}>Nexus<span>CRM</span></div>
          </div>
          <p className="text-sm text-2" style={{ marginTop: 6 }}>Sign in to your CRM workspace</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label className="form-label">Email, Username, or Phone</label>
              <input
                className="form-input"
                type="text"
                value={form.identifier}
                onChange={e => handleChange("identifier", e.target.value)}
                placeholder="admin@company.com or username"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                value={form.password}
                onChange={e => handleChange("password", e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="modal-footer" style={{ flexDirection: "column", gap: 12, alignItems: "stretch" }}>
            <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ justifyContent: "center" }}>
              {loading ? "Signing in…" : "Sign In"}
            </button>

            <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-2)" }}>
              Need to register a new Company?{" "}
              <button
                type="button"
                style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 600, cursor: "pointer", padding: 0, font: "inherit" }}
                onClick={onGoToRegister}
              >
                Register Company & Admin
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
