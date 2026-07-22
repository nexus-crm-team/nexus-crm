import { useState, useEffect } from "react";
import "./index.css";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import CompaniesPage from "./pages/CompaniesPage";
import CustomersPage from "./pages/CustomersPage";
import DealsPage from "./pages/DealsPage";

const PAGES = {
  dashboard: DashboardPage,
  companies: CompaniesPage,
  customers: CustomersPage,
  deals:     DealsPage,
};

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("nexuscrm-theme") === "dark";
  });

  // Apply theme to <html> element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("nexuscrm-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const PageComponent = PAGES[page] ?? DashboardPage;

  return (
    <div className="app-layout">
      <Sidebar
        currentPage={page}
        onNavigate={setPage}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
      />
      <main className="main-content" key={page}>
        <PageComponent />
      </main>
    </div>
  );
}
