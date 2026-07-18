import { useState } from "react";
import CompaniesPage from "./pages/CompaniesPage";
import CustomersPage from "./pages/CustomersPage";
import DealsPage from "./pages/DealsPage";

const PAGES = {
  companies: { title: "Companies", component: <CompaniesPage /> },
  customers: { title: "Customers", component: <CustomersPage /> },
  deals: { title: "Deals", component: <DealsPage /> },
};

export default function App() {
  const [page, setPage] = useState("companies");

  return (
    <div className="container">
      <header>
        <h1>NexusCRM</h1>
        <nav>
          {Object.entries(PAGES).map(([key, p]) => (
            <button key={key}
                    className={page === key ? "tab active" : "tab"}
                    onClick={() => setPage(key)}>
              {p.title}
            </button>
          ))}
        </nav>
      </header>

      {PAGES[page].component}
    </div>
  );
}
