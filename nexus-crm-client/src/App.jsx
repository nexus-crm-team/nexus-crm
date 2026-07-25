import { useState, useEffect } from "react";
import "./index.css";
import { getUserInfo, clearAuthSession } from "./api";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./pages/DashboardPage";
import CompaniesPage from "./pages/CompaniesPage";
import CustomersPage from "./pages/CustomersPage";
import DealsPage from "./pages/DealsPage";
import TasksPage from "./pages/TasksPage";
import NotesPage from "./pages/NotesPage";
import EmployeesPage from "./pages/EmployeesPage";
import LoginPage from "./pages/LoginPage";
import RegisterCompanyPage from "./pages/RegisterCompanyPage";

const PAGES = {
  dashboard: DashboardPage,
  companies: CompaniesPage,
  customers: CustomersPage,
  deals: DealsPage,
  tasks: TasksPage,
  notes: NotesPage,
  employees: EmployeesPage,
};

export default function App() {
  const [user, setUser] = useState(() => getUserInfo());
  const [authView, setAuthView] = useState("login"); // "login" | "register"
  const [page, setPage] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("nexuscrm-theme") === "dark";
  });

  // Apply theme to <html> element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("nexuscrm-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  function handleLoginSuccess(userData) {
    setUser(getUserInfo() || userData);
    setPage("dashboard");
  }

  function handleLogout() {
    clearAuthSession();
    setUser(null);
    setAuthView("login");
  }

  // Unauthenticated view
  if (!user) {
    return authView === "login" ? (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onGoToRegister={() => setAuthView("register")}
      />
    ) : (
      <RegisterCompanyPage
        onRegisterSuccess={handleLoginSuccess}
        onGoToLogin={() => setAuthView("login")}
      />
    );
  }

  // Authenticated CRM Dashboard view
  const PageComponent = PAGES[page] ?? DashboardPage;

  return (
    <div className="app-layout">
      <Sidebar
        currentPage={page}
        onNavigate={setPage}
        user={user}
        onLogout={handleLogout}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
      />
      <main className="main-content" key={page}>
        <PageComponent />
      </main>
    </div>
  );
}
