import { useEffect, useState } from "react";
import { apiGet, apiSend } from "../api";
import EmptyState from "../components/EmptyState";

const emptyForm = {
  title: "",
  description: "",
  deadline: "",
  dealId: "",
};

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
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const TaskIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // "all" | "pending" | "completed"

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function loadData() {
    const [tr, dr] = await Promise.all([apiGet("/worktasks"), apiGet("/deals")]);
    if (tr.isSuccess && Array.isArray(tr.data)) setTasks(tr.data);
    if (dr.isSuccess && Array.isArray(dr.data)) setDeals(dr.data);
    setLoading(false);
  }

  useEffect(() => {
    let ignore = false;
    Promise.all([apiGet("/worktasks"), apiGet("/deals")]).then(([tr, dr]) => {
      if (ignore) return;
      if (tr.isSuccess && Array.isArray(tr.data)) setTasks(tr.data);
      if (dr.isSuccess && Array.isArray(dr.data)) setDeals(dr.data);
      setLoading(false);
    });
    return () => { ignore = true; };
  }, []);

  async function handleCreateTask(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      deadline: form.deadline,
      dealId: Number(form.dealId),
    };

    const r = await apiSend("/worktasks", "POST", payload);
    setSaving(false);

    if (r.isSuccess) {
      setForm(emptyForm);
      setShowModal(false);
      loadData();
    } else {
      setError(r.message || "Failed to create task.");
    }
  }

  async function toggleComplete(task) {
    const payload = {
      description: task.description || task.title || "Updated Task",
      isCompleted: !task.isCompleted,
      dealId: task.dealId || deals[0]?.id || 1,
    };
    const r = await apiSend(`/worktasks/${task.id}`, "PUT", payload);
    if (r.isSuccess) {
      loadData();
    } else {
      setError(r.message);
    }
  }

  async function handleDeleteTask(id) {
    if (!window.confirm("Delete this task?")) return;
    const r = await apiSend(`/worktasks/${id}`, "DELETE");
    if (r.isSuccess) loadData();
    else setError(r.message);
  }

  function dealTitle(dealId) {
    return deals.find(d => d.id === dealId)?.title || `#${dealId}`;
  }

  function closeModal() {
    setShowModal(false);
    setForm(emptyForm);
    setError("");
  }

  const filteredTasks = tasks.filter(t => {
    if (filterStatus === "pending") return !t.isCompleted;
    if (filterStatus === "completed") return t.isCompleted;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Work Tasks</h1>
          <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? "s" : ""} across your CRM deals</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <PlusIcon /> New Task
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex-center gap-8" style={{ marginBottom: 20 }}>
        <button
          className={`badge ${filterStatus === "all" ? "badge-accent" : "badge-neutral"}`}
          style={{ cursor: "pointer", border: "none", padding: "6px 14px" }}
          onClick={() => setFilterStatus("all")}
        >
          All ({tasks.length})
        </button>
        <button
          className={`badge ${filterStatus === "pending" ? "badge-warning" : "badge-neutral"}`}
          style={{ cursor: "pointer", border: "none", padding: "6px 14px" }}
          onClick={() => setFilterStatus("pending")}
        >
          Pending ({tasks.filter(t => !t.isCompleted).length})
        </button>
        <button
          className={`badge ${filterStatus === "completed" ? "badge-success" : "badge-neutral"}`}
          style={{ cursor: "pointer", border: "none", padding: "6px 14px" }}
          onClick={() => setFilterStatus("completed")}
        >
          Completed ({tasks.filter(t => t.isCompleted).length})
        </button>
      </div>

      {error && !showModal && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={<TaskIcon />}
          title="No tasks found"
          subtitle="Add your first task or change filter criteria"
        />
      ) : (
        <div className="cards-grid">
          {filteredTasks.map(t => (
            <div key={t.id} className="entity-card">
              <div className="entity-card-top">
                <button
                  onClick={() => toggleComplete(t)}
                  style={{
                    width: 26, height: 26, borderRadius: "50%",
                    border: t.isCompleted ? "none" : "2px solid var(--border-strong)",
                    background: t.isCompleted ? "var(--success)" : "transparent",
                    color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", flexShrink: 0, marginTop: 2
                  }}
                  title={t.isCompleted ? "Mark as pending" : "Mark as completed"}
                >
                  {t.isCompleted && <CheckIcon />}
                </button>
                <div className="entity-card-info">
                  <div className="entity-card-name" style={{
                    textDecoration: t.isCompleted ? "line-through" : "none",
                    color: t.isCompleted ? "var(--text-3)" : "var(--text)"
                  }}>
                    {t.title}
                  </div>
                  <div className="entity-card-sub">{t.description}</div>
                </div>
                <span className={`badge ${t.isCompleted ? "badge-success" : "badge-warning"}`}>
                  {t.isCompleted ? "Completed" : "Pending"}
                </span>
              </div>

              <hr className="entity-card-divider" />

              <div className="entity-card-meta">
                {t.dealId && (
                  <div className="entity-card-row">
                    <span className="fw-600">Deal:</span>
                    <span className="truncate">{dealTitle(t.dealId)}</span>
                  </div>
                )}
                {t.deadline && (
                  <div className="entity-card-row">
                    <span className="fw-600">Deadline:</span>
                    <span>{new Date(t.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="entity-card-actions">
                <button
                  className="btn btn-danger-soft btn-sm ml-auto"
                  onClick={() => handleDeleteTask(t.id)}
                >
                  <TrashIcon /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Create Work Task</span>
              <button className="btn-icon" onClick={closeModal}><CloseIcon /></button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}

                <div className="form-group">
                  <label className="form-label">Task Title *</label>
                  <input
                    className="form-input"
                    value={form.title}
                    onChange={e => set("title", e.target.value)}
                    placeholder="Prepare proposal document"
                    required
                    maxLength={30}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Associated Deal *</label>
                  <select
                    className="form-select"
                    value={form.dealId}
                    onChange={e => set("dealId", e.target.value)}
                    required
                  >
                    <option value="">— Select Deal —</option>
                    {deals.map(d => (
                      <option key={d.id} value={d.id}>{d.title}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Deadline *</label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.deadline}
                    onChange={e => set("deadline", e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={form.description}
                    onChange={e => set("description", e.target.value)}
                    placeholder="Detailed task instructions…"
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving…" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
