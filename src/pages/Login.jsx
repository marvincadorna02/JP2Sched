import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import logo from "../assets/logo.png";
import schoolBg from "../assets/school-bg.jpg";
import { setSession } from "../utils/api.js";
import FoldText from "../components/FoldText";
import AnimatedContent from "../components/AnimatedContent";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.message || "Incorrect email or password.");
        setLoading(false);
        return;
      }

      setSession(data.token, data.user);
      navigate("/dashboard");
    } catch {
      setError("Couldn't reach the server. Is the backend running?");
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-navy flex items-center justify-center px-6 overflow-hidden">
      <img
        src={schoolBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      />
      <div className="absolute inset-0 bg-navy/85" />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(600px circle at 50% 0%, rgba(22,74,156,0.5), transparent 60%)",
        }}
      />

      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-sm font-medium text-mist/70 hover:text-paper transition-colors"
      >
        <ArrowLeft size={16} />
        Back to home
      </Link>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-10">
          <AnimatedContent distance={20} duration={0.7}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden shadow-xl bg-paper">
              <img src={logo} alt="JP2Sched" className="w-full h-full object-cover" />
            </div>
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-gold mb-2">
              Welcome back
            </span>
          </AnimatedContent>

          <h1 className="font-display text-paper">
            <FoldText
              text="JP2Sched"
              splitBy="char"
              hinge="top"
              fontSize="1.875rem"
              fontWeight={600}
              color="currentColor"
              duration={0.6}
              stagger={0.05}
            />
          </h1>

          <AnimatedContent distance={16} delay={0.45}>
            <p className="text-mist/70 text-sm mt-1">Keep every subject in its place.</p>
          </AnimatedContent>
        </div>

        <AnimatedContent distance={30} duration={0.8} delay={0.35}>
          <form onSubmit={handleSubmit} className="bg-paper rounded-2xl shadow-card p-7 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy/40" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.edu"
                  className="w-full rounded-lg border border-mist bg-mist/40 pl-10 pr-3.5 py-2.5 text-navy placeholder:text-navy/40 focus:bg-paper focus:border-royal outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-navy mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy/40" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-mist bg-mist/40 pl-10 pr-10 py-2.5 text-navy placeholder:text-navy/40 focus:bg-paper focus:border-royal outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy/40 hover:text-navy"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gold text-navy font-semibold py-2.5 hover:bg-gold/90 active:bg-gold/80 transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <p className="text-center text-sm text-navy/50">
              Don't have an account?{" "}
              <Link to="/register" className="text-royal font-medium">
                Create one
              </Link>
            </p>
          </form>
        </AnimatedContent>
      </div>
    </div>
  );
}