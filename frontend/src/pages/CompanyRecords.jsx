import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

// ─── Form Panel (Used for both Add and Edit) ──────────────────────────────────
function FormPanel({ form, setForm, onSave, onCancel, saveLabel }) {
  return (
    <div 
      className="p-6 mb-8 font-mono relative bg-[#0a0a0f] border border-[#2a2a3a]"
      style={{ clipPath: "polygon(0 15px, 15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)" }}
    >
      <p className="text-sm font-bold text-[#00d4ff] mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
        <span className="w-2 h-2 bg-[#00d4ff] animate-pulse"></span>
        {saveLabel === "Save Record" ? "New Flight Record" : "Update Flight Status"}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {[
          { ph: "From (Airport)", key: "airport", type: "text" },
          { ph: "To (Destination)", key: "destination", type: "text" },
          { ph: "Plane Model No", key: "modelno", type: "text" },
          { ph: "Distance (km)", key: "distance", type: "number" },
          { ph: "Fuel Consumed (L)", key: "fuelConsumed", type: "number" },
        ].map(f => (
          <div key={f.key} className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00d4ff] font-bold">{'>'}</span>
            <input
              type={f.type}
              placeholder={f.ph}
              value={form[f.key]}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              className="num-input w-full bg-[#12121a] text-[#00d4ff] border border-[#2a2a3a] pl-10 pr-4 py-3 text-sm outline-none focus:border-[#00d4ff] focus:shadow-[0_0_10px_rgba(0,212,255,0.3)] transition-all placeholder:text-[#6b7280]/50"
              style={{ clipPath: "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)" }}
            />
          </div>
        ))}
        
        {/* Status Dropdown */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ffaa00] font-bold">{'>'}</span>
          <select
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
            className="w-full bg-[#12121a] text-[#ffaa00] border border-[#2a2a3a] pl-10 pr-4 py-3 text-sm outline-none focus:border-[#ffaa00] focus:shadow-[0_0_10px_rgba(255,170,0,0.3)] transition-all cursor-pointer appearance-none"
            style={{ clipPath: "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)" }}
          >
            <option value="Scheduled" className="bg-[#0a0a0f] text-[#ffaa00]">Scheduled</option>
            <option value="Completed" className="bg-[#0a0a0f] text-[#00ff88]">Completed</option>
            <option value="Cancelled" className="bg-[#0a0a0f] text-[#ff3366]">Cancelled</option>
          </select>
        </div>
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={onSave}
          className="px-8 py-3 text-xs font-bold uppercase tracking-widest text-[#0a0a0f] bg-[#00d4ff] hover:brightness-110 hover:shadow-[0_0_15px_rgba(0,212,255,0.6)] transition-all"
          style={{ clipPath: "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)" }}
        >
          {saveLabel}
        </button>
        <button
          onClick={onCancel}
          className="px-8 py-3 text-xs font-bold uppercase tracking-widest text-[#6b7280] bg-transparent border border-[#2a2a3a] hover:text-[#e0e0e0] hover:border-[#6b7280] transition-all"
          style={{ clipPath: "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Status Badge Component ───────────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    Completed: { text: "#00ff88", border: "#00ff88", glow: "rgba(0,255,136,0.2)" },
    Cancelled: { text: "#ff3366", border: "#ff3366", glow: "rgba(255,51,102,0.2)" },
    Scheduled: { text: "#ffaa00", border: "#ffaa00", glow: "rgba(255,170,0,0.2)" },
  };
  const theme = styles[status] || styles.Scheduled;
  
  return (
    <span 
      className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest flex inline-flex items-center gap-2" 
      style={{ 
        color: theme.text, 
        border: `1px solid ${theme.border}50`,
        background: `${theme.text}10`,
        boxShadow: `0 0 10px ${theme.glow}`,
        clipPath: "polygon(0 4px, 4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)"
      }}
    >
      <span className="w-1.5 h-1.5 bg-current" style={{ boxShadow: `0 0 5px ${theme.text}` }}></span>
      {status}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CompanyRecords() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [companyName, setCompanyName] = useState(location.state?.companyName || "");

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

  const [records, setRecords] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  
  const [form, setForm] = useState({ airport: "", destination: "", modelno: "", distance: "", fuelConsumed: "", status: "Scheduled" });
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  
  const user = JSON.parse(sessionStorage.getItem("user"));
  const isAdmin = user?.type === "admin";

  useEffect(() => {
    fetchRecords();
    setTimeout(() => setVisible(true), 100);
  }, []);

  const fetchRecords = () => {
    fetch(`https://aeronexus-backend-production.up.railway.app/companies/${id}/flights`)
      .then(r => r.json())
      .then(data => {
        setRecords(data);
      })
      .catch(() => setRecords([]));
  };

  const resetForm = () => setForm({ airport: "", destination: "", modelno: "", distance: "", fuelConsumed: "", status: "Scheduled" });

  const handleAdd = async () => {
    const body = `airport=${encodeURIComponent(form.airport)}&destination=${encodeURIComponent(form.destination)}&modelno=${encodeURIComponent(form.modelno)}&distance=${form.distance}&fuelConsumed=${form.fuelConsumed}&status=${encodeURIComponent(form.status)}`;
    
    const res = await fetch(`https://aeronexus-backend-production.up.railway.app/companies/${id}/flights`, { 
      method: "POST", 
      headers: { "Content-Type": "application/x-www-form-urlencoded" }, 
      body 
    });
    
    const data = await res.json();
    if (data.success) { 
      setMessage("Record added!"); 
      setShowAdd(false); 
      resetForm(); 
      fetchRecords(); 
      setTimeout(() => setMessage(""), 2000); 
    }
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setForm({ 
      airport: records[index].airport || "", 
      destination: records[index].destination || "", 
      modelno: records[index].modelno || "", 
      distance: records[index].distance || "", 
      fuelConsumed: records[index].fuelConsumed || "", 
      status: records[index].status || "Scheduled" 
    });
    setShowAdd(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleUpdate = async () => {
    const body = `airport=${encodeURIComponent(form.airport)}&destination=${encodeURIComponent(form.destination)}&modelno=${encodeURIComponent(form.modelno)}&distance=${form.distance}&fuelConsumed=${form.fuelConsumed}&status=${encodeURIComponent(form.status)}`;
    
    const res = await fetch(`https://aeronexus-backend-production.up.railway.app/companies/${id}/flights/${editIndex}`, { 
      method: "PUT", 
      headers: { "Content-Type": "application/x-www-form-urlencoded" }, 
      body 
    });
    
    const data = await res.json();
    if (data.success) { 
      setMessage("Flight status updated!"); 
      setEditIndex(null); 
      resetForm(); 
      fetchRecords(); 
      setTimeout(() => setMessage(""), 2000); 
    }
  };

  const handleDelete = async (index) => {
    if (!window.confirm("Delete this flight record entirely?")) return;
    
    await fetch(`https://aeronexus-backend-production.up.railway.app/companies/${id}/flights/${index}`, { 
      method: "DELETE" 
    });
    fetchRecords();
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
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
        >
          <div className="h-1 w-full bg-gradient-to-r from-[#ff00ff] via-[#00d4ff] to-[#00ff88]"></div>

          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            
            {/* Interactive Logo Area for the Navbar */}
            <div 
              className="flex items-center gap-4 cursor-pointer group"
              onClick={() => navigate("/dashboard")}
            >
              <div className="w-10 h-10 border border-[#00ff88] p-1 shadow-[0_0_10px_rgba(0,255,136,0.2)] relative transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(0,255,136,0.6)] group-hover:border-[#00ff88] group-hover:scale-105"
                   style={{ clipPath: "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)" }}>
                <img src="/logo.png" alt="AeroNexus" className="w-full h-full object-contain filter drop-shadow-[0_0_5px_#00ff88]" />
              </div>
              <div>
                <p className="font-black text-[#e0e0e0] text-xl uppercase tracking-widest leading-none cyber-glitch transition-colors duration-300 group-hover:text-[#00ff88]" style={{ fontFamily: '"Orbitron", "Share Tech Mono", monospace' }}>
                  Aero<span className="text-[#00ff88]">Nexus</span>
                </p>
                <p className="text-[9px] mt-1 text-[#00ff88] tracking-[0.3em] uppercase flex items-center gap-2">
                  CONNECT · INNOVATE · ELEVATE
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate("/dashboard")} 
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#00d4ff] border border-[#00d4ff]/50 hover:bg-[#00d4ff] hover:text-[#0a0a0f] hover:shadow-[0_0_15px_rgba(0,212,255,0.6)] transition-all"
                style={{ clipPath: "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)" }}
              >
                ← Dashboard
              </button>

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
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
          
          {/* Header */}
          <div className="mb-12 border-l-4 border-[#00d4ff] pl-6 relative" style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(10px)", transition: "all 0.5s ease" }}>
            <div className="absolute -left-[6px] top-0 w-2 h-2 bg-[#00d4ff] shadow-[0_0_10px_#00d4ff]"></div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#00d4ff] mb-2">{companyName}</p>
            <h1 className="text-3xl font-bold text-[#e0e0e0] mb-2 font-sans tracking-tight">
              Flight Records Manager
            </h1>
            <p className="text-[#6b7280] text-sm flex items-center gap-2">
              <span className="text-[#00d4ff] font-bold">{'>'}</span> Update statuses and log fuel consumption for all flights
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Total Flights", value: records.length, color: "#00d4ff" },
              { label: "Scheduled", value: records.filter(r => r.status === "Scheduled").length, color: "#ffaa00" },
              { label: "Completed", value: records.filter(r => r.status === "Completed").length, color: "#00ff88" },
              { label: "Cancelled", value: records.filter(r => r.status === "Cancelled").length, color: "#ff3366" },
            ].map((s, i) => (
              <div 
                key={i} 
                className="relative overflow-hidden p-6 transition-all duration-300 font-mono group"
                style={{ 
                  background: "#12121a", 
                  border: `1px solid ${s.color}40`,
                  clipPath: "polygon(0 15px, 15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)",
                  opacity: visible ? 1 : 0, 
                  transform: visible ? "translateY(0)" : "translateY(15px)", 
                  transition: `all 0.5s ease ${i * 0.1}s` 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = s.color;
                  e.currentTarget.style.boxShadow = `inset 0 0 20px ${s.color}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${s.color}40`;
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 opacity-20" style={{ background: `radial-gradient(circle at top right, ${s.color}, transparent 70%)` }}></div>
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l" style={{ borderColor: s.color }}></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r" style={{ borderColor: s.color }}></div>
                
                <p className="text-4xl font-black mb-2 tabular-nums" style={{ color: "#e0e0e0", textShadow: `0 0 10px ${s.color}40` }}>{s.value}</p>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-current shadow-md" style={{ color: s.color, boxShadow: `0 0 8px ${s.color}` }}></span>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7280]">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Table Container */}
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
                  <span className="text-[#00d4ff]">{'>'}</span> Flight Logs
                </h2>
                <p className="text-xs mt-1 text-[#6b7280]">
                  {records.length} total entries
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
                    onClick={() => { setShowAdd(!showAdd); setEditIndex(null); resetForm(); }} 
                    className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-[#0a0a0f] bg-[#00d4ff] hover:brightness-110 hover:shadow-[0_0_15px_rgba(0,212,255,0.6)] transition-all"
                    style={{ clipPath: "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)" }}
                  >
                    {showAdd ? "✕ Cancel" : "+ Add Manual Record"}
                  </button>
                )}
              </div>
            </div>

            <div className="px-6 pt-6 bg-[#0a0a0f]">
              {showAdd && <FormPanel form={form} setForm={setForm} onSave={handleAdd} onCancel={() => { setShowAdd(false); resetForm(); }} saveLabel="Save Record" />}
              {editIndex !== null && <FormPanel form={form} setForm={setForm} onSave={handleUpdate} onCancel={() => { setEditIndex(null); resetForm(); }} saveLabel="Update Record" />}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0a0a0f]">
                    {["From", "To", "Model", "Distance", "Fuel", "Status", isAdmin && "Actions"].filter(Boolean).map((h, i) => (
                      <th key={i} className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#6b7280] border-b border-[#2a2a3a]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr
                      key={i}
                      className="font-mono text-sm transition-all duration-200 group"
                      style={{ 
                        borderBottom: "1px solid #2a2a3a", 
                        background: "#0a0a0f",
                        opacity: visible ? 1 : 0, 
                        transform: visible ? "translateX(0)" : "translateX(-10px)", 
                        transition: `all 0.4s ease ${i * 0.05 + 0.1}s` 
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
                      <td className="px-6 py-4 text-[#e0e0e0] font-bold">{r.airport}</td>
                      <td className="px-6 py-4 text-[#e0e0e0] font-bold group-hover:text-[#00d4ff] transition-colors">{r.destination}</td>
                      <td className="px-6 py-4 text-[#6b7280]">{r.modelno}</td>
                      <td className="px-6 py-4 text-[#6b7280]">{r.distance} km</td>
                      <td className="px-6 py-4 text-[#e0e0e0]">
                        {r.fuelConsumed ? `${r.fuelConsumed} L` : <span className="text-[#2a2a3a]">_ _ _</span>}
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={r.status || "Scheduled"} /></td>
                      
                      {isAdmin && (
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEdit(i)} 
                              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-150 text-[#ffaa00] border border-[#ffaa00]/50 hover:bg-[#ffaa00] hover:text-[#0a0a0f] hover:shadow-[0_0_10px_rgba(255,170,0,0.8)]"
                              style={{ clipPath: "polygon(0 4px, 4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)" }}
                            >
                              EDIT
                            </button>
                            <button 
                              onClick={() => handleDelete(i)} 
                              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-150 text-[#ff3366] border border-[#ff3366]/50 hover:bg-[#ff3366] hover:text-[#0a0a0f] hover:shadow-[0_0_10px_rgba(255,51,102,0.8)]"
                              style={{ clipPath: "polygon(0 4px, 4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%)" }}
                            >
                              DELETE
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-20 text-center border-b border-[#2a2a3a]">
                        <p className="text-[#6b7280] text-sm">No flights found for <span className="text-[#e0e0e0] font-bold">{companyName}</span>. Check the Flights page to schedule some.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}