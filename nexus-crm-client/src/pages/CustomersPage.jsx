import { useEffect, useState } from "react";
import { apiGet, apiSend } from "../api";
import { CustomerStatusBadge } from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";

const STATUS_OPTIONS = [
  { value: 0, label: "New"       },
  { value: 1, label: "Active"    },
  { value: 2, label: "Connected" },
  { value: 3, label: "Inactive"  },
  { value: 4, label: "Lost"      },
];

const emptyForm = {
  fullName: "", email: "", phoneNumber: "",
  companyId: "", country: "Armenia", city: "Yerevan", street: "",
};

function avatarColor(name = "") {
  const palette = ["#6366f1","#8b5cf6","#ec4899","#ef4444","#f97316","#eab308","#22c55e","#14b8a6","#3b82f6","#06b6d4"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}
function initials(name = "") {
  return name.split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

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
const UsersIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const MailIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.12 1.18 2 2 0 012.1.01h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.19 7.91a16 16 0 006.06 6.06l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);
const BuildingSmIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [filter, setFilter]       = useState("all");

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function load(keyword = "") {
    setLoading(true);
    const endpoint = keyword.trim() ? `/customers/search?keyword=${encodeURIComponent(keyword)}` : "/customers";
    const [cr, cor] = await Promise.all([apiGet(endpoint), apiGet("/companies")]);
    if (cr.isSuccess && Array.isArray(cr.data))  setCustomers(cr.data);
    if (cor.isSuccess && Array.isArray(cor.data)) setCompanies(cor.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function handleSearch(e) {
    const val = e.target.value;
    setSearchKeyword(val);
    load(val);
  }

  function handleOpenCreate() {
    setEditingCustomer(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function handleOpenEdit(c) {
    setEditingCustomer(c);
    setForm({
      fullName: c.fullName || "",
      email: c.email || "",
      phoneNumber: c.phoneNumber || "",
      companyId: c.companyId || "",
      country: c.address?.country || "Armenia",
      city: c.address?.city || "Yerevan",
      street: c.address?.street || "",
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const method = editingCustomer ? "PUT" : "POST";
    const endpoint = editingCustomer ? `/customers/${editingCustomer.id}` : "/customers";

    const payload = {
      fullName: form.fullName,
      email: form.email,
      phoneNumber: form.phoneNumber || null,
      companyId: Number(form.companyId),
      address: { country: form.country, region: "-", city: form.city, street: form.street || "-" },
    };

    const r = await apiSend(endpoint, method, payload);
    setSaving(false);

    if (r.isSuccess) {
      closeModal();
      load(searchKeyword);
    } else {
      setError(r.message || "Failed to save customer.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this customer?")) return;
    const r = await apiSend(`/customers/${id}`, "DELETE");
    if (r.isSuccess) load(searchKeyword);
    else setError(r.message);
  }

  function companyName(id) {
    return companies.find(c => c.id === id)?.name ?? `#${id}`;
  }

  function closeModal() {
    setShowModal(false);
    setEditingCustomer(null);
    setForm(emptyForm);
    setError("");
  }

  const filtered = filter === "all"
    ? customers
    : customers.filter(c => c.status === Number(filter));

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{customers.length} customer{customers.length !== 1 ? "s" : ""} in your CRM</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <PlusIcon /> Add Customer
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex-between" style={{ marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ position: "relative", maxWidth: 360, width: "100%" }}>
          <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", display: "flex" }}>
            <SearchIcon />
          </div>
          <input
            className="form-input"
            style={{ paddingLeft: 36 }}
            placeholder="Search customers by name or email…"
            value={searchKeyword}
            onChange={handleSearch}
          />
        </div>

        <div className="flex-center gap-8" style={{ flexWrap: "wrap" }}>
          <button
            className={`badge ${filter === "all" ? "badge-accent" : "badge-neutral"}`}
            style={{ cursor: "pointer", border: "none", padding: "6px 14px", fontSize: 13 }}
            onClick={() => setFilter("all")}
          >
            All ({customers.length})
          </button>
          {STATUS_OPTIONS.map(s => {
            const count = customers.filter(c => c.status === s.value).length;
            if (count === 0) return null;
            return (
              <button
                key={s.value}
                className={`badge ${filter === String(s.value) ? "badge-accent" : "badge-neutral"}`}
                style={{ cursor: "pointer", border: "none", padding: "6px 14px", fontSize: 13 }}
                onClick={() => setFilter(String(s.value))}
              >
                {s.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {error && !showModal && (
        <div className="alert alert-error">{error}</div>
      )}

      {/* Customer Cards */}
      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<UsersIcon />}
          title="No customers found"
          subtitle={searchKeyword ? "No customers matching search criteria" : "Add your first customer to get started"}
        />
      ) : (
        <div className="cards-grid">
          {filtered.map(c => {
            const bg = avatarColor(c.fullName);
            return (
              <div key={c.id} className="entity-card">
                {/* Top */}
                <div className="entity-card-top">
                  <div
                    className="avatar avatar-md"
                    style={{ background: bg }}
                  >
                    {initials(c.fullName)}
                  </div>
                  <div className="entity-card-info">
                    <div className="entity-card-name">{c.fullName}</div>
                    <div className="entity-card-sub">{companyName(c.companyId)}</div>
                  </div>
                  <CustomerStatusBadge status={c.status} />
                </div>

                <hr className="entity-card-divider" />

                <div className="entity-card-meta">
                  <div className="entity-card-row">
                    <MailIcon />
                    <span className="truncate">{c.email}</span>
                  </div>
                  {c.phoneNumber && (
                    <div className="entity-card-row">
                      <PhoneIcon />
                      <span>{c.phoneNumber}</span>
                    </div>
                  )}
                  <div className="entity-card-row">
                    <BuildingSmIcon />
                    <span className="truncate">{companyName(c.companyId)}</span>
                  </div>
                </div>

                <div className="entity-card-actions">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => handleOpenEdit(c)}
                  >
                    <EditIcon /> Edit
                  </button>
                  <button
                    className="btn btn-danger-soft btn-sm ml-auto"
                    onClick={() => handleDelete(c.id)}
                  >
                    <TrashIcon /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editingCustomer ? "Edit Customer" : "Add New Customer"}</span>
              <button className="btn-icon" onClick={closeModal}><CloseIcon /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" value={form.fullName}
                      onChange={e => set("fullName", e.target.value)}
                      placeholder="Anna Petrosyan" required maxLength={100} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company *</label>
                    <select className="form-select" value={form.companyId}
                      onChange={e => set("companyId", e.target.value)} required>
                      <option value="">— Select company —</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input className="form-input" type="email" value={form.email}
                      onChange={e => set("email", e.target.value)}
                      placeholder="anna@example.com" required maxLength={30} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phoneNumber}
                      onChange={e => set("phoneNumber", e.target.value)}
                      placeholder="+374 99 123456" />
                  </div>
                </div>

                <div className="form-row" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input className="form-input" value={form.country}
                      onChange={e => set("country", e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" value={form.city}
                      onChange={e => set("city", e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Street</label>
                    <input className="form-input" value={form.street}
                      onChange={e => set("street", e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : editingCustomer ? "Update Customer" : "Add Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
