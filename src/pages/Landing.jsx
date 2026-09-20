import { Link } from "react-router-dom";
import { CalendarDays, BellRing, ScanLine, ArrowRight, CheckCircle2 } from "lucide-react";
import logo from "../assets/logo.png";
import schoolBg from "../assets/school-bg.jpg";
import FoldText from "../components/FoldText";
import AnimatedContent from "../components/AnimatedContent";
import SpotlightCard from "../components/SpotlightCard";
import Magnet from "../components/Magnet";
import CountUp from "../components/CountUp";

const FEATURES = [
  {
    icon: CalendarDays,
    title: "One weekly view",
    body: "Classes, OJT blocks, and consultations laid out by day and hour — no more cross-checking three group chats.",
  },
  {
    icon: BellRing,
    title: "Never miss a slot",
    body: "See what's next at a glance, from the dashboard, the moment you open it.",
  },
  {
    icon: ScanLine,
    title: "Scan, don't type",
    body: "Photograph your ERC and let AI lay out the whole term for you in seconds.",
  },
];

const MOCK_ROWS = [
  { name: "Data Structures", meta: "Mon · 8:00AM · IT-204", color: "bg-royal" },
  { name: "Web Systems & Tech", meta: "Tue · 10:00AM · IT-301", color: "bg-gold" },
  { name: "Software Engineering", meta: "Mon · 1:00PM · IT-108", color: "bg-navy" },
  { name: "OJT / Practicum", meta: "Fri · 1:00PM · Remote", color: "bg-royal" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper text-navy">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-navy/95 backdrop-blur border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-paper">
              <img src={logo} alt="JP2Sched" className="w-full h-full object-cover" />
            </div>
            <span className="font-display text-lg font-semibold text-paper">JP2Sched</span>
          </button>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-mist/70">
            <a href="#features" className="hover:text-paper transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-paper transition-colors">How it works</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="text-sm font-semibold px-4 py-2 rounded-lg bg-gold text-navy hover:bg-gold/90 transition-colors"
            >
              Open app
            </Link>
          </div>
        </div>
      </header>

      {/* Hero — centered, logo front and center */}
      <section className="relative bg-navy text-paper overflow-hidden">
        <img
          src={schoolBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-navy/85" />
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(600px circle at 50% 0%, rgba(22,74,156,0.5), transparent 60%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-6 text-center pt-20 pb-24 md:pt-28 md:pb-32">
          <AnimatedContent distance={30} duration={0.7}>
            <div className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-8 rounded-full overflow-hidden shadow-xl bg-paper">
              <img src={logo} alt="JP2Sched" className="w-full h-full object-cover" />
            </div>
          </AnimatedContent>

          <AnimatedContent distance={20} delay={0.15} className="mb-4">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-gold">
              Built for students, by a student
            </span>
          </AnimatedContent>

          <h1 className="font-display leading-tight mb-5">
            <span className="block">
              <FoldText
                text="Your whole term,"
                splitBy="word"
                hinge="top"
                fontSize="clamp(2.25rem, 6vw, 3.75rem)"
                fontWeight={600}
                color="currentColor"
                duration={0.7}
                stagger={0.12}
              />
            </span>
            <span className="block text-gold">
              <FoldText
                text="one schedule."
                splitBy="word"
                hinge="top"
                fontSize="clamp(2.25rem, 6vw, 3.75rem)"
                fontWeight={600}
                color="currentColor"
                duration={0.7}
                stagger={0.12}
              />
            </span>
          </h1>

          <AnimatedContent distance={30} delay={0.6}>
            <p className="text-mist/80 text-base md:text-lg max-w-xl mx-auto mb-10">
              JP2Sched keeps every subject, room, and time slot in a single weekly
              view — built for students juggling classes, OJT, and consultations.
            </p>
          </AnimatedContent>

          <AnimatedContent distance={30} delay={0.8}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Magnet
                padding={60}
                magnetStrength={3}
                wrapperClassName="w-full sm:w-auto"
                innerClassName="w-full sm:w-auto"
              >
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gold text-navy font-semibold px-7 py-3.5 rounded-lg hover:bg-gold/90 transition-colors"
                >
                  Get started
                  <ArrowRight size={17} />
                </Link>
              </Magnet>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto text-center border border-mist/30 text-paper font-semibold px-7 py-3.5 rounded-lg hover:bg-royal/30 transition-colors"
              >
                See how it works
              </a>
            </div>
          </AnimatedContent>

          <AnimatedContent distance={20} delay={1}>
            <p className="text-mist/50 text-sm mt-6">
              No account needed — your schedule saves right on this device.
            </p>
          </AnimatedContent>
        </div>
      </section>

      {/* Split section: copy + schedule preview mockup */}
      <section id="how-it-works" className="scroll-mt-20 px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <AnimatedContent distance={60} duration={0.9}>
            <span className="text-xs font-semibold tracking-widest uppercase text-royal">
              Discover JP2Sched
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mt-3 mb-5 leading-tight">
              A schedule that organizes itself
            </h2>
            <p className="text-navy/60 leading-relaxed mb-4">
              Most students juggle their term across a notebook, three group chats,
              and a screenshot of their ERC. JP2Sched replaces all of that with one
              weekly view that updates the moment your schedule changes.
            </p>
            <p className="text-navy/60 leading-relaxed mb-8">
              Add a subject by hand, or snap a photo of your enrollment card and
              let AI read it for you — either way, conflicts get flagged before
              they cost you a missed class.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="border-l-4 border-gold pl-4">
                <p className="font-display font-semibold text-navy">Built for the term</p>
                <p className="text-sm text-navy/50 mt-1">Archive last semester, start clean on the next.</p>
              </div>
              <div className="border-l-4 border-navy pl-4">
                <p className="font-display font-semibold text-navy">No double-booking</p>
                <p className="text-sm text-navy/50 mt-1">Conflicts get flagged the moment you add a class.</p>
              </div>
            </div>
          </AnimatedContent>

          {/* Schedule preview mockup */}
          <AnimatedContent distance={60} duration={0.9} delay={0.2} className="relative">
            <div className="bg-mist rounded-2xl shadow-card p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="font-display font-semibold text-navy text-sm">This week</p>
                <span className="text-xs bg-gold text-navy font-semibold px-2.5 py-1 rounded-full">
                  <CountUp to={MOCK_ROWS.length} duration={1.5} delay={0.6} /> subjects
                </span>
              </div>
              <div className="space-y-2">
                {MOCK_ROWS.map((row, i) => (
                  <AnimatedContent key={row.name} distance={24} duration={0.6} delay={0.4 + i * 0.12}>
                    <div className="flex items-center gap-3 bg-paper rounded-lg px-3.5 py-2.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${row.color}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-navy truncate">{row.name}</p>
                        <p className="text-xs text-navy/50">{row.meta}</p>
                      </div>
                    </div>
                  </AnimatedContent>
                ))}
              </div>
            </div>

            {/* Floating badge card */}
            <div className="absolute -bottom-6 -left-6 bg-paper rounded-xl shadow-card px-4 py-3.5 max-w-[220px] hidden sm:block">
              <div className="flex items-center gap-2 text-royal font-semibold text-sm mb-1">
                <CheckCircle2 size={16} />
                Scanned in seconds
              </div>
              <p className="text-xs text-navy/50 leading-relaxed">
                AI read this term's ERC and organized every subject automatically.
              </p>
            </div>
          </AnimatedContent>
        </div>
      </section>

      {/* Feature grid */}
      <section id="features" className="scroll-mt-20 bg-mist px-6 md:px-12 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <AnimatedContent distance={30}>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-center mb-12">
              Everything your week needs, nothing it doesn't
            </h2>
          </AnimatedContent>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, title, body }, i) => (
              <AnimatedContent key={title} distance={50} delay={i * 0.15} className="h-full">
                <SpotlightCard
                  spotlightColor="rgba(212, 175, 55, 0.25)"
                  className="h-full !bg-paper !border-transparent !rounded-2xl !p-6 shadow-card text-center md:text-left"
                >
                  <div className="w-11 h-11 rounded-full bg-navy flex items-center justify-center mb-4 mx-auto md:mx-0">
                    <Icon size={20} className="text-gold" strokeWidth={2} />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-1.5">{title}</h3>
                  <p className="text-navy/60 text-sm leading-relaxed">{body}</p>
                </SpotlightCard>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-navy text-paper px-6 md:px-12 py-16">
        <AnimatedContent distance={30}>
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <p className="font-display text-xl font-semibold">Ready to lay out your term?</p>
              <p className="text-mist/60 text-sm mt-1">Free to use — set up your first schedule in minutes.</p>
            </div>
            <Link
              to="/dashboard"
              className="bg-gold text-navy font-semibold px-6 py-3 rounded-lg hover:bg-gold/90 transition-colors text-sm shrink-0"
            >
              Get started
            </Link>
          </div>
        </AnimatedContent>
      </section>

      {/* Footer bar */}
      <footer className="bg-navy border-t border-white/10 px-6 md:px-12 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 bg-paper">
              <img src={logo} alt="JP2Sched" className="w-full h-full object-cover" />
            </div>
            <span className="text-mist/50 text-xs">
              © {new Date().getFullYear()} JP2Sched. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-5 text-xs text-mist/50">
            <a href="#features" className="hover:text-mist transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-mist transition-colors">How it works</a>
            <Link to="/dashboard" className="hover:text-mist transition-colors">Open app</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}