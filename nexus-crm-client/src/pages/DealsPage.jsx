import { useEffect, useState } from "react";
import { apiGet, apiSend } from "../api";

// Matches DealStatus enum on the backend: 0..4
const DEAL_STATUS = ["New", "Waiting for approval", "In progress", "Ended", "Cancelled"];

const emptyForm = {
  title: "",
  description: "",
  estimatedValue: "",
  deadline: "",
  customerId: "",
};

export default function DealsPage() {
  const [deals, setDeals] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  function set(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function loadDeals() {
    const result = await apiGet("/deals");
    if (result.isSuccess) setDeals(result.data);
    else setError(result.message);
  }

  useEffect(() => {
    let ignore = false;
    Promise.all([apiGet("/deals"), apiGet("/customers")]).then(
      ([dealsResult, customersResult]) => {
        if (ignore) return;
        if (dealsResult.isSuccess) setDeals(dealsResult.data);
        else setError(dealsResult.message);
        if (customersResult.isSuccess) setCustomers(customersResult.data);
      }
    );
    return () => { ignore = true; };
  }, []);

  async function addDeal(e) {
    e.preventDefault();
    setError("");

    const customer = customers.find((c) => c.id === Number(form.customerId));
    if (!customer) {
      setError("Select a customer first");
      return;
    }

    const result = await apiSend("/deals", "POST", {
      title: form.title,
      description: form.description || null,
      estimatedValue: Number(form.estimatedValue) || 0,
      status: 0, // New
      deadline: form.deadline,
      customerId: customer.id,
      companyId: customer.companyId,
    });
    if (result.isSuccess) {
      setForm(emptyForm);
      loadDeals();
    } else {
      setError(result.message);
    }
  }

  async function deleteDeal(id) {
    setError("");
    const result = await apiSend(`/deals/${id}`, "DELETE");
    if (result.isSuccess) loadDeals();
    else setError(result.message);
  }

  function customerName(id) {
    const customer = customers.find((c) => c.id === id);
    return customer ? customer.fullName : `#${id}`;
  }

  return (
    <div>
      <h2>Deals</h2>

      <form onSubmit={addDeal} className="card">
        <div className="row">
          <input value={form.title} onChange={(e) => set("title", e.target.value)}
                 placeholder="Title" required maxLength={20} />
          <input value={form.estimatedValue} onChange={(e) => set("estimatedValue", e.target.value)}
                 placeholder="Estimated value" type="number" min="0" step="0.01" />
          <input value={form.deadline} onChange={(e) => set("deadline", e.target.value)}
                 type="date" required />
          <select value={form.customerId} onChange={(e) => set("customerId", e.target.value)} required>
            <option value="">— Select customer —</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.fullName}</option>
            ))}
          </select>
        </div>
        <div className="row">
          <input value={form.description} onChange={(e) => set("description", e.target.value)}
                 placeholder="Description" style={{ flex: 1 }} />
        </div>
        <button type="submit">Add deal</button>
      </form>

      {error && <p className="error">{error}</p>}

      <table>
        <thead>
          <tr>
            <th>Title</th><th>Value</th><th>Status</th><th>Customer</th><th></th>
          </tr>
        </thead>
        <tbody>
          {deals.map((d) => (
            <tr key={d.id}>
              <td><b>{d.title}</b></td>
              <td>{d.estimatedValue}</td>
              <td>{DEAL_STATUS[d.status] ?? d.status}</td>
              <td>{customerName(d.customerId)}</td>
              <td>
                <button className="danger" onClick={() => deleteDeal(d.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {deals.length === 0 && (
            <tr><td colSpan="5" className="muted">No deals yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
