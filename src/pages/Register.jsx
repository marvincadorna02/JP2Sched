import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import logo from "../assets/logo.png";
import schoolBg from "../assets/school-bg.jpg";
import { setSession } from "../utils/api.js";
import FoldText from "../components/FoldText";
import AnimatedContent from "../components/AnimatedContent";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailTaken, setEmailTaken] = useState(false);
  const [showTakenModal, setShowTakenModal] = useState(false);
  const emailRef = useRef(null);
  const navigate = useNavigate();

  function closeTakenModal() {
    setShowTakenModal(false);
    emailRef.current?.focus();
    emailRef.current?.select();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.status === 409) {
        setEmailTaken(true);
        setShowTakenModal(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.message || "Registration failed. Please try again.");
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
    <div className="relative min-h-[100dvh] bg-navy flex items-center justify-center px-6 overflow-hidden pt-10 pb-4 sm:py-12">
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
        className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-1.5 text-sm font-medium text-mist/70 hover:text-paper transition-colors"
      >
        <ArrowLeft size={16} />
        Back to home
      </Link>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-3 sm:mb-10">
          <AnimatedContent distance={20} duration={0.7}>
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 rounded-full overflow-hidden shadow-xl bg-paper">
              <img src={logo} alt="JP2Sched" className="w-full h-full object-cover" />
            </div>
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-gold mb-2">
              Built for students, by a student
            </span>
          </AnimatedContent>

          <h1 className="font-display text-paper">
            <FoldText
              text="Create your account"
              splitBy="word"
              hinge="top"
              fontSize="clamp(1.5rem, 5vw, 1.875rem)"
              fontWeight={600}
              color="currentColor"
              duration={0.6}
              stagger={0.1}
            />
          </h1>

          <AnimatedContent distance={16} delay={0.45}>
            <p className="text-mist/70 text-sm mt-1">Set up your first schedule in minutes.</p>
          </AnimatedContent>
        </div>

        <AnimatedContent distance={30} duration={0.8} delay={0.35}>
          <form
            onSubmit={handleSubmit}
            className="bg-paper rounded-2xl shadow-card p-4 sm:p-7 space-y-3 sm:space-y-5"
          >
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-navy mb-1 sm:mb-1.5">
                Full name
              </label>
              <div className="relative">
                <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy/40" />
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dela Cruz, Juan P."
                  className="w-full rounded-lg border border-mist bg-mist/40 pl-10 pr-3.5 py-2 sm:py-2.5 text-navy placeholder:text-navy/40 focus:bg-paper focus:border-royal outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-navy mb-1 sm:mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy/40" />
                <input
                  id="email"
                  ref={emailRef}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailTaken) setEmailTaken(false);
                  }}
                  aria-invalid={emailTaken}
                  placeholder="you@school.edu"
                  className={`w-full rounded-lg border pl-10 pr-3.5 py-2 sm:py-2.5 text-navy placeholder:text-navy/40 outline-none transition-colors ${
                    emailTaken
                      ? "border-red-400 bg-red-50 focus:border-red-500"
                      : "border-mist bg-mist/40 focus:bg-paper focus:border-royal"
                  }`}
                />
              </div>
              {emailTaken && (
                <p className="text-xs text-red-600 mt-1">This email is already registered.</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-navy mb-1 sm:mb-1.5">
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
                  className="w-full rounded-lg border border-mist bg-mist/40 pl-10 pr-10 py-2 sm:py-2.5 text-navy placeholder:text-navy/40 focus:bg-paper focus:border-royal outline-none transition-colors"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-navy mb-1 sm:mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy/40" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-mist bg-mist/40 pl-10 pr-10 py-2 sm:py-2.5 text-navy placeholder:text-navy/40 focus:bg-paper focus:border-royal outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-navy/40 hover:text-navy"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gold text-navy font-semibold py-2 sm:py-2.5 hover:bg-gold/90 active:bg-gold/80 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>

            <p className="text-center text-sm text-navy/50">
              Already have an account?{" "}
              <Link to="/login" className="text-royal font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </AnimatedContent>
      </div>

      {showTakenModal && <EmailTakenModal email={email} onClose={closeTakenModal} />}
    </div>
  );
}

function EmailTakenModal({ email, onClose }) {
  const [shown, setShown] = useState(false);
  const primaryRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true));
    primaryRef.current?.focus();

    function onKey(e) {
      if (e.key === "Escape") onCloseRef.current();
    }
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-6 bg-navy/70 backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none ${
        shown ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-taken-title"
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm bg-paper rounded-2xl shadow-card p-6 text-center transition-all duration-200 motion-reduce:transition-none ${
          shown ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-3 scale-95"
        }`}
      >
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center">
          <Mail size={22} className="text-navy" />
        </div>
        <h2 id="email-taken-title" className="font-display text-xl font-semibold text-navy">
          Email already registered
        </h2>
        <p className="text-sm text-navy/60 mt-2">
          <span className="font-medium text-navy break-all">{email}</span> already has an account.
          Sign in, or use a different email to create a new one.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Link
            ref={primaryRef}
            to="/login"
            className="block w-full rounded-lg bg-gold text-navy font-semibold py-2.5 hover:bg-gold/90 active:bg-gold/80 transition-colors"
          >
            Sign in
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-mist text-navy font-semibold py-2.5 hover:bg-mist/40 transition-colors"
          >
            Use a different email
          </button>
        </div>
      </div>
    </div>
  );
}