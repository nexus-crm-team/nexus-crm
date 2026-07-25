import { useEffect, useState } from "react";
import { apiGet, apiSend } from "../api";

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);

export default function FollowUpsModal({ deal, onClose }) {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadFollowUps() {
    const r = await apiGet("/followups");
    if (r.isSuccess && Array.isArray(r.data)) {
      // Filter followups for this deal if property dealId exists, else show list
      setFollowUps(r.data.filter(f => f.dealId === deal.id || !f.dealId));
    }
    setLoading(false);
  }

  useEffect(() => {
    loadFollowUps();
  }, [deal.id]);

  async function handleAddFollowUp(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    setError("");

    const r = await apiSend("/followups", "POST", {
      content: content.trim(),
      dealId: deal.id,
    });
    setSaving(false);

    if (r.isSuccess) {
      setContent("");
      loadFollowUps();
    } else {
      setError(r.message || "Failed to add follow-up.");
    }
  }

  async function handleDelete(id) {
    const r = await apiSend(`/followups/${id}`, "DELETE");
    if (r.isSuccess) loadFollowUps();
    else setError(r.message);
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <div>
            <span className="modal-title">Follow-ups for "{deal.title}"</span>
            <div className="text-xs text-3" style={{ marginTop: 2 }}>Track communication and follow-up items</div>
          </div>
          <button className="btn-icon" onClick={onClose}><CloseIcon /></button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}

          {/* Add form */}
          <form onSubmit={handleAddFollowUp} className="flex gap-8">
            <input
              className="form-input"
              style={{ flex: 1 }}
              placeholder="Add follow-up notes (e.g. Call client next Tuesday)…"
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <PlusIcon /> Add
            </button>
          </form>

          {/* List */}
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10, maxHeight: 300, overflowY: "auto" }}>
            {loading ? (
              <div className="loading-wrap" style={{ padding: 20 }}><div className="spinner" /></div>
            ) : followUps.length === 0 ? (
              <div className="text-center text-sm text-3" style={{ padding: 20 }}>
                No follow-ups recorded yet for this deal.
              </div>
            ) : (
              followUps.map(f => (
                <div key={f.id || f.createdAt} className="flex-between" style={{
                  padding: "10px 12px",
                  background: "var(--surface-2)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)"
                }}>
                  <div>
                    <div className="text-sm fw-600">{f.content}</div>
                    {f.createdAt && (
                      <div className="text-xs text-3 mt-6">{new Date(f.createdAt).toLocaleString()}</div>
                    )}
                  </div>
                  {f.id && (
                    <button className="btn btn-danger-soft btn-xs" onClick={() => handleDelete(f.id)}>
                      <TrashIcon />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
