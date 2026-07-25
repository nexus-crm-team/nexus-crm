import { useState } from "react";
import { apiSend, setAuthSession } from "../api";

const initialForm = {
  // Company details
  companyName: "",
  industry: "",
  companyEmail: "",
  companyPhone: "",
  country: "Armenia",
  region: "-",
  city: "Yerevan",
  street: "",
  postalCode: "",

  // Admin user details
  userName: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterCompanyPage({ onRegisterSuccess, onGoToLogin }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const payload = {
      companyName: form.companyName.trim(),
      industry: form.industry.trim(),
      companyEmail: form.companyEmail.trim(),
      companyPhone: form.companyPhone.trim(),
      companyAddress: {
        country: form.country.trim(),
        region: form.region.trim() || "-",
        city: form.city.trim(),
        street: form.street.trim() || "-",
        postalCode: form.postalCode.trim() || null,
      },
      userName: form.userName.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
    };

    const result = await apiSend("/auth/register-company-admin", "POST", payload);
    setLoading(false);

    if (result.isSuccess && result.data) {
      setAuthSession(result.data);
      onRegisterSuccess(result.data);
    } else {
      setError(result.message || "Registration failed. Please check the entered data.");
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--bg)",
      padding: "32px 16px",
    }}>
      <div className="modal" style={{ maxWidth: 650, width: "100%", animation: "modalIn 0.25s ease" }}>
        <div className="modal-header" style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
          <div className="flex-center gap-12">
            <div className="sidebar-logo-icon">Nx</div>
            <div className="sidebar-logo-text" style={{ fontSize: 20 }}>Nexus<span>CRM</span></div>
          </div>
          <p className="text-sm text-2" style={{ marginTop: 4 }}>
            Register your Company & Admin Account (Atomic Transaction)
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: "75vh", overflowY: "auto" }}>
            {error && <div className="alert alert-error">{error}</div>}

            {/* Section 1: Company Info */}
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              1. Company Information
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input
                  className="form-input"
                  value={form.companyName}
                  onChange={e => handleChange("companyName", e.target.value)}
                  placeholder="Acme Technologies"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Industry *</label>
                <input
                  className="form-input"
                  value={form.industry}
                  onChange={e => handleChange("industry", e.target.value)}
                  placeholder="Software / IT"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Company Email *</label>
                <input
                  className="form-input"
                  type="email"
                  value={form.companyEmail}
                  onChange={e => handleChange("companyEmail", e.target.value)}
                  placeholder="info@acme.com"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Company Phone *</label>
                <input
                  className="form-input"
                  value={form.companyPhone}
                  onChange={e => handleChange("companyPhone", e.target.value)}
                  placeholder="+37411223344"
                  required
                />
              </div>
            </div>

            <div className="form-row" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
              <div className="form-group">
                <label className="form-label">Country *</label>
                <input
                  className="form-input"
                  value={form.country}
                  onChange={e => handleChange("country", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  className="form-input"
                  value={form.city}
                  onChange={e => handleChange("city", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Street</label>
                <input
                  className="form-input"
                  value={form.street}
                  onChange={e => handleChange("street", e.target.value)}
                  placeholder="Baghramyan 1"
                />
              </div>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "8px 0" }} />

            {/* Section 2: Admin Account Info */}
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--accent)", textTransform: "uppercase", letterSpacing: 0.5 }}>
              2. Company Admin User
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Admin Username *</label>
                <input
                  className="form-input"
                  value={form.userName}
                  onChange={e => handleChange("userName", e.target.value)}
                  placeholder="admin_john"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Admin Email *</label>
                <input
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={e => handleChange("email", e.target.value)}
                  placeholder="john@acme.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Admin Phone *</label>
              <input
                className="form-input"
                value={form.phoneNumber}
                onChange={e => handleChange("phoneNumber", e.target.value)}
                placeholder="+37499123456"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password * (min 8 chars)</label>
                <input
                  className="form-input"
                  type="password"
                  value={form.password}
                  onChange={e => handleChange("password", e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input
                  className="form-input"
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => handleChange("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ flexDirection: "column", gap: 12, alignItems: "stretch" }}>
            <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ justifyContent: "center" }}>
              {loading ? "Registering Company & Admin…" : "Register Company & Admin"}
            </button>

            <div style={{ textAlign: "center", fontSize: 13, color: "var(--text-2)" }}>
              Already have an account?{" "}
              <button
                type="button"
                style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 600, cursor: "pointer", padding: 0, font: "inherit" }}
                onClick={onGoToLogin}
              >
                Sign In
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
