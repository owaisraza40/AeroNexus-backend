import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.7 + 0.3,
    }));

    const planes = Array.from({ length: 3 }, (_, i) => ({
      x: -100,
      y: 80 + i * 200,
      speed: 0.4 + i * 0.15,
      size: 10 + i * 4,
      trail: [],
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(59,130,246,0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 60) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 60) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147,197,253,${p.opacity})`;
        ctx.fill();
      });

      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(59,130,246,${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      planes.forEach(plane => {
        plane.x += plane.speed;
        if (plane.x > canvas.width + 100) { plane.x = -100; plane.trail = []; }
        plane.trail.push({ x: plane.x, y: plane.y });
        if (plane.trail.length > 60) plane.trail.shift();

        plane.trail.forEach((t, i) => {
          const alpha = (i / plane.trail.length) * 0.4;
          ctx.beginPath();
          ctx.arc(t.x, t.y, 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(96,165,250,${alpha})`;
          ctx.fill();
        });

        ctx.save();
        ctx.translate(plane.x, plane.y);
        ctx.fillStyle = "rgba(147,197,253,0.6)";
        ctx.font = `${plane.size}px serif`;
        ctx.fillText("✈", 0, 0);
        ctx.restore();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", handleResize); };
  }, []);

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #060d1f 0%, #0a1628 50%, #060d1f 100%)" }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full blur-2xl opacity-30" style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }}></div>
            <img src="/logo.png" alt="AeroNexus" className="relative w-28 h-28 mx-auto drop-shadow-2xl" />
          </div>
          <p className="text-blue-400 text-xs tracking-widest uppercase mt-3 font-medium">Connect • Innovate • Elevate</p>
        </div>

        <div className="rounded-2xl p-8 shadow-2xl" style={{ background: "rgba(6,13,31,0.8)", backdropFilter: "blur(24px)", border: "1px solid rgba(59,130,246,0.15)" }}>
          <h2 className="text-2xl font-bold text-white text-center mb-1">{isSignup ? "Create Account" : "Welcome Back"}</h2>
          <p className="text-gray-500 text-center text-sm mb-6">{isSignup ? "Join AeroNexus today" : "Sign in to your account"}</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg text-red-400 text-sm text-center" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="text-gray-400 text-xs mb-2 block uppercase tracking-wider">Username</label>
            <input
              className="w-full text-white rounded-xl px-4 py-3 outline-none transition-all duration-200 text-sm"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(59,130,246,0.2)" }}
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <div className="mb-6">
            <label className="text-gray-400 text-xs mb-2 block uppercase tracking-wider">Password</label>
            <input
              type="password"
              className="w-full text-white rounded-xl px-4 py-3 outline-none transition-all duration-200 text-sm"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(59,130,246,0.2)" }}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full text-white font-bold py-3 rounded-xl transition-all duration-200 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] text-sm tracking-wide"
            style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)", boxShadow: "0 0 20px rgba(59,130,246,0.3)" }}
          >
            {loading ? "Authenticating..." : isSignup ? "Create Account" : "Sign In"}
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "rgba(59,130,246,0.15)" }}></div>
            <span className="text-gray-600 text-xs">or</span>
            <div className="flex-1 h-px" style={{ background: "rgba(59,130,246,0.15)" }}></div>
          </div>

          <p className="text-gray-500 text-center text-sm">
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <span
              className="text-blue-400 cursor-pointer ml-1 hover:text-blue-300 transition-colors font-medium"
              onClick={() => { setIsSignup(!isSignup); setError(""); }}
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </span>
          </p>
        </div>

        <p className="text-center text-gray-700 text-xs mt-6">© 2026 AeroNexus. All rights reserved.</p>
      </div>
    </div>
  );
}

export default Login;