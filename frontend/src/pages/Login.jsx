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
    if (!username || !password) { setError("Please enter username and password"); return; }
    setLoading(true);
    const endpoint = isSignup ? "/signup" : "/login";
    const body = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
    try {
      const res = await fetch(`https://aeronexus-backend-production.up.railway.app${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body,
      });
      const data = JSON.parse(await res.text());
      if (data.success) {
        sessionStorage.setItem("user", JSON.stringify({ username: data.username, type: data.type }));
        window.location.href = "/dashboard";
      } else {
        setError(data.message);
      }
    } catch {
      setError("Cannot connect to server. Make sure the backend is running.");
    }
    setLoading(false);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#F0F0F0] font-['Outfit',sans-serif]" 
      style={{ 
        backgroundImage: "radial-gradient(#fff 2px, transparent 2px)", 
        backgroundSize: "20px 20px" 
      }}
    >
      {/* Bauhaus Geometric Background Overlays (Static) */}
      <div className="absolute -top-10 -left-10 w-64 h-64 bg-[#1040C0] rounded-full opacity-10 border-4 border-[#121212]"></div>
      <div className="absolute top-1/4 right-10 w-32 h-32 bg-[#F0C020] rounded-none rotate-45 opacity-20 border-4 border-[#121212]"></div>
      <div 
        className="absolute bottom-0 left-1/4 w-48 h-48 bg-[#D02020] opacity-10" 
        style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
      ></div>

      <div className="relative z-10 w-full max-w-md px-4 sm:px-6 py-12">
        {/* Header / Logo Area */}
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="w-24 h-24 mb-4 border-4 border-[#121212] bg-[#1040C0] shadow-[6px_6px_0px_0px_#121212] rounded-none flex items-center justify-center p-2 hover:-translate-y-1 transition-transform duration-200 ease-out">
            <img 
              src="/logo.png" 
              alt="AeroNexus" 
              className="w-full h-full object-contain grayscale hover:grayscale-0 transition-all duration-200" 
            />
          </div>
          <h1 className="text-5xl font-black text-[#121212] uppercase tracking-tighter leading-[0.9]">
            Aero<br/>Nexus
          </h1>
          <div className="mt-4 border-b-4 border-[#121212] pb-2">
            <p className="text-[#121212] text-xs tracking-widest uppercase font-bold">
              Connect • Innovate • Elevate
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] rounded-none p-6 sm:p-8 relative hover:-translate-y-1 transition-transform duration-200 ease-out">
          
          {/* Card Corner Decoration */}
          <div className="absolute top-0 right-0 w-6 h-6 bg-[#D02020] rounded-full border-l-4 border-b-4 border-[#121212] translate-x-1 -translate-y-1"></div>

          <h2 className="text-3xl font-black text-[#121212] uppercase tracking-tighter mb-1">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-[#121212] font-medium text-sm mb-6 pb-4 border-b-4 border-[#121212]">
            {isSignup ? "Join the construct today" : "Access your terminal"}
          </p>

          {error && (
            <div className="mb-6 px-4 py-3 bg-[#D02020] text-white border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212] rounded-none text-xs font-bold uppercase tracking-wider">
              {error}
            </div>
          )}

          <div className="mb-5">
            <label className="text-[#121212] text-xs font-bold mb-2 block uppercase tracking-widest">
              Username
            </label>
            <input
              className="w-full bg-[#F0F0F0] text-[#121212] rounded-none border-2 border-[#121212] px-4 py-3 font-medium outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_#121212] focus:-translate-y-[2px] focus:-translate-x-[2px] transition-all duration-200 ease-out"
              placeholder="ENTER USERNAME"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <div className="mb-8">
            <label className="text-[#121212] text-xs font-bold mb-2 block uppercase tracking-widest">
              Password
            </label>
            <input
              type="password"
              className="w-full bg-[#F0F0F0] text-[#121212] rounded-none border-2 border-[#121212] px-4 py-3 font-medium outline-none focus:bg-white focus:shadow-[4px_4px_0px_0px_#121212] focus:-translate-y-[2px] focus:-translate-x-[2px] transition-all duration-200 ease-out"
              placeholder="ENTER PASSWORD"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#1040C0] text-white border-2 md:border-4 border-[#121212] shadow-[4px_4px_0px_0px_#121212] rounded-none py-4 font-black uppercase text-xl tracking-widest active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-200 ease-out disabled:opacity-50"
          >
            {loading ? "PROCESSING..." : isSignup ? "REGISTER" : "SIGN IN"}
          </button>

          <div className="mt-8 flex flex-col items-center">
            <div className="w-full border-t-4 border-[#121212] mb-6 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[#121212] text-xs font-bold uppercase tracking-widest">
                OR
              </div>
            </div>
            
            <p className="text-[#121212] font-bold text-sm uppercase mb-3">
              {isSignup ? "Already registered?" : "Need an access code?"}
            </p>
            
            <button
              className="bg-[#F0C020] text-[#121212] border-2 border-[#121212] px-8 py-2 font-black uppercase text-sm shadow-[4px_4px_0px_0px_#121212] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-200 ease-out"
              onClick={() => { setIsSignup(!isSignup); setError(""); }}
            >
              {isSignup ? "LOG IN INSTEAD" : "CREATE ACCOUNT"}
            </button>
          </div>
        </div>

        <p className="text-center text-[#121212] font-bold text-xs mt-8 uppercase tracking-widest">
          © 2026 AeroNexus
        </p>
      </div>
    </div>
  );
}

export default Login;