// Sidebar navigation component with active user profile & dark mode toggle

const Icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  companies: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  customers: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  deals: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  tasks: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  ),
  notes: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  employees: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </svg>
  ),
  sun: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  moon: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  ),
  logout: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

export default function Sidebar({ currentPage, onNavigate, user, onLogout, darkMode, onToggleDark }) {
  const isAdmin = user?.role === "Admin" || user?.role === 0;

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: Icons.dashboard },
    { key: "companies", label: "Companies", icon: Icons.companies },
    { key: "customers", label: "Customers", icon: Icons.customers },
    { key: "deals", label: "Deals", icon: Icons.deals },
    { key: "tasks", label: "Tasks", icon: Icons.tasks },
    { key: "notes", label: "Notes", icon: Icons.notes },
  ];

  if (isAdmin) {
    navItems.push({ key: "employees", label: "Employees", icon: Icons.employees });
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">Nx</div>
        <div className="sidebar-logo-text">
          Nexus<span>CRM</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Menu</div>
        {navItems.map(({ key, label, icon }) => (
          <button
            key={key}
            className={`sidebar-item${currentPage === key ? " active" : ""}`}
            onClick={() => onNavigate(key)}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>

      {/* Footer / User Profile */}
      <div className="sidebar-footer">
        {user && (
          <div style={{
            padding: "10px 12px",
            background: "var(--surface-2)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
            marginBottom: 6,
          }}>
            <div className="flex-between">
              <span className="fw-600 truncate text-sm" style={{ maxWidth: 120 }}>
                {user.userName || user.email}
              </span>
              <span className="badge badge-accent" style={{ fontSize: 10, padding: "2px 6px" }}>
                {user.role}
              </span>
            </div>
            <div className="text-xs text-3 truncate" style={{ marginTop: 2 }}>
              {user.email}
            </div>
          </div>
        )}

        <button className="theme-toggle" onClick={onToggleDark}>
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {darkMode ? Icons.moon : Icons.sun}
            <span className="theme-toggle-label">{darkMode ? "Dark mode" : "Light mode"}</span>
          </span>
          <div className={`toggle-track${darkMode ? " on" : ""}`}>
            <div className={`toggle-thumb${darkMode ? " on" : ""}`} />
          </div>
        </button>

        {user && (
          <button
            className="sidebar-item"
            style={{ color: "var(--danger-text)", marginTop: 2 }}
            onClick={onLogout}
          >
            {Icons.logout}
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}
