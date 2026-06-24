import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#05101f", color: "white" }}>
      <div className="text-center">
        <div className="mb-6">
          <img src="/logo.png" alt="AeroNexus" className="w-20 h-20 mx-auto mb-6 opacity-50" />
          <p className="text-8xl font-bold mb-2" style={{ color: "rgba(77,142,240,0.3)" }}>404</p>
          <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>This route doesn't exist in our flight plan.</p>
        </div>
        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg, #1a4db5, #4d8ef0)" }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}