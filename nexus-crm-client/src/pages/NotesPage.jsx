import { useEffect, useState } from "react";
import { apiGet, apiSend } from "../api";
import EmptyState from "../components/EmptyState";

const emptyForm = { content: "" };

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
const NoteIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
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

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadNotes(keyword = "") {
    setLoading(true);
    const endpoint = keyword.trim() ? `/notes/search?keyword=${encodeURIComponent(keyword)}` : "/notes";
    const r = await apiGet(endpoint);
    if (r.isSuccess && Array.isArray(r.data)) {
      setNotes(r.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadNotes();
  }, []);

  function handleSearch(e) {
    const val = e.target.value;
    setSearchKeyword(val);
    loadNotes(val);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const method = editingNote ? "PUT" : "POST";
    const endpoint = editingNote ? `/notes/${editingNote.id}` : "/notes";

    const r = await apiSend(endpoint, method, { content: form.content.trim() });
    setSaving(false);

    if (r.isSuccess) {
      closeModal();
      loadNotes(searchKeyword);
    } else {
      setError(r.message || "Failed to save note.");
    }
  }

  function handleEdit(note) {
    setEditingNote(note);
    setForm({ content: note.content });
    setShowModal(true);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this note?")) return;
    const r = await apiSend(`/notes/${id}`, "DELETE");
    if (r.isSuccess) loadNotes(searchKeyword);
    else setError(r.message);
  }

  function closeModal() {
    setShowModal(false);
    setEditingNote(null);
    setForm(emptyForm);
    setError("");
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quick Notes</h1>
          <p className="page-subtitle">{notes.length} note{notes.length !== 1 ? "s" : ""} saved in your CRM</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditingNote(null); setForm(emptyForm); setShowModal(true); }}>
          <PlusIcon /> Add Note
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
          placeholder="Search notes by keyword…"
          value={searchKeyword}
          onChange={handleSearch}
        />
      </div>

      {error && !showModal && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={<NoteIcon />}
          title="No notes found"
          subtitle={searchKeyword ? "No notes matching search criteria" : "Add your first quick note"}
        />
      ) : (
        <div className="cards-grid">
          {notes.map(n => (
            <div key={n.id} className="entity-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 14, color: "var(--text)", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                  {n.content}
                </div>
              </div>

              <div>
                <hr className="entity-card-divider" />
                <div className="flex-between">
                  <span className="text-xs text-3">
                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "Recently"}
                  </span>
                  <div className="flex-center gap-6">
                    <button className="btn btn-ghost btn-xs" onClick={() => handleEdit(n)}>
                      <EditIcon /> Edit
                    </button>
                    <button className="btn btn-danger-soft btn-xs" onClick={() => handleDelete(n.id)}>
                      <TrashIcon /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editingNote ? "Edit Note" : "New Note"}</span>
              <button className="btn-icon" onClick={closeModal}><CloseIcon /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-group">
                  <label className="form-label">Note Content *</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    value={form.content}
                    onChange={e => setForm({ content: e.target.value })}
                    placeholder="Enter quick note or reminder…"
                    required
                    maxLength={1000}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : editingNote ? "Update Note" : "Save Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
