import { useEffect, useState } from "react";
import { apiGet, apiSend } from "../api";

// Matches CustomerStatus enum on the backend: 0..4
const CUSTOMER_STATUS = ["New", "Active", "Connected", "Inactive", "Lost"];

const emptyForm = {
  fullName: "",
  email: "",
  phoneNumber: "",
  companyId: "",
  country: "Armenia",
  city: "Yerevan",
  street: "",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  function set(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function loadCustomers() {
    const result = await apiGet("/customers");
    if (result.isSuccess) setCustomers(result.data);
    else setError(result.message);
  }

  useEffect(() => {
    let ignore = false;
    Promise.all([apiGet("/customers"), apiGet("/companies")]).then(
      ([customersResult, companiesResult]) => {
        if (ignore) return;
        if (customersResult.isSuccess) setCustomers(customersResult.data);
        else setError(customersResult.message);
        if (companiesResult.isSuccess) setCompanies(companiesResult.data);
      }
    );
    return () => { ignore = true; };
  }, []);

  async function addCustomer(e) {
    e.preventDefault();
    setError("");
    const result = await apiSend("/customers", "POST", {
      fullName: form.fullName,
      email: form.email,
      phoneNumber: form.phoneNumber || null,
      companyId: Number(form.companyId),
      address: {
        country: form.country,
        region: "-",
        city: form.city,
        street: form.street || "-",
      },
    });
    if (result.isSuccess) {
      setForm(emptyForm);
      loadCustomers();
    } else {
      setError(result.message);
    }
  }

  async function deleteCustomer(id) {
    setError("");
    const result = await apiSend(`/customers/${id}`, "DELETE");
    if (result.isSuccess) loadCustomers();
    else setError(result.message);
  }

  function companyName(id) {
    const company = companies.find((c) => c.id === id);
    return company ? company.name : `#${id}`;
  }

  return (
    <div>
      <h2>Customers</h2>

      <form onSubmit={addCustomer} className="card">
        <div className="row">
          <input value={form.fullName} onChange={(e) => set("fullName", e.target.value)}
                 placeholder="Full name" required maxLength={100} />
          <input value={form.email} onChange={(e) => set("email", e.target.value)}
                 placeholder="Email" type="email" required maxLength={30} />
          <input value={form.phoneNumber} onChange={(e) => set("phoneNumber", e.target.value)}
                 placeholder="Phone (optional)" />
        </div>
        <div className="row">
          <select value={form.companyId} onChange={(e) => set("companyId", e.target.value)} required>
            <option value="">— Select company —</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input value={form.country} onChange={(e) => set("country", e.target.value)}
                 placeholder="Country" required />
          <input value={form.city} onChange={(e) => set("city", e.target.value)}
                 placeholder="City" required />
          <input value={form.street} onChange={(e) => set("street", e.target.value)}
                 placeholder="Street" />
        </div>
        <button type="submit">Add customer</button>
      </form>

      {error && <p className="error">{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Company</th><th></th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td><b>{c.fullName}</b></td>
              <td>{c.email}</td>
              <td>{c.phoneNumber || "—"}</td>
              <td>{CUSTOMER_STATUS[c.status] ?? c.status}</td>
              <td>{companyName(c.companyId)}</td>
              <td>
                <button className="danger" onClick={() => deleteCustomer(c.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {customers.length === 0 && (
            <tr><td colSpan="6" className="muted">No customers yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
