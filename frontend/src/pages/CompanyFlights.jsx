import { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

// ─── Searchable plane dropdown ────────────────────────────────────────────────
function PlaneSearchSelect({ planes, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const boxRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = planes.filter(p =>
    `${p.modelNo} ${p.serialNo}`.toLowerCase().includes(query.toLowerCase())
  );

  const selected = planes.find(p => p.modelNo === value);

  return (
    <div ref={boxRef} className="relative col-span-2">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-2.5 rounded-xl text-sm text-left outline-none flex items-center justify-between transition-all"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: open ? "1px solid rgba(52,211,153,0.5)" : "1px solid rgba(255,255,255,0.08)",
          color: selected ? "white" : "rgba(255,255,255,0.3)",
        }}
      >
        <span>
          {planes.length === 0
            ? "No active planes available"
            : selected
              ? `${selected.modelNo}  —  ${selected.serialNo}`
              : "Select a plane…"}
        </span>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>▾</span>
      </button>

      {open && (
        <div
          className="absolute z-30 mt-1.5 w-full rounded-xl overflow-hidden shadow-2xl"
          style={{ background: "#0b1929", border: "1px solid rgba(52,211,153,0.15)" }}
        >
          {/* Search input */}
          <div className="p-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <input
              autoFocus
              type="text"
              placeholder="Search by model or serial no…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            />
          </div>

          {/* Options list */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
                No matching active planes.
              </p>
            ) : (
              filtered.map(p => (
                <button
                  type="button"
                  key={p.serialNo}
                  onClick={() => { onChange(p.modelNo); setOpen(false); setQuery(""); }}
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                  style={{
                    background: p.modelNo === value ? "rgba(52,211,153,0.12)" : "transparent",
                    color: "white",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(52,211,153,0.08)"}
                  onMouseLeave={e => e.currentTarget.style.background = p.modelNo === value ? "rgba(52,211,153,0.12)" : "transparent"}
                >
                  <span className="font-semibold">{p.modelNo}</span>
                  <span style={{ color: "rgba(255,255,255,0.35)" }}> — {p.serialNo}</span>
                  <span
                    className="ml-2 px-1.5 py-0.5 rounded text-xs font-semibold"
                    style={{ background: "rgba(52,211,153,0.1)", color: "#34d399" }}
                  >
                    Active
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add Flight form (always Scheduled, no status picker) ─────────────────────
function AddFlightPanel({ form, setForm, onSave, onCancel, planes }) {
  return (
    <div
      className="rounded-2xl p-6 mb-6"
      style={{ background: "rgba(52,211,153,0.03)", border: "1px solid rgba(52,211,153,0.15)" }}
    >
      <p className="text-sm font-semibold text-white mb-4">New Flight</p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {[
          { ph: "From (Airport)", key: "airport", type: "text" },
          { ph: "To (Destination)", key: "destination", type: "text" },
          { ph: "Distance (km)", key: "distance", type: "number" },
        ].map(f => (
          <input
            key={f.key}
            type={f.type}
            placeholder={f.ph}
            value={form[f.key]}
            onChange={e => setForm({ ...form, [f.key]: e.target.value })}
            className="px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            onFocus={e => e.target.style.border = "1px solid rgba(52,211,153,0.5)"}
            onBlur={e => e.target.style.border = "1px solid rgba(255,255,255,0.08)"}
          />
        ))}

        {/* Searchable plane selector spans full width */}
        <PlaneSearchSelect
          planes={planes}
          value={form.modelno}
          onChange={modelno => setForm({ ...form, modelno })}
        />
      </div>

      {/* Status hint */}
      <p className="text-xs mt-1 mb-4" style={{ color: "rgba(255,255,255,0.25)" }}>
        ✦ New flights are always saved as{" "}
        <span style={{ color: "#fbbf24", fontWeight: 600 }}>Scheduled</span>.
        Change status later from the <span style={{ color: "#4d8ef0" }}>Records</span> page.
      </p>

      <div className="flex gap-2">
        <button
          onClick={onSave}
          disabled={!form.airport || !form.destination || !form.modelno || !form.distance}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{ background: "linear-gradient(135deg, #065f46, #34d399)" }}
        >
          Save Flight
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    Completed: { background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" },
    Cancelled: { background: "rgba(239,68,68,0.1)", color: "#fc8181", border: "1px solid rgba(239,68,68,0.2)" },
    Scheduled: { background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" },
  };
  return (
    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold" style={styles[status] || styles.Scheduled}>
      {status}
    </span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CompanyFlights() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState(location.state?.companyName || "");
  const [flights, setFlights] = useState([]);
  const [planes, setPlanes] = useState([]);   // only Active planes
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ airport: "", destination: "", modelno: "", distance: "" });
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  const user = JSON.parse(sessionStorage.getItem("user"));
  const isAdmin = user?.type === "admin";

  // Resolve company name if not passed via router state
  useEffect(() => {
    if (!companyName) {
      fetch("https://aeronexus-backend-production.up.railway.app/companies")
        .then(r => r.json())
        .then(data => {
          const found = data.find(c => String(c.id) === String(id));
          if (found) setCompanyName(found.name);
        });
    }
  }, [id]);

  useEffect(() => {
    fetchFlights();
    fetchPlanes();
    setTimeout(() => setVisible(true), 100);
  }, []);

  const fetchFlights = () =>
    fetch(`https://aeronexus-backend-production.up.railway.app/companies/${id}/flights`)
      .then(r => r.json())
      .then(setFlights)
      .catch(() => setFlights([]));

  // Fetch all planes for this company, keep only Active ones for the dropdown
  const fetchPlanes = () =>
    fetch(`https://aeronexus-backend-production.up.railway.app/companies/${id}/planes`)
      .then(r => r.json())
      .then(data => setPlanes(data.filter(p => p.status === "Active")))
      .catch(() => setPlanes([]));

  const resetForm = () => setForm({ airport: "", destination: "", modelno: "", distance: "" });

  const handleAdd = async () => {
    // Always send status=Scheduled — never allow anything else on add
    const body =
      `airport=${encodeURIComponent(form.airport)}` +
      `&destination=${encodeURIComponent(form.destination)}` +
      `&modelno=${encodeURIComponent(form.modelno)}` +
      `&distance=${form.distance}` +
      `&status=Scheduled`;

    const res = await fetch(
      `https://aeronexus-backend-production.up.railway.app/companies/${id}/flights`,
      { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body }
    );
    const data = await res.json();
    if (data.success) {
      setMessage("Flight added!");
      setShowAdd(false);
      resetForm();
      fetchFlights();
      setTimeout(() => setMessage(""), 2500);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: "#05101f", color: "white" }}>

      {/* Nav */}
      <nav style={{ background: "rgba(5,16,31,0.92)", borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(24px)", position: "sticky", top: 0, zIndex: 100 }}>
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
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
            >
              ← Dashboard
            </button>
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: "linear-gradient(135deg, #1a4db5, #4d8ef0)" }}>
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-white">{user?.username}</p>
                <p className="text-xs capitalize" style={{ color: "#4d8ef0" }}>{user?.type}</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-10">

        {/* Page header */}
        <div
          className="mb-8"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)", transition: "all 0.5s ease" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#34d399" }}>{companyName}</p>
          <h1 className="text-3xl font-bold text-white mb-1">Flight Schedule</h1>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.875rem" }}>Active and upcoming flights for this airline</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Flights",  value: flights.length,                                          color: "#34d399" },
            { label: "Scheduled",      value: flights.filter(f => f.status === "Scheduled").length,     color: "#fbbf24" },
            { label: "Completed",      value: flights.filter(f => f.status === "Completed").length,     color: "#4d8ef0" },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-2xl px-6 py-4 flex items-center justify-between"
              style={{
                background: "linear-gradient(135deg, #0d1b2e, #0a1628)",
                border: `1px solid ${s.color}20`,
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(15px)",
                transition: `all 0.5s ease ${i * 0.1 + 0.2}s`,
              }}
            >
              <div>
                <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</p>
              </div>
              <div className="w-2 h-2 rounded-full" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
            </div>
          ))}
        </div>

        {/* Flights table card */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.06)", background: "linear-gradient(180deg, #0d1b2e 0%, #091525 100%)" }}
        >
          {/* Header row */}
          <div className="px-6 py-5 flex justify-between items-center" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div>
              <h2 className="font-bold text-white text-lg">Flights</h2>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>{flights.length} flights total</p>
            </div>
            <div className="flex items-center gap-3">
              {message && (
                <span
                  className="text-xs px-3 py-1.5 rounded-lg font-medium"
                  style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}
                >
                  ✓ {message}
                </span>
              )}
              {isAdmin && (
                <button
                  onClick={() => { setShowAdd(v => !v); resetForm(); }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #065f46, #34d399)", boxShadow: "0 4px 15px rgba(52,211,153,0.25)" }}
                >
                  {showAdd ? "✕ Cancel" : "+ Add Flight"}
                </button>
              )}
            </div>
          </div>

          {/* Add form */}
          {showAdd && (
            <div className="px-6 pt-5">
              <AddFlightPanel
                form={form}
                setForm={setForm}
                onSave={handleAdd}
                onCancel={() => { setShowAdd(false); resetForm(); }}
                planes={planes}
              />
            </div>
          )}

          {/* Table */}
          <table className="w-full text-left">
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                {["Route", "Model", "Distance", "Status"].map((h, i) => (
                  <th
                    key={i}
                    className="px-6 py-3 text-xs font-bold uppercase tracking-widest"
                    style={{ color: "rgba(255,255,255,0.2)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {flights.map((f, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateX(0)" : "translateX(-10px)",
                    transition: `all 0.4s ease ${i * 0.05 + 0.3}s`,
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(52,211,153,0.03)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{f.airport}</span>
                      <span style={{ color: "rgba(255,255,255,0.25)" }}>→</span>
                      <span className="font-semibold text-white text-sm">{f.destination}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{f.modelno}</td>
                  <td className="px-6 py-4 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{f.distance} km</td>
                  <td className="px-6 py-4"><StatusBadge status={f.status} /></td>
                </tr>
              ))}
              {flights.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-sm" style={{ color: "rgba(255,255,255,0.2)" }}>
                    No flights scheduled for {companyName}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Info note for non-admins / general */}
        <p className="mt-4 text-xs text-center" style={{ color: "rgba(255,255,255,0.15)" }}>
          To update or cancel a flight, go to the <span style={{ color: "#4d8ef0" }}>Records</span> page for this airline.
        </p>
      </div>
    </div>
  );
}