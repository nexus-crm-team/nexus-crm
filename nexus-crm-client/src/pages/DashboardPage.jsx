import { useEffect, useState } from "react";
import { apiGet } from "../api";
import { ActiveBadge, DealStatusBadge, CustomerStatusBadge } from "../components/StatusBadge";

// Consistent avatar color from name
function avatarColor(name = "") {
  const palette = ["#6366f1","#8b5cf6","#ec4899","#ef4444","#f97316","#eab308","#22c55e","#14b8a6","#3b82f6","#06b6d4"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}
function initials(name = "") {
  return name.split(" ").map(w => w[0] || "").join("").slice(0, 2).toUpperCase();
}
function fmtValue(v) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v}`;
}
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  return diff;
}

// SVG Icons
const StatIcons = {
  companies: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  customers: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  deals: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  pipeline: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  overdue: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

// Kanban column colors
const COL_COLORS = {
  0: "#6366f1", // New — accent
  1: "#f59e0b", // Waiting — warning
  2: "#3b82f6", // In Progress — info
  3: "#10b981", // Ended — success
  4: "#ef4444", // Cancelled — danger
};
const COL_LABELS = ["New", "Waiting", "In Progress", "Ended", "Cancelled"];

export default function DashboardPage() {
  const [companies, setCompanies]   = useState([]);
  const [customers, setCustomers]   = useState([]);
  const [deals, setDeals]           = useState([]);
  const [pipelineVal, setPipeline]  = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      apiGet("/companies"),
      apiGet("/customers"),
      apiGet("/deals"),
      apiGet("/deals/pipeline-value"),
    ]).then(([co, cu, de, pv]) => {
      if (ignore) return;
      if (co.isSuccess) setCompanies(co.data);
      if (cu.isSuccess) setCustomers(cu.data);
      if (de.isSuccess) setDeals(de.data);
      if (pv.isSuccess) setPipeline(pv.data);
      setLoading(false);
    });
    return () => { ignore = true; };
  }, []);

  if (loading) {
    return (
      <div className="loading-wrap">
        <div className="spinner" />
      </div>
    );
  }

  const activeDeals  = deals.filter(d => d.status === 2);
  const overdueDeals = deals.filter(d => {
    if (!d.deadline) return false;
    return new Date(d.deadline) < new Date() && d.status < 3;
  });

  // Group deals by status for mini-pipeline
  const byStatus = [0,1,2,3,4].map(s => ({
    status: s,
    count: deals.filter(d => d.status === s).length,
    total: deals.filter(d => d.status === s).reduce((a,d) => a + (d.estimatedValue || 0), 0),
  }));

  // Recent 5 deals
  const recentDeals = [...deals].reverse().slice(0, 5);

  // Recent customers
  const recentCustomers = [...customers].reverse().slice(0, 6);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back — here's what's happening today</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon accent">{StatIcons.companies}</div>
          <div>
            <div className="stat-value">{companies.length}</div>
            <div className="stat-label">Companies</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">{StatIcons.customers}</div>
          <div>
            <div className="stat-value">{customers.length}</div>
            <div className="stat-label">Customers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info">{StatIcons.deals}</div>
          <div>
            <div className="stat-value">{activeDeals.length}</div>
            <div className="stat-label">Active Deals</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">{StatIcons.pipeline}</div>
          <div>
            <div className="stat-value">
              {pipelineVal !== null ? fmtValue(pipelineVal) : "—"}
            </div>
            <div className="stat-label">Pipeline Value</div>
          </div>
        </div>
        {overdueDeals.length > 0 && (
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>
              {StatIcons.overdue}
            </div>
            <div>
              <div className="stat-value" style={{ color: "var(--danger-text)" }}>{overdueDeals.length}</div>
              <div className="stat-label">Overdue Deals</div>
            </div>
          </div>
        )}
      </div>

      {/* Pipeline Summary + Recent Deals */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Pipeline by status */}
        <div className="card card-padded">
          <div className="section-title">Pipeline Overview</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {byStatus.map(col => (
              <div key={col.status}>
                <div className="flex-between" style={{ marginBottom: 5 }}>
                  <div className="flex-center gap-8">
                    <span style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: COL_COLORS[col.status], display: "inline-block", flexShrink: 0
                    }} />
                    <span className="text-sm fw-600">{COL_LABELS[col.status]}</span>
                  </div>
                  <div className="flex-center gap-8">
                    <span className="text-xs text-3">{col.count} deal{col.count !== 1 ? "s" : ""}</span>
                    {col.total > 0 && (
                      <span className="text-xs fw-600" style={{ color: "var(--accent)" }}>
                        {fmtValue(col.total)}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{
                  height: 6, borderRadius: 3,
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  overflow: "hidden"
                }}>
                  <div style={{
                    height: "100%",
                    width: deals.length ? `${(col.count / deals.length) * 100}%` : "0%",
                    background: COL_COLORS[col.status],
                    borderRadius: 3,
                    transition: "width 0.6s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Deals */}
        <div className="card card-padded">
          <div className="section-title">Recent Deals</div>
          {recentDeals.length === 0 ? (
            <p className="text-sm text-3">No deals yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentDeals.map(d => {
                const days = daysUntil(d.deadline);
                return (
                  <div key={d.id} className="flex-between" style={{
                    padding: "10px 12px",
                    background: "var(--surface-2)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)"
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div className="text-sm fw-600 truncate">{d.title}</div>
                      <div className="text-xs text-3 mt-6">
                        {days !== null
                          ? days < 0
                            ? <span style={{ color: "var(--danger-text)" }}>Overdue by {Math.abs(days)}d</span>
                            : `${days}d left`
                          : "No deadline"}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0, marginLeft: 12 }}>
                      <DealStatusBadge status={d.status} />
                      {d.estimatedValue > 0 && (
                        <span className="text-xs fw-600" style={{ color: "var(--accent)" }}>
                          {fmtValue(d.estimatedValue)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Customers */}
      <div>
        <div className="section-title">Recent Customers</div>
        {recentCustomers.length === 0 ? (
          <p className="text-sm text-3">No customers yet.</p>
        ) : (
          <div className="cards-grid">
            {recentCustomers.map(c => {
              const co = c.fullName || "";
              return (
                <div key={c.id} className="entity-card" style={{ padding: "16px 18px" }}>
                  <div className="flex-center gap-12">
                    <div
                      className="avatar avatar-md"
                      style={{ background: avatarColor(co) }}
                    >
                      {initials(co)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="entity-card-name truncate">{c.fullName}</div>
                      <div className="entity-card-sub truncate">{c.email}</div>
                    </div>
                    <div className="ml-auto">
                      <CustomerStatusBadge status={c.status} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
