import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

function StatCard({ label, value, icon, color, loading, delay }) {
  const [visible, setVisible] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!loading && visible) {
      let start = 0;
      const end = value;
      if (end === 0) return;
      const duration = 1000;
      const step = Math.ceil(end / (duration / 16));
      const timer = setInterval(() => {
        start += step;
        if (start >= end) { setCount(end); clearInterval(timer); }
        else setCount(start);
      }, 16);
      return () => clearInterval(timer);
    }
  }, [loading, visible, value]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 transition-all duration-700"
      style={{
        background: "linear-gradient(135deg, #0d1b2e, #0a1628)",
        border: `1px solid ${color}20`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        boxShadow: visible ? `0 0 30px ${color}10` : "none",
      }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-10 -mt-10" style={{ background: `radial-gradient(circle, ${color}20, transparent)` }}></div>
      <div className="flex items-center justify-between mb-5">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <img src={icon} alt={label} className="w-7 h-7 object-contain" />
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, animation: "pulse 2s infinite" }}></div>
          <span className="text-xs font-medium" style={{ color: `${color}99` }}>LIVE</span>
        </div>
      </div>
      <p className="text-4xl font-bold mb-1.5 tabular-nums" style={{ color }}>
        {loading ? "—" : count}
      </p>
      <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
    </div>
  );
}

function TableRow({ c, i, isAdmin, navigate, onDelete, onEdit }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100 + i * 60);
    return () => clearTimeout(t);
  }, [i]);

  return (
    <tr
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-10px)",
        transition: "all 0.4s ease",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(77,142,240,0.05)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <td className="px-6 py-4 text-sm" style={{ color: "rgba(255,255,255,0.2)" }}>{c.id}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white" style={{ background: "linear-gradient(135deg, #1a3a6e, #1a4db5)" }}>
            {c.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{c.name}</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>Airline ID #{c.id}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-semibold text-white">{c.planes}</span>
        <span className="text-xs ml-1" style={{ color: "rgba(255,255,255,0.3)" }}>aircraft</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-semibold text-white">{c.terminals}</span>
        <span className="text-xs ml-1" style={{ color: "rgba(255,255,255,0.3)" }}>terminals</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          {[
            { label: "Records", path: "records", color: "#4d8ef0" },
            { label: "Planes", path: "planes", color: "#a78bfa" },
            { label: "Flights", path: "flights", color: "#34d399" },
          ].map(btn => (
            <button
              key={btn.path}
              onClick={() => navigate(`/companies/${c.id}/${btn.path}`, { state: { companyName: c.name } })}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 hover:scale-105"
              style={{ background: `${btn.color}12`, color: btn.color, border: `1px solid ${btn.color}25` }}
              onMouseEnter={e => { e.currentTarget.style.background = `${btn.color}25`; }}
              onMouseLeave={e => { e.currentTarget.style.background = `${btn.color}12`; }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </td>
      {isAdmin && (
        <td className="px-6 py-4">
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(c)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 hover:scale-105"
              style={{ background: "rgba(245,158,11,0.08)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.15)" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(245,158,11,0.18)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(245,158,11,0.08)"}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(c.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 hover:scale-105"
              style={{ background: "rgba(239,68,68,0.08)", color: "#fc8181", border: "1px solid rgba(239,68,68,0.15)" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.18)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
            >
              Delete
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}

export default function Dashboard() {
  const [companies, setCompanies] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", planes: "", terminals: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [editCompany, setEditCompany] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", planes: "", terminals: "" });
  const [navVisible, setNavVisible] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));
  const isAdmin = user?.type === "admin";

  useEffect(() => {
    setTimeout(() => setNavVisible(true), 100);
    fetchCompanies();
  }, []);

  const fetchCompanies = () => {
    setLoading(true);
    fetch("https://aeronexus-backend-production.up.railway.app/companies")
      .then(r => r.json())
      .then(d => { setCompanies(d); setLoading(false); });
  };

  const handleAdd = async () => {
    if (!form.name) return;
    const body = `name=${encodeURIComponent(form.name)}&planes=${form.planes}&terminals=${form.terminals}`;
    const res = await fetch("https://aeronexus-backend-production.up.railway.app/companies", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await res.json();
    if (data.success) {
      setMessage("Company added successfully");
      setShowAdd(false);
      setForm({ name: "", planes: "", terminals: "" });
      fetchCompanies();
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this company?")) return;
    await fetch(`https://aeronexus-backend-production.up.railway.app/companies/${id}`, { method: "DELETE" });
    fetchCompanies();
  };

  const handleUpdate = async () => {
    const body = `name=${encodeURIComponent(editForm.name)}&planes=${editForm.planes}&terminals=${editForm.terminals}`;
    const res = await fetch(`https://aeronexus-backend-production.up.railway.app/companies/${editCompany.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await res.json();
    if (data.success) {
      setMessage("Company updated successfully");
      setEditCompany(null);
      fetchCompanies();
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#05101f", color: "white" }}>

      <nav
        style={{
          background: "rgba(5,16,31,0.92)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(24px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          opacity: navVisible ? 1 : 0,
          transform: navVisible ? "translateY(0)" : "translateY(-10px)",
          transition: "all 0.5s ease",
        }}
      >
        <div className="max-w-7xl mx-auto px-8 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="AeroNexus" className="w-10 h-10 object-contain" style={{ filter: "drop-shadow(0 0 8px rgba(77,142,240,0.4))" }} />
            <div>
              <p className="font-bold text-white text-lg leading-none tracking-tight">
                Aero<span style={{ color: "#4d8ef0" }}>Nexus</span>
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em" }}>
                CONNECT · INNOVATE · ELEVATE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-3 px-4 py-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ background: "linear-gradient(135deg, #1a4db5, #4d8ef0)" }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-white">{user?.username}</p>
                <p className="text-xs capitalize" style={{ color: "#4d8ef0" }}>{user?.type}</p>
              </div>
            </div>

            <button
              onClick={() => { sessionStorage.removeItem("user"); window.location.href = "/login"; }}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", color: "#fc8181" }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-10">

        <div className="mb-10" style={{ opacity: navVisible ? 1 : 0, transform: navVisible ? "translateY(0)" : "translateY(10px)", transition: "all 0.6s ease 0.2s" }}>
          <h1 className="text-3xl font-bold text-white mb-1">Flight Operations Center</h1>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.875rem" }}>
            Real-time airline management and operations dashboard
          </p>
        </div>

        <div className="grid grid-cols-3 gap-5 mb-10">
          <StatCard label="Registered Airlines" value={companies.length} icon="/airlines.png" color="#4d8ef0" loading={loading} delay={200} />
          <StatCard label="Total Aircraft" value={companies.reduce((a, c) => a + (Number(c.planes) || 0), 0)} icon="/aircraft.png" color="#a78bfa" loading={loading} delay={350} />
          <StatCard label="Active Terminals" value={companies.reduce((a, c) => a + (Number(c.terminals) || 0), 0)} icon="/terminals.png" color="#34d399" loading={loading} delay={500} />
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "linear-gradient(180deg, #0d1b2e 0%, #091525 100%)" }}>

          <div className="px-6 py-5 flex justify-between items-center" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div>
              <h2 className="font-bold text-white text-lg">Airlines</h2>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
                {companies.length} {companies.length === 1 ? "airline" : "airlines"} registered
              </p>
            </div>
            <div className="flex items-center gap-3">
              {message && (
                <span className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>
                  ✓ {message}
                </span>
              )}
              {isAdmin && (
                <button
                  onClick={() => setShowAdd(!showAdd)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #1a4db5, #4d8ef0)", boxShadow: "0 4px 15px rgba(77,142,240,0.25)" }}
                >
                  + Add Company
                </button>
              )}
            </div>
          </div>

          {showAdd && (
            <div
              className="px-6 py-5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(77,142,240,0.03)" }}
            >
              <p className="text-sm font-semibold text-white mb-4">New Airline Details</p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                { placeholder: "Company name", key: "name", type: "text" },
                { placeholder: "Number of terminals", key: "terminals", type: "number" },
              ].map(f => (
                  <input
                    key={f.key}
                    type={f.type}
                    placeholder={f.ph}
                    value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                    onFocus={e => e.target.style.border = "1px solid rgba(77,142,240,0.5)"}
                    onBlur={e => e.target.style.border = "1px solid rgba(255,255,255,0.08)"}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #1a4db5, #4d8ef0)" }}
                >
                  Save Company
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  className="px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                  style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <table className="w-full text-left">
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                {["#", "Airline", "Aircraft", "Terminals", "Databases", isAdmin && ""].filter(Boolean).map((h, i) => (
                  <th key={i} className="px-6 py-3 text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companies.map((c, i) => (
                  <TableRow key={c.id} c={c} i={i} isAdmin={isAdmin} navigate={navigate} onDelete={handleDelete} onEdit={(c) => { setEditCompany(c); setEditForm({ name: c.name, planes: c.planes, terminals: c.terminals }); }} />              ))}
              {!loading && companies.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center text-sm" style={{ color: "rgba(255,255,255,0.2)" }}>
                    No airlines registered yet. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {editCompany && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
            <div className="rounded-2xl p-8 w-full max-w-md" style={{ background: "#0d1b2e", border: "1px solid rgba(255,255,255,0.08)" }}>
              <h3 className="text-lg font-bold text-white mb-1">Edit Company</h3>
              <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.3)" }}>Update details for {editCompany.name}</p>
              <div className="flex flex-col gap-3 mb-6">
                {[
                  { ph: "Company name", key: "name", type: "text" },
                  { ph: "Number of terminals", key: "terminals", type: "number" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{f.ph}</label>
                    <input
                      type={f.type}
                      value={editForm[f.key]}
                      onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                      onFocus={e => e.target.style.border = "1px solid rgba(77,142,240,0.5)"}
                      onBlur={e => e.target.style.border = "1px solid rgba(255,255,255,0.08)"}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={handleUpdate} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #1a4db5, #4d8ef0)" }}>Save Changes</button>
                <button onClick={() => setEditCompany(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}