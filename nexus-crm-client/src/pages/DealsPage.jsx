import { useEffect, useState } from "react";
import { apiGet, apiSend } from "../api";
import EmptyState from "../components/EmptyState";
import FollowUpsModal from "../components/FollowUpsModal";

const COLUMNS = [
  { status: 0, label: "New",                  color: "#6366f1" },
  { status: 1, label: "Waiting for Approval", color: "#f59e0b" },
  { status: 2, label: "In Progress",          color: "#3b82f6" },
  { status: 3, label: "Ended",                color: "#10b981" },
  { status: 4, label: "Cancelled",            color: "#ef4444" },
];

const emptyForm = {
  title: "", description: "", estimatedValue: "", deadline: "", customerId: "",
};

function fmtValue(v) {
  if (!v || v === 0) return null;
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

function daysLabel(dateStr) {
  if (!dateStr) return null;
  const days = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  if (days < 0)  return { text: `${Math.abs(days)}d overdue`, danger: true };
  if (days === 0) return { text: "Due today", danger: true };
  if (days <= 3)  return { text: `${days}d left`, warn: true };
  return { text: `${days}d left`, danger: false, warn: false };
}

// Icons
const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const UserSmIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const CalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);
const EditIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const MessageSquareIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

export default function DealsPage() {
  const [deals, setDeals]         = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [activeFollowUpDeal, setActiveFollowUpDeal] = useState(null);
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function load(keyword = "") {
    setLoading(true);
    const endpoint = keyword.trim() ? `/deals/search?keyword=${encodeURIComponent(keyword)}` : "/deals";
    const [dr, cr] = await Promise.all([apiGet(endpoint), apiGet("/customers")]);
    if (dr.isSuccess && Array.isArray(dr.data)) setDeals(dr.data);
    if (cr.isSuccess && Array.isArray(cr.data)) setCustomers(cr.data);
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
    setEditingDeal(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function handleOpenEdit(d) {
    setEditingDeal(d);
    setForm({
      title: d.title || "",
      description: d.description || "",
      estimatedValue: d.estimatedValue || "",
      deadline: d.deadline ? d.deadline.split("T")[0] : "",
      customerId: d.customerId || "",
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (editingDeal) {
      // PUT update
      const r = await apiSend(`/deals/${editingDeal.id}`, "PUT", {
        title: form.title,
        description: form.description || null,
        estimatedValue: Number(form.estimatedValue) || 0,
        deadline: form.deadline ? form.deadline : null,
      });
      setSaving(false);
      if (r.isSuccess) {
        closeModal();
        load(searchKeyword);
      } else {
        setError(r.message || "Failed to update deal.");
      }
    } else {
      // POST create
      const customer = customers.find(c => c.id === Number(form.customerId));
      if (!customer) { setError("Select a customer first"); setSaving(false); return; }

      const r = await apiSend("/deals", "POST", {
        title: form.title,
        description: form.description || null,
        estimatedValue: Number(form.estimatedValue) || 0,
        status: 0,
        deadline: form.deadline,
        customerId: customer.id,
        companyId: customer.companyId,
      });
      setSaving(false);
      if (r.isSuccess) {
        closeModal();
        load(searchKeyword);
      } else {
        setError(r.message || "Failed to create deal.");
      }
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this deal?")) return;
    const r = await apiSend(`/deals/${id}`, "DELETE");
    if (r.isSuccess) load(searchKeyword);
    else setError(r.message);
  }

  async function changeStatus(id, newStatus) {
    await apiSend(`/deals/${id}/status?status=${newStatus}`, "PATCH");
    load(searchKeyword);
  }

  async function handleCloseWon(id) {
    await apiSend(`/deals/${id}/close-won`, "PATCH");
    load(searchKeyword);
  }

  async function handleCloseLost(id) {
    await apiSend(`/deals/${id}/close-lost`, "PATCH");
    load(searchKeyword);
  }

  function customerName(id) {
    return customers.find(c => c.id === id)?.fullName ?? `#${id}`;
  }

  function closeModal() {
    setShowModal(false);
    setEditingDeal(null);
    setForm(emptyForm);
    setError("");
  }

  const pipelineVal = deals
    .filter(d => d.status < 3)
    .reduce((a, d) => a + (d.estimatedValue || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Deals Pipeline</h1>
          <p className="page-subtitle">
            {deals.length} deals · Pipeline: <strong style={{ color: "var(--accent)" }}>{fmtValue(pipelineVal) || "$0"}</strong>
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <PlusIcon /> New Deal
        </button>
      </div>

      {/* Search bar */}
      <div style={{ position: "relative", marginBottom: 20, maxWidth: 400 }}>
        <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", display: "flex" }}>
          <SearchIcon />
        </div>
        <input
          className="form-input"
          style={{ paddingLeft: 36 }}
          placeholder="Search deals by title or description…"
          value={searchKeyword}
          onChange={handleSearch}
        />
      </div>

      {error && !showModal && (
        <div className="alert alert-error">{error}</div>
      )}

      {/* Kanban Board */}
      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : (
        <div className="kanban-board">
          {COLUMNS.map(col => {
            const colDeals = deals.filter(d => d.status === col.status);
            const colTotal = colDeals.reduce((a,d) => a + (d.estimatedValue || 0), 0);

            return (
              <div key={col.status} className="kanban-column">
                <div className="kanban-column-header">
                  <div className="kanban-col-title">
                    <span className="kanban-col-dot" style={{ background: col.color }} />
                    {col.label}
                  </div>
                  <span className="kanban-count">{colDeals.length}</span>
                </div>

                {colTotal > 0 && (
                  <div style={{
                    fontSize: 12, fontWeight: 700, color: col.color,
                    marginBottom: 10, textAlign: "right", letterSpacing: -0.3
                  }}>
                    {fmtValue(colTotal)}
                  </div>
                )}

                {colDeals.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 8px", color: "var(--text-3)", fontSize: 13 }}>
                    Empty
                  </div>
                ) : (
                  colDeals.map(d => {
                    const dl = daysLabel(d.deadline);
                    return (
                      <div key={d.id} className="deal-card">
                        <div className="flex-between">
                          <div className="deal-card-title">{d.title}</div>
                          <button className="btn btn-ghost btn-xs" style={{ padding: "2px 5px" }} onClick={() => handleOpenEdit(d)} title="Edit deal">
                            <EditIcon />
                          </button>
                        </div>

                        {d.estimatedValue > 0 && (
                          <div className="deal-card-value">{fmtValue(d.estimatedValue)}</div>
                        )}

                        <div className="deal-card-meta">
                          <div className="deal-meta-row">
                            <UserSmIcon />
                            <span className="truncate">{customerName(d.customerId)}</span>
                          </div>
                          {dl && (
                            <div className="deal-meta-row">
                              <CalIcon />
                              <span style={{
                                color: dl.danger ? "var(--danger-text)" : dl.warn ? "var(--warning-text)" : undefined,
                                fontWeight: (dl.danger || dl.warn) ? 600 : undefined
                              }}>
                                {dl.text}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Quick Won / Lost & Follow-up actions */}
                        <div className="flex-between" style={{ padding: "6px 0", borderTop: "1px dashed var(--border)", margin: "6px 0" }}>
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => setActiveFollowUpDeal(d)}
                            title="Manage follow-ups"
                          >
                            <MessageSquareIcon /> Follow-ups
                          </button>
                          {d.status < 3 && (
                            <div className="flex gap-6">
                              <button
                                className="btn btn-xs"
                                style={{ background: "var(--success-bg)", color: "var(--success-text)", padding: "2px 6px" }}
                                onClick={() => handleCloseWon(d.id)}
                                title="Mark as Close Won"
                              >
                                Won
                              </button>
                              <button
                                className="btn btn-xs"
                                style={{ background: "var(--danger-bg)", color: "var(--danger-text)", padding: "2px 6px" }}
                                onClick={() => handleCloseLost(d.id)}
                                title="Mark as Close Lost"
                              >
                                Lost
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Status Change Controls */}
                        <div className="deal-card-actions">
                          {col.status !== 0 && (
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => changeStatus(d.id, col.status - 1)}
                            >
                              ← Back
                            </button>
                          )}
                          {col.status !== 4 && (
                            <button
                              className="btn btn-xs"
                              style={{ background: col.color, color: "white", flex: 1 }}
                              onClick={() => changeStatus(d.id, col.status + 1)}
                            >
                              Next →
                            </button>
                          )}
                          <button
                            className="btn btn-icon"
                            style={{ flexShrink: 0 }}
                            onClick={() => handleDelete(d.id)}
                            title="Delete deal"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* FollowUps Modal */}
      {activeFollowUpDeal && (
        <FollowUpsModal
          deal={activeFollowUpDeal}
          onClose={() => setActiveFollowUpDeal(null)}
        />
      )}

      {/* Create / Edit Deal Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editingDeal ? "Edit Deal" : "New Deal"}</span>
              <button className="btn-icon" onClick={closeModal}><CloseIcon /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Deal Title *</label>
                    <input className="form-input" value={form.title}
                      onChange={e => set("title", e.target.value)}
                      placeholder="Website Redesign" required maxLength={100} />
                  </div>
                  {!editingDeal && (
                    <div className="form-group">
                      <label className="form-label">Customer *</label>
                      <select className="form-select" value={form.customerId}
                        onChange={e => set("customerId", e.target.value)} required>
                        <option value="">— Select customer —</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>{c.fullName}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Estimated Value ($)</label>
                    <input className="form-input" type="number" min="0" step="0.01" value={form.estimatedValue}
                      onChange={e => set("estimatedValue", e.target.value)}
                      placeholder="10000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Deadline</label>
                    <input className="form-input" type="date" value={form.deadline}
                      onChange={e => set("deadline", e.target.value)} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input className="form-input" value={form.description}
                    onChange={e => set("description", e.target.value)}
                    placeholder="Brief notes about this deal…" />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : editingDeal ? "Update Deal" : "Create Deal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
