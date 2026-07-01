import { useEffect, useState } from "react";
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
      className="relative overflow-hidden p-6 transition-all duration-300 font-mono group"
      style={{
        background: "#12121a",
        border: `1px solid ${color}40`,
        clipPath: "polygon(0 15px, 15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow = `0 0 15px ${color}30, inset 0 0 20px ${color}10`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${color}40`;
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Decorative corner tech markers */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t border-l" style={{ borderColor: color }}></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r" style={{ borderColor: color }}></div>

      <div className="absolute top-0 right-0 w-32 h-32 opacity-20" style={{ background: `radial-gradient(circle at top right, ${color}, transparent 70%)` }}></div>
      
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div 
          className="w-12 h-12 flex items-center justify-center p-2" 
          style={{ 
            background: "#0a0a0f", 
            border: `1px solid ${color}50`,
            clipPath: "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)"
          }}
        >
          <img src={icon} alt={label} className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
        </div>
        <div className="flex items-center gap-2 border px-2 py-1" style={{ borderColor: `${color}40`, background: `${color}10` }}>
          <div className="w-2 h-2" style={{ background: color, animation: "pulse 1.5s steps(2, start) infinite" }}></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: color }}>LIVE</span>
        </div>
      </div>
      <p className="text-5xl font-black mb-1 tabular-nums tracking-tighter" style={{ color: "#e0e0e0", textShadow: `0 0 10px ${color}50` }}>
        {loading ? "—" : count}
      </p>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#6b7280" }}>{label}</p>
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
      className="font-mono text-sm transition-all duration-200 group"
      style={{
        borderBottom: "1px solid #2a2a3a",
        background: "#0a0a0f",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateX(0)" : "translateX(-10px)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "#12121a";
        e.currentTarget.style.boxShadow = "inset 2px 0 0 #00d4ff";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "#0a0a0f";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <td className="px-6 py-4 text-[#6b7280]">
        {c.id}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 flex items-center justify-center font-black text-lg text-[#0a0a0f]" 
            style={{ 
              background: "#00d4ff",
              clipPath: "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)",
              boxShadow: "0 0 10px rgba(0,212,255,0.5)"
            }}
          >
            {c.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-[#e0e0e0] group-hover:text-[#00d4ff] group-hover:drop-shadow-[0_0_5px_rgba(0,212,255,0.5)] transition-colors">{c.name}</p>
            <p className="text-[10px] tracking-[0.1em] text-[#6b7280]">Airline ID #{c.id}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-base font-bold text-[#e0e0e0] mr-2">{c.planes}</span>
        <span className="text-[10px] tracking-[0.1em] text-[#6b7280] lowercase">aircraft</span>
      </td>
      <td className="px-6 py-4">
        <span className="text-base font-bold text-[#e0e0e0] mr-2">{c.terminals}</span>
        <span className="text-[10px] tracking-[0.1em] text-[#6b7280] lowercase">terminals</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          {[
            { label: "RECORDS", path: "records", color: "#00d4ff" },
            { label: "PLANES", path: "planes", color: "#ff00ff" },
            { label: "FLIGHTS", path: "flights", color: "#00ff88" },
          ].map(btn => (
            <button
              key={btn.path}
              onClick={() => navigate(`/companies/${c.id}/${btn.path}`, { state: { companyName: c.name } })}
              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-150"
              style={{ 
                background: "transparent", 
                color: btn.color, 
                border: `1px solid ${btn.color}50`,
                clipPath: "polygon(0 4px, 4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)"
              }}
              onMouseEnter={e => { 
                e.currentTarget.style.background = btn.color; 
                e.currentTarget.style.color = "#0a0a0f";
                e.currentTarget.style.boxShadow = `0 0 10px ${btn.color}80`;
              }}
              onMouseLeave={e => { 
                e.currentTarget.style.background = "transparent"; 
                e.currentTarget.style.color = btn.color;
                e.currentTarget.style.boxShadow = "none";
              }}
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
              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-150 text-[#ffaa00] border border-[#ffaa00]/50 hover:bg-[#ffaa00] hover:text-[#0a0a0f] hover:shadow-[0_0_10px_rgba(255,170,0,0.8)]"
              style={{ clipPath: "polygon(0 4px, 4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)" }}
            >
              EDIT
            </button>
            <button
              onClick={() => onDelete(c.id)}
              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-150 text-[#ff3366] border border-[#ff3366]/50 hover:bg-[#ff3366] hover:text-[#0a0a0f] hover:shadow-[0_0_10px_rgba(255,51,102,0.8)]"
              style={{ clipPath: "polygon(0 4px, 4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)" }}
            >
              DELETE
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
    fetch(import.meta.env.VITE_API_URL + "/companies", { headers: { "Authorization": "Bearer " + (JSON.parse(sessionStorage.getItem("user"))?.token || "") } })
      .then(r => r.json())
      .then((data) => {
        setCompanies(data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setError("Failed to connect to server");
      });
  };

  const handleAdd = async () => {
    if (!form.name) return;
    const body = `name=${encodeURIComponent(form.name)}&planes=${form.planes}&terminals=${form.terminals}`;
    const res = await fetch(import.meta.env.VITE_API_URL + "/companies", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" , "Authorization": "Bearer " + (JSON.parse(sessionStorage.getItem("user"))?.token || "") },
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
    await fetch(`${import.meta.env.VITE_API_URL}/companies/${id}`, { method: "DELETE", headers: { "Authorization": "Bearer " + (JSON.parse(sessionStorage.getItem("user"))?.token || "") } });
    fetchCompanies();
  };

  const handleUpdate = async () => {
    const body = `name=${encodeURIComponent(editForm.name)}&planes=${editForm.planes}&terminals=${editForm.terminals}`;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/companies/${editCompany.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/x-www-form-urlencoded" , "Authorization": "Bearer " + (JSON.parse(sessionStorage.getItem("user"))?.token || "") },
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
    <>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes rgbShift {
          0%, 100% { text-shadow: -2px 0 #ff00ff, 2px 0 #00d4ff; }
          50% { text-shadow: 2px 0 #ff00ff, -2px 0 #00d4ff; }
        }
        .cyber-glitch { animation: rgbShift 3s infinite alternate; }
        .cyber-scanlines::after {
          content: "";
          position: fixed;
          inset: 0;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.3) 2px, rgba(0, 0, 0, 0.3) 4px);
          pointer-events: none;
          z-index: 9999;
        }
        .cyber-grid {
          background-image: 
            linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        .num-input::-webkit-inner-spin-button,
        .num-input::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .num-input { -moz-appearance: textfield; }
      `}</style>

      <div className="min-h-screen bg-[#0a0a0f] text-[#e0e0e0] font-mono cyber-scanlines cyber-grid relative overflow-x-hidden pb-20">

        {/* Navbar */}
        <nav
          className="border-b border-[#2a2a3a] bg-[#12121a]/80 backdrop-blur-md sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          style={{
            opacity: navVisible ? 1 : 0,
            transform: navVisible ? "translateY(0)" : "translateY(-10px)",
            transition: "all 0.3s steps(4)",
          }}
        >
          <div className="h-1 w-full bg-gradient-to-r from-[#ff00ff] via-[#00d4ff] to-[#00ff88]"></div>

          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 border border-[#00ff88] p-1 shadow-[0_0_10px_rgba(0,255,136,0.2)] relative"
                   style={{ clipPath: "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)" }}>
                <img src="/logo.png" alt="AeroNexus" className="w-full h-full object-contain filter drop-shadow-[0_0_5px_#00ff88]" />
              </div>
              <div>
                <p className="font-black text-[#e0e0e0] text-xl uppercase tracking-widest leading-none cyber-glitch" style={{ fontFamily: '"Orbitron", "Share Tech Mono", monospace' }}>
                  Aero<span className="text-[#00ff88]">Nexus</span>
                </p>
                <p className="text-[9px] mt-1 text-[#00ff88] tracking-[0.3em] uppercase flex items-center gap-2">
                  CONNECT · INNOVATE · ELEVATE
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-[#0a0a0f] border border-[#2a2a3a]"
                   style={{ clipPath: "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)" }}>
                <div className="w-6 h-6 flex items-center justify-center font-bold text-xs bg-[#00ff88] text-[#0a0a0f]">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="leading-tight text-right hidden sm:block">
                  <p className="text-xs font-bold text-[#e0e0e0]">{user?.username}</p>
                  <p className="text-[9px] uppercase tracking-widest text-[#6b7280] capitalize">{user?.type}</p>
                </div>
              </div>

              <button
                onClick={() => { sessionStorage.removeItem("user"); window.location.href = "/login"; }}
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#ff3366] border border-[#ff3366]/50 hover:bg-[#ff3366] hover:text-[#0a0a0f] hover:shadow-[0_0_15px_rgba(255,51,102,0.6)] transition-all"
                style={{ clipPath: "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)" }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">

          <div className="mb-12 border-l-4 border-[#00ff88] pl-6 relative" style={{ opacity: navVisible ? 1 : 0, transform: navVisible ? "translateY(0)" : "translateY(10px)", transition: "all 0.3s steps(4) 0.2s" }}>
            <div className="absolute -left-[6px] top-0 w-2 h-2 bg-[#00ff88] shadow-[0_0_10px_#00ff88]"></div>
            <h1 className="text-3xl font-bold text-[#e0e0e0] mb-2 font-sans tracking-tight">
              Flight Operations Center
            </h1>
            <p className="text-[#6b7280] text-sm flex items-center gap-2">
              <span className="text-[#00ff88] font-bold">{'>'}</span> Real-time airline management and operations dashboard
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <StatCard label="Registered Airlines" value={companies.length} icon="/airlines.png" color="#00d4ff" loading={loading} delay={100} />
            <StatCard label="Total Aircraft" value={companies.reduce((a, c) => a + (Number(c.planes) || 0), 0)} icon="/aircraft.png" color="#ff00ff" loading={loading} delay={200} />
            <StatCard label="Active Terminals" value={companies.reduce((a, c) => a + (Number(c.terminals) || 0), 0)} icon="/terminals.png" color="#00ff88" loading={loading} delay={300} />
          </div>

          <div className="bg-[#12121a] border border-[#2a2a3a] relative" style={{ clipPath: "polygon(0 20px, 20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)" }}>
            
            <div className="bg-[#0a0a0f] border-b border-[#2a2a3a] px-6 py-2 flex justify-between items-center">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-none bg-[#ff3366] opacity-80"></div>
                <div className="w-3 h-3 rounded-none bg-[#ffaa00] opacity-80"></div>
                <div className="w-3 h-3 rounded-none bg-[#00ff88] opacity-80"></div>
              </div>
            </div>

            <div className="px-6 py-6 flex justify-between items-end border-b border-[#2a2a3a]">
              <div>
                <h2 className="font-bold text-[#e0e0e0] text-lg flex items-center gap-2">
                  <span className="text-[#00ff88]">{'>'}</span> Airlines
                </h2>
                <p className="text-xs mt-1 text-[#6b7280]">
                  {companies.length} {companies.length === 1 ? "airline" : "airlines"} registered
                </p>
              </div>
              
              <div className="flex flex-col items-end gap-3">
                {message && (
                  <span className="text-xs px-3 py-1 font-bold bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/50 shadow-[0_0_10px_rgba(0,255,136,0.2)]">
                    ✓ {message}
                  </span>
                )}
                {isAdmin && (
                  <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-[#0a0a0f] bg-[#00ff88] hover:brightness-110 hover:shadow-[0_0_15px_rgba(0,255,136,0.6)] transition-all"
                    style={{ clipPath: "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)" }}
                  >
                    {showAdd ? "Cancel" : "+ Add Company"}
                  </button>
                )}
              </div>
            </div>

            {showAdd && (
              <div className="px-6 py-6 border-b border-[#2a2a3a] bg-[#0a0a0f]">
                <p className="text-sm font-bold text-[#00ff88] mb-4">New Airline Details</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {[
                    { placeholder: "Company Name", key: "name", type: "text" },
                    { placeholder: "No. of Terminals", key: "terminals", type: "number" },
                  ].map(f => (
                    <div key={f.key} className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ff88] font-bold">{'>'}</span>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={form[f.key]}
                        onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        className="num-input w-full bg-[#12121a] text-[#00ff88] border border-[#2a2a3a] pl-10 pr-4 py-3 text-sm outline-none focus:border-[#00ff88] focus:shadow-[0_0_10px_rgba(0,255,136,0.3)] transition-all placeholder:text-[#6b7280]/50"
                        style={{ clipPath: "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)" }}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAdd}
                  className="px-8 py-3 text-xs font-bold uppercase tracking-widest text-[#0a0a0f] bg-[#00d4ff] hover:brightness-110 hover:shadow-[0_0_15px_rgba(0,212,255,0.6)] transition-all"
                  style={{ clipPath: "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)" }}
                >
                  Save Company
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0a0a0f]">
                    {["#", "Airline", "Aircraft", "Terminals", "Databases", isAdmin && ""].filter(Boolean).map((h, i) => (
                      <th key={i} className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#6b7280] border-b border-[#2a2a3a]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c, i) => (
                    <TableRow key={c.id} c={c} i={i} isAdmin={isAdmin} navigate={navigate} onDelete={handleDelete} onEdit={(c) => { setEditCompany(c); setEditForm({ name: c.name, planes: c.planes, terminals: c.terminals }); }} />
                  ))}
                  {!loading && companies.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-20 text-center border-b border-[#2a2a3a]">
                        <p className="text-[#6b7280] text-sm">No airlines registered yet. Add one to get started.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {editCompany && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0f]/80 backdrop-blur-md">
            <div 
              className="bg-[#12121a] p-1 w-full max-w-lg border border-[#ffaa00] shadow-[0_0_30px_rgba(255,170,0,0.2)]"
              style={{ clipPath: "polygon(0 20px, 20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%)" }}
            >
              <div className="bg-[#0a0a0f] p-8 h-full relative" style={{ clipPath: "polygon(0 18px, 18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%)" }}>
                
                <div className="flex items-center gap-3 mb-6 border-b border-[#2a2a3a] pb-4">
                  <div className="w-3 h-3 bg-[#ffaa00] animate-pulse"></div>
                  <h3 className="text-xl font-bold text-[#ffaa00] m-0">Edit Company</h3>
                </div>
                
                <p className="text-[#6b7280] text-xs mb-6">Update details for <span className="text-[#e0e0e0] font-bold">{editCompany.name}</span></p>
                
                <div className="flex flex-col gap-6 mb-8">
                  {[
                    { ph: "Company Name", key: "name", type: "text" },
                    { ph: "Number of Terminals", key: "terminals", type: "number" },
                  ].map(f => (
                    <div key={f.key} className="relative">
                      <label className="text-[#6b7280] text-xs font-bold mb-2 block">{f.ph}</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ffaa00] font-bold">{'>'}</span>
                        <input
                          type={f.type}
                          value={editForm[f.key]}
                          onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })}
                          className="num-input w-full bg-[#12121a] text-[#ffaa00] border border-[#2a2a3a] pl-10 pr-4 py-3 text-sm outline-none focus:border-[#ffaa00] focus:shadow-[0_0_10px_rgba(255,170,0,0.3)] transition-all"
                          style={{ clipPath: "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={handleUpdate} 
                    className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-[#0a0a0f] bg-[#ffaa00] hover:brightness-110 hover:shadow-[0_0_15px_rgba(255,170,0,0.6)] transition-all" 
                    style={{ clipPath: "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)" }}
                  >
                    Save Changes
                  </button>
                  <button 
                    onClick={() => setEditCompany(null)} 
                    className="flex-1 py-3 text-xs font-bold uppercase tracking-widest text-[#6b7280] bg-transparent border border-[#2a2a3a] hover:text-[#e0e0e0] hover:border-[#6b7280] transition-all" 
                    style={{ clipPath: "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}