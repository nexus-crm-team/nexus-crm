// Colored status badge with dot indicator

// CustomerStatus (matches backend enum 0–4)
const CUSTOMER_STATUS_MAP = {
  0: { label: "New",       variant: "badge-accent"  },
  1: { label: "Active",    variant: "badge-success" },
  2: { label: "Connected", variant: "badge-info"    },
  3: { label: "Inactive",  variant: "badge-neutral" },
  4: { label: "Lost",      variant: "badge-danger"  },
};

// DealStatus (matches backend enum 0–4)
const DEAL_STATUS_MAP = {
  0: { label: "New",                  variant: "badge-accent"  },
  1: { label: "Waiting for Approval", variant: "badge-warning" },
  2: { label: "In Progress",          variant: "badge-info"    },
  3: { label: "Ended",                variant: "badge-success" },
  4: { label: "Cancelled",            variant: "badge-danger"  },
};

export function CustomerStatusBadge({ status }) {
  const s = CUSTOMER_STATUS_MAP[status] ?? { label: String(status), variant: "badge-neutral" };
  return (
    <span className={`badge ${s.variant}`}>
      <span className="badge-dot" />
      {s.label}
    </span>
  );
}

export function DealStatusBadge({ status }) {
  const s = DEAL_STATUS_MAP[status] ?? { label: String(status), variant: "badge-neutral" };
  return (
    <span className={`badge ${s.variant}`}>
      <span className="badge-dot" />
      {s.label}
    </span>
  );
}

export function ActiveBadge({ isActive }) {
  return isActive
    ? <span className="badge badge-success"><span className="badge-dot" />Active</span>
    : <span className="badge badge-neutral"><span className="badge-dot" />Inactive</span>;
}

export const DEAL_STATUS_LABELS = DEAL_STATUS_MAP;
export const CUSTOMER_STATUS_LABELS = CUSTOMER_STATUS_MAP;
