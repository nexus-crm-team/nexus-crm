import { useEffect, useState } from "react";
import { apiGet, apiSend } from "../api";
import EmptyState from "../components/EmptyState";

const emptyForm = {
  userName: "",
  email: "",
  phoneNumber: "",
  password: "",
  role: 2, // 1 = Manager, 2 = Employee
  avatarUrl: "",
};

// Icons
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const UserIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);

function roleBadge(role) {
  if (role === 0 || role === "Admin")     return <span className="badge badge-accent">Admin</span>;
  if (role === 1 || role === "Manager")   return <span className="badge badge-purple">Manager</span>;
  return <span className="badge badge-info">Employee</span>;
}

export default function EmployeesPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image size should be less than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        set("avatarUrl", reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  async function loadUsers() {
    const r = await apiGet("/users");
    if (r.isSuccess && Array.isArray(r.data)) {
      setUsers(r.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    let ignore = false;
    apiGet("/users").then(r => {
      if (ignore) return;
      if (r.isSuccess && Array.isArray(r.data)) {
        setUsers(r.data);
      }
      setLoading(false);
    });
    return () => { ignore = true; };
  }, []);

  async function handleAddEmployee(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      userName: form.userName.trim(),
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      password: form.password,
      avatarUrl: form.avatarUrl || null,
      role: Number(form.role),
    };

    const r = await apiSend("/auth/employees", "POST", payload);
    setSaving(false);

    if (r.isSuccess) {
      setForm(emptyForm);
      setShowModal(false);
      loadUsers();
    } else {
      setError(r.message || "Failed to register employee.");
    }
  }

  async function handleDeleteUser(id) {
    if (!window.confirm("Are you sure you want to remove this user?")) return;
    const r = await apiSend(`/users/${id}`, "DELETE");
    if (r.isSuccess) {
      loadUsers();
    } else {
      setError(r.message);
    }
  }

  function closeModal() {
    setShowModal(false);
    setForm(emptyForm);
    setError("");
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Company Employees</h1>
          <p className="page-subtitle">Manage employees, managers, and profile photos</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <PlusIcon /> Register Employee
        </button>
      </div>

      {error && !showModal && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={<UserIcon />}
          title="No employees registered yet"
          subtitle="Click Register Employee to add team members"
        />
      ) : (
        <div className="cards-grid">
          {users.map(u => (
            <div key={u.id} className="entity-card">
              <div className="entity-card-top">
                {u.avatarUrl ? (
                  <img
                    src={u.avatarUrl}
                    alt={u.userName || u.email}
                    className="avatar avatar-md"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="avatar avatar-md"
                    style={{ background: u.role === "Admin" || u.role === 0 ? "var(--accent)" : "var(--info)" }}
                  >
                    {(u.userName || u.email || "U").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="entity-card-info">
                  <div className="entity-card-name">{u.userName || u.email}</div>
                  <div className="entity-card-sub">{u.email}</div>
                </div>
                {roleBadge(u.role)}
              </div>

              <hr className="entity-card-divider" />

              <div className="entity-card-meta">
                <div className="entity-card-row">
                  <span className="fw-600">Phone:</span>
                  <span>{u.phoneNumber || "N/A"}</span>
                </div>
              </div>

              <div className="entity-card-actions">
                <button
                  className="btn btn-danger-soft btn-sm ml-auto"
                  onClick={() => handleDeleteUser(u.id)}
                >
                  <TrashIcon /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Employee Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Register Company Employee</span>
              <button className="btn-icon" onClick={closeModal}><CloseIcon /></button>
            </div>
            <form onSubmit={handleAddEmployee}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}

                {/* Profile Photo Picker & Preview */}
                <div className="flex-center gap-16" style={{ marginBottom: 16 }}>
                  {form.avatarUrl ? (
                    <img
                      src={form.avatarUrl}
                      alt="Preview"
                      className="avatar avatar-lg"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div className="avatar avatar-lg" style={{ background: "var(--surface-2)", color: "var(--text-3)", border: "1.5px dashed var(--border-strong)" }}>
                      Photo
                    </div>
                  )}
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Profile Photo (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-input"
                      style={{ padding: 6 }}
                      onChange={handleFileChange}
                    />
                    <span className="text-xs text-3" style={{ marginTop: 2 }}>Upload JPG/PNG photo or enter image URL</span>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 16 }}>
                  <input
                    className="form-input"
                    type="url"
                    value={form.avatarUrl}
                    onChange={e => set("avatarUrl", e.target.value)}
                    placeholder="Or paste image URL (https://…)"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Username *</label>
                    <input
                      className="form-input"
                      value={form.userName}
                      onChange={e => set("userName", e.target.value)}
                      placeholder="employee_john"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      className="form-input"
                      type="email"
                      value={form.email}
                      onChange={e => set("email", e.target.value)}
                      placeholder="john@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      className="form-input"
                      value={form.phoneNumber}
                      onChange={e => set("phoneNumber", e.target.value)}
                      placeholder="+37499123456"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role *</label>
                    <select
                      className="form-select"
                      value={form.role}
                      onChange={e => set("role", e.target.value)}
                      required
                    >
                      <option value={1}>Manager</option>
                      <option value={2}>Employee</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password * (min 8 chars)</label>
                  <input
                    className="form-input"
                    type="password"
                    value={form.password}
                    onChange={e => set("password", e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Registering…" : "Register Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
