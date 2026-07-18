import { useEffect, useState } from "react";
import { apiGet, apiSend } from "../api";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  industry: "",
  country: "Armenia",
  city: "Yerevan",
  street: "",
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  function set(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function loadCompanies() {
    const result = await apiGet("/companies");
    if (result.isSuccess) setCompanies(result.data);
    else setError(result.message);
  }

  useEffect(() => {
    let ignore = false;
    apiGet("/companies").then((result) => {
      if (ignore) return;
      if (result.isSuccess) setCompanies(result.data);
      else setError(result.message);
    });
    return () => { ignore = true; };
  }, []);

  async function addCompany(e) {
    e.preventDefault();
    setError("");
    const result = await apiSend("/companies", "POST", {
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      industry: form.industry,
      address: {
        country: form.country,
        region: "-",
        city: form.city,
        street: form.street || "-",
      },
    });
    if (result.isSuccess) {
      setForm(emptyForm);
      loadCompanies();
    } else {
      setError(result.message);
    }
  }

  async function deleteCompany(id) {
    setError("");
    const result = await apiSend(`/companies/${id}`, "DELETE");
    if (result.isSuccess) loadCompanies();
    else setError(result.message);
  }

  return (
    <div>
      <h2>Companies</h2>

      <form onSubmit={addCompany} className="card">
        <div className="row">
          <input value={form.name} onChange={(e) => set("name", e.target.value)}
                 placeholder="Company name" required maxLength={30} />
          <input value={form.email} onChange={(e) => set("email", e.target.value)}
                 placeholder="Email" type="email" required maxLength={30} />
          <input value={form.industry} onChange={(e) => set("industry", e.target.value)}
                 placeholder="Industry" required maxLength={30} />
        </div>
        <div className="row">
          <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
                 placeholder="Phone (optional)" />
          <input value={form.country} onChange={(e) => set("country", e.target.value)}
                 placeholder="Country" required />
          <input value={form.city} onChange={(e) => set("city", e.target.value)}
                 placeholder="City" required />
          <input value={form.street} onChange={(e) => set("street", e.target.value)}
                 placeholder="Street" />
        </div>
        <button type="submit">Add company</button>
      </form>

      {error && <p className="error">{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Industry</th><th>Active</th><th></th>
          </tr>
        </thead>
        <tbody>
          {companies.map((c) => (
            <tr key={c.id}>
              <td><b>{c.name}</b></td>
              <td>{c.email}</td>
              <td>{c.industry}</td>
              <td>{c.isActive ? "✅" : "⛔"}</td>
              <td>
                <button className="danger" onClick={() => deleteCompany(c.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {companies.length === 0 && (
            <tr><td colSpan="5" className="muted">No companies yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
