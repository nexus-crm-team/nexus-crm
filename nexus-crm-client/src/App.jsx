import { useEffect, useState } from "react";

const API = "https://localhost:7231/api";

export default function App() {
    const [companies, setCompanies] = useState([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    async function loadCompanies() {
        const res = await fetch(`${API}/companies`);
        const result = await res.json();
        if (result.isSuccess) setCompanies(result.data);
        else setError(result.message);
    }

    useEffect(() => {
        let ignore = false;
        fetch(`${API}/companies`)
            .then((res) => res.json())
            .then((result) => {
                if (ignore) return;
                if (result.isSuccess) setCompanies(result.data);
                else setError(result.message);
            });
        return () => { ignore = true; };
    }, []);

    async function addCompany(e) {
        e.preventDefault();
        setError("");
        const res = await fetch(`${API}/companies`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name,
                email,
                industry: "IT",
                address: { country: "Armenia", region: "Yerevan", city: "Yerevan", street: "-" },
            }),
        });
        const result = await res.json();
        if (result.isSuccess) {
            setName(""); setEmail("");
            loadCompanies();
        } else {
            setError(result.message);
        }
    }

    return (
        <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
            <h1>NexusCRM — Companies</h1>

            <form onSubmit={addCompany} style={{ marginBottom: 20 }}>
                <input value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Company name" required />
                <input value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email" type="email" required />
                <button type="submit">Add</button>
            </form>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <ul>
                {companies.map((c) => (
                    <li key={c.id}>
                        <b>{c.name}</b> — {c.email} {c.isActive ? "✅" : "⛔"}
                    </li>
                ))}
            </ul>
        </div>
    );
}