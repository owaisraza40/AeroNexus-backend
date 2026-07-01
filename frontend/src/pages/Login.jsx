import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!username || !password) { setError("ERR: Missing credentials"); return; }
    setLoading(true);
    const endpoint = isSignup ? "/signup" : "/login";
    const body = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" , "Authorization": "Bearer " + (JSON.parse(sessionStorage.getItem("user"))?.token || "") },
        body: body,
      });
      const data = JSON.parse(await res.text());
      if (data.success) {
        sessionStorage.setItem("user", JSON.stringify({ username: data.username, type: data.type, token: data.token }));
        window.location.href = "/dashboard";
      } else {
        setError(`ERR: ${data.message}`);
      }
    } catch {
      setError("CRITICAL: Connection to mainframe failed.");
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes rgbShift {
          0%, 100% { text-shadow: -2px 0 #ff00ff, 2px 0 #00d4ff; }
          50% { text-shadow: 2px 0 #ff00ff, -2px 0 #00d4ff; }
        }
        .cyber-glitch { animation: rgbShift 3s infinite alternate; }
        .cursor-blink { animation: blink 1s step-end infinite; }
        .cyber-scanlines::after {
          content: "";
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.3) 2px, rgba(0, 0, 0, 0.3) 4px);
          pointer-events: none;
          z-index: 50;
        }
        .cyber-grid {
          background-image: 
            linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>

      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0f] text-[#e0e0e0] font-mono cyber-scanlines cyber-grid">
        
        {/* Glow Orbs for Void Depth */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00ff88] rounded-full opacity-[0.03] blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#ff00ff] rounded-full opacity-[0.03] blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-md px-4 sm:px-6 py-12">
          
          {/* Header Area */}
          <div className="text-center mb-10 flex flex-col items-center">
            <div 
              className="w-20 h-20 mb-6 bg-[#12121a] border border-[#2a2a3a] flex items-center justify-center p-3 relative shadow-[0_0_15px_rgba(0,255,136,0.1)]"
              style={{ clipPath: "polygon(0 10px, 10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)" }}
            >
              {/* Corner tech accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00ff88]"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00ff88]"></div>
              
              <img src="/logo.png" alt="AeroNexus" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]" />
            </div>
            
            <h1 className="text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-[#e0e0e0] to-[#6b7280] cyber-glitch drop-shadow-[0_0_10px_rgba(0,255,136,0.3)] mb-2" style={{ fontFamily: '"Orbitron", "Share Tech Mono", monospace' }}>
              Aero<br/>Nexus
            </h1>
            
            <div className="flex items-center gap-2 text-[#00ff88] text-xs uppercase tracking-[0.2em] mt-2">
              <span className="w-8 h-[1px] bg-[#00ff88] shadow-[0_0_5px_#00ff88]"></span>
              SYSTEM TERMINAL
              <span className="w-8 h-[1px] bg-[#00ff88] shadow-[0_0_5px_#00ff88]"></span>
            </div>
          </div>

          {/* Main Terminal Card */}
          <div 
            className="bg-[#12121a]/90 backdrop-blur-sm border border-[#2a2a3a] p-1 relative transition-all duration-300 hover:border-[#00ff88]/50 hover:shadow-[0_0_15px_rgba(0,255,136,0.1)] group"
            style={{ clipPath: "polygon(0 15px, 15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)" }}
          >
            {/* Inner frame */}
            <div className="bg-[#0a0a0f] p-6 sm:p-8 h-full relative" style={{ clipPath: "polygon(0 14px, 14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)" }}>
              
              <div className="flex justify-between items-center mb-8 border-b border-[#2a2a3a] pb-4">
                <h2 className="text-xl font-bold text-[#e0e0e0] uppercase tracking-wider flex items-center gap-2">
                  <span className="text-[#00ff88]">{'>'}</span>
                  {isSignup ? "INIT_REGISTRATION" : "AUTH_REQUIRED"}
                  <span className="w-2 h-5 bg-[#00ff88] cursor-blink inline-block ml-1"></span>
                </h2>
              </div>

              {error && (
                <div 
                  className="mb-6 px-4 py-3 bg-[#ff3366]/10 border border-[#ff3366] text-[#ff3366] text-xs font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(255,51,102,0.2)]"
                  style={{ clipPath: "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)" }}
                >
                  {error}
                </div>
              )}

              <div className="mb-5 relative">
                <label className="text-[#6b7280] text-[10px] font-bold mb-1 block uppercase tracking-[0.2em]">
                  Identify
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00ff88] font-bold text-sm">{'>'}</span>
                  <input
                    className="w-full bg-[#12121a] text-[#00ff88] border border-[#2a2a3a] pl-8 pr-4 py-3 text-sm outline-none focus:border-[#00ff88] focus:shadow-[0_0_10px_rgba(0,255,136,0.3)] transition-all duration-200 placeholder:text-[#6b7280]/50"
                    style={{ clipPath: "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)" }}
                    placeholder="ENTER_USERNAME"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  />
                </div>
              </div>

              <div className="mb-8 relative">
                <label className="text-[#6b7280] text-[10px] font-bold mb-1 block uppercase tracking-[0.2em]">
                  Security Key
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00ff88] font-bold text-sm">{'>'}</span>
                  <input
                    type="password"
                    className="w-full bg-[#12121a] text-[#00ff88] border border-[#2a2a3a] pl-8 pr-4 py-3 text-sm outline-none focus:border-[#00ff88] focus:shadow-[0_0_10px_rgba(0,255,136,0.3)] transition-all duration-200 placeholder:text-[#6b7280]/50"
                    style={{ clipPath: "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)" }}
                    placeholder="ENTER_PASSWORD"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[#00ff88] text-[#0a0a0f] py-4 font-black uppercase text-sm tracking-[0.2em] transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_15px_#00ff88,0_0_30px_rgba(0,255,136,0.4)] disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                style={{ clipPath: "polygon(0 10px, 10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)" }}
              >
                <span className="relative z-10">{loading ? "PROCESSING_DATA..." : isSignup ? "EXECUTE_REGISTRATION" : "ESTABLISH_CONNECTION"}</span>
              </button>

              <div className="mt-8 flex flex-col items-center border-t border-[#2a2a3a] pt-6 relative">
                <p className="text-[#6b7280] text-[10px] uppercase tracking-[0.2em] mb-4">
                  {isSignup ? "Existing Node Found?" : "Need network access?"}
                </p>
                
                <button
                  className="bg-transparent text-[#ff00ff] border border-[#ff00ff] px-6 py-2 font-bold uppercase text-xs tracking-widest transition-all duration-200 hover:bg-[#ff00ff] hover:text-[#0a0a0f] hover:shadow-[0_0_10px_#ff00ff,0_0_20px_rgba(255,0,255,0.4)]"
                  style={{ clipPath: "polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%)" }}
                  onClick={() => { setIsSignup(!isSignup); setError(""); }}
                >
                  {isSignup ? "SWITCH_TO_LOGIN" : "CREATE_NODE"}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-[#6b7280] text-[10px] uppercase tracking-[0.3em] flex justify-center items-center gap-2">
            <span>SECURE_CONNECTION</span>
            <span className="w-1 h-1 bg-[#00ff88] rounded-full shadow-[0_0_5px_#00ff88] cursor-blink"></span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;