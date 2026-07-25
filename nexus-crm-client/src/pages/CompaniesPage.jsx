import { useEffect, useState } from "react";
import { apiGet, apiSend } from "../api";
import { ActiveBadge } from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";

const emptyForm = {
  name: "", email: "", phone: "",
  industry: "", country: "Armenia", city: "Yerevan", street: "",
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
const BuildingIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
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
const MapPinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
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

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function load(keyword = "") {
    setLoading(true);
    const endpoint = keyword.trim() ? `/companies/search?keyword=${encodeURIComponent(keyword)}` : "/companies";
    const r = await apiGet(endpoint);
    if (r.isSuccess && Array.isArray(r.data)) setCompanies(r.data);
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
    setEditingCompany(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function handleOpenEdit(c) {
    setEditingCompany(c);
    setForm({
      name: c.name || "",
      email: c.email || "",
      phone: c.phone || "",
      industry: c.industry || "",
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

    const method = editingCompany ? "PUT" : "POST";
    const endpoint = editingCompany ? `/companies/${editingCompany.id}` : "/companies";

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      industry: form.industry,
      address: { country: form.country, region: "-", city: form.city, street: form.street || "-" },
    };

    const r = await apiSend(endpoint, method, payload);
    setSaving(false);
    if (r.isSuccess) {
      closeModal();
      load(searchKeyword);
    } else {
      setError(r.message || "Failed to save company.");
    }
  }

  async function toggleActive(c) {
    const action = c.isActive ? "deactivate" : "activate";
    const r = await apiSend(`/companies/${c.id}/${action}`, "PATCH");
    if (r.isSuccess) load(searchKeyword);
    else setError(r.message);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this company?")) return;
    const r = await apiSend(`/companies/${id}`, "DELETE");
    if (r.isSuccess) load(searchKeyword);
    else setError(r.message);
  }

  function closeModal() {
    setShowModal(false);
    setEditingCompany(null);
    setForm(emptyForm);
    setError("");
  }

  function companyColor(name = "") {
    const palette = ["#6366f1","#8b5cf6","#ec4899","#ef4444","#f97316","#eab308","#22c55e","#14b8a6","#3b82f6"];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return palette[Math.abs(h) % palette.length];
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Companies</h1>
          <p className="page-subtitle">{companies.length} company{companies.length !== 1 ? "ies" : "y"} in your CRM</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <PlusIcon /> Add Company
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ position: "relative", marginBottom: 20, maxWidth: 400 }}>
        <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", display: "flex" }}>
          <SearchIcon />
        </div>
        <input
          className="form-input"
          style={{ paddingLeft: 36 }}
          placeholder="Search companies by name or industry…"
          value={searchKeyword}
          onChange={handleSearch}
        />
      </div>

      {error && !showModal && (
        <div className="alert alert-error">{error}</div>
      )}

      {/* Companies Grid */}
      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : companies.length === 0 ? (
        <EmptyState
          icon={<BuildingIcon />}
          title="No companies found"
          subtitle={searchKeyword ? "No companies matching your search" : "Add your first company to get started"}
        />
      ) : (
        <div className="cards-grid">
          {companies.map(c => (
            <div key={c.id} className="entity-card">
              {/* Top */}
              <div className="entity-card-top">
                <div style={{
                  width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                  background: companyColor(c.name),
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 800, fontSize: 16, letterSpacing: -0.5
                }}>
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="entity-card-info">
                  <div className="entity-card-name">{c.name}</div>
                  <div className="entity-card-sub">{c.industry}</div>
                </div>
                <div style={{ cursor: "pointer" }} onClick={() => toggleActive(c)} title="Click to toggle active state">
                  <ActiveBadge isActive={c.isActive} />
                </div>
              </div>

              <hr className="entity-card-divider" />

              {/* Meta */}
              <div className="entity-card-meta">
                <div className="entity-card-row">
                  <MailIcon />
                  <span className="truncate">{c.email}</span>
                </div>
                {c.phone && (
                  <div className="entity-card-row">
                    <PhoneIcon />
                    <span>{c.phone}</span>
                  </div>
                )}
                {c.address && (
                  <div className="entity-card-row">
                    <MapPinIcon />
                    <span className="truncate">{c.address.city}, {c.address.country}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
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
          ))}
        </div>
      )}

      {/* Add / Edit Company Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editingCompany ? "Edit Company" : "Add New Company"}</span>
              <button className="btn-icon" onClick={closeModal}><CloseIcon /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Company Name *</label>
                    <input className="form-input" value={form.name}
                      onChange={e => set("name", e.target.value)}
                      placeholder="Acme Corp" required maxLength={30} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Industry *</label>
                    <input className="form-input" value={form.industry}
                      onChange={e => set("industry", e.target.value)}
                      placeholder="Technology" required maxLength={30} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input className="form-input" type="email" value={form.email}
                      onChange={e => set("email", e.target.value)}
                      placeholder="hello@acme.com" required maxLength={30} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" value={form.phone}
                      onChange={e => set("phone", e.target.value)}
                      placeholder="+374 99 123456" />
                  </div>
                </div>

                <div className="form-row" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input className="form-input" value={form.country}
                      onChange={e => set("country", e.target.value)} placeholder="Armenia" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" value={form.city}
                      onChange={e => set("city", e.target.value)} placeholder="Yerevan" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Street</label>
                    <input className="form-input" value={form.street}
                      onChange={e => set("street", e.target.value)} placeholder="Baghramyan 1" />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : editingCompany ? "Update Company" : "Add Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
