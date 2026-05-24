// reset

import { useNavigate } from 'react-router-dom'
import {
  Mic, FileText, Brain, Users, BarChart3, Shield,
  CheckCircle, ArrowRight, Star, Zap, Lock,
  ChevronRight, Clock, TrendingUp, Heart,
  Stethoscope, Activity, Database, Cloud, Menu, X
} from 'lucide-react'
import { useState } from 'react'

/* ─── helpers ────────────────────────────────────────────── */
const GradText = ({ children }: { children: React.ReactNode }) => (
  <span style={{ background: 'linear-gradient(135deg,#0d9488 0%,#14b8a6 60%,#3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
    {children}
  </span>
)

const SectionBadge = ({ children, color = '#0d9488' }: { children: React.ReactNode; color?: string }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', background: `${color}18`, color, border: `1px solid ${color}30` }}>
    {children}
  </span>
)

/* ─── static data ────────────────────────────────────────── */
const FEATURES = [
  { icon: Mic,      title: 'Live Consultation Recording', desc: 'Real-time audio capture with high-fidelity Azure Speech transcription and specialised medical terminology support.', color: '#0d9488', bg: '#0d948818' },
  { icon: FileText, title: 'Automated SOAP Notes',        desc: 'GPT-4 powered intelligence transforms raw transcripts into structured, clinically accurate SOAP documentation instantly.', color: '#3b82f6', bg: '#3b82f618' },
  { icon: Brain,    title: 'AI Document Analysis',        desc: 'Upload PDFs, DOCX, or images for automated entity extraction, clinical review, and intelligent enhancement.', color: '#7c3aed', bg: '#7c3aed18' },
  { icon: Users,    title: 'Patient Management',          desc: 'Full-featured EHR with medical history, allergies, medications, and comprehensive visit tracking.', color: '#f59e0b', bg: '#f59e0b18' },
  { icon: BarChart3,title: 'Intelligent Analytics',       desc: 'Real-time KPIs and productivity trends to track time saved, consultation volumes, and clinical outcomes.', color: '#10b981', bg: '#10b98118' },
  { icon: Shield,   title: 'HIPAA & GDPR Compliant',      desc: 'Enterprise-grade security with AES-256 encryption, JWT auth, RBAC, and comprehensive audit trails.', color: '#f43f5e', bg: '#f43f5e18' },
]

const STATS = [
  { value: '70%',  label: 'Reduction in documentation time', icon: Clock },
  { value: '500+', label: 'Medical professionals trust us',   icon: Users },
  { value: '99.9%',label: 'Platform uptime SLA',             icon: Activity },
  { value: '10K+', label: 'Concurrent users supported',      icon: TrendingUp },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Record the Consultation',  desc: 'Start a session and let MediScribe capture the conversation in real-time with crystal-clear audio processing.', icon: Mic },
  { step: '02', title: 'AI Transcribes & Analyzes',desc: 'Azure Speech Services transcribes every word while GPT-4 understands clinical context and medical terminology.', icon: Brain },
  { step: '03', title: 'SOAP Note Generated',      desc: 'A structured, accurate SOAP note is ready for your review within seconds — fully editable and exportable.', icon: FileText },
  { step: '04', title: 'Export & Distribute',      desc: 'Export to PDF or DOCX, send via email, or integrate with your existing EHR system seamlessly.', icon: Cloud },
]

const TESTIMONIALS = [
  { name: 'Dr. Sarah Mitchell', role: 'General Practitioner', org: 'City Health Clinic',       text: 'MediScribe has completely transformed my workflow. I spend 70% less time on documentation and more time with my patients.', rating: 5 },
  { name: 'Dr. Raj Patel',      role: 'Cardiologist',         org: 'Metro Heart Institute',    text: 'The AI analysis feature is remarkable. It catches details I might miss and structures them perfectly into SOAP format.', rating: 5 },
  { name: 'Dr. Emily Chen',     role: 'Pediatrician',         org: "Children's Wellness Center",text: 'HIPAA compliance was our biggest concern. MediScribe handles it flawlessly with enterprise-grade security.', rating: 5 },
]

const TECH_STACK = [
  { name: 'React 18', icon: '⚛️' }, { name: 'FastAPI', icon: '⚡' },
  { name: 'GPT-4',    icon: '🤖' }, { name: 'Azure Speech', icon: '🎙️' },
  { name: 'PostgreSQL',icon: '🐘' }, { name: 'AWS', icon: '☁️' },
]

const NAV_LINKS = ['Features', 'How It Works', 'Security']

/* ─── component ──────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div style={{ fontFamily: "'DM Sans','Inter',system-ui,sans-serif", background: '#f0f4f8', color: '#374151', overflowX: 'hidden' }}>

      {/* ══════════ NAVBAR ══════════ */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #e1e7f0',
        padding: '0 clamp(16px,5vw,80px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#0d9488,#14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Stethoscope size={20} color="#fff" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#0d1117', fontFamily: "'DM Serif Display',Georgia,serif" }}>MediScribe</span>
        </div>

        {/* Desktop nav links */}
        <div className="lp-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {NAV_LINKS.map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
              style={{ fontSize: 14, fontWeight: 500, color: '#6b7280', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#0d9488')}
              onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
            >{l}</a>
          ))}
        </div>

        {/* Desktop CTA buttons */}
        <div className="lp-nav-cta" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate('/login')}
            style={{ padding: '8px 18px', borderRadius: 8, border: '1.5px solid #e1e7f0', background: 'transparent', color: '#374151', fontSize: 13.5, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#0d9488'; (e.currentTarget as HTMLButtonElement).style.color = '#0d9488' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e1e7f0'; (e.currentTarget as HTMLButtonElement).style.color = '#374151' }}
          >Log In</button>
          <button onClick={() => navigate('/login')}
            style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#0d9488,#14b8a6)', color: '#fff', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(13,148,136,0.3)', transition: 'all 0.15s', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(13,148,136,0.4)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(13,148,136,0.3)' }}
          >Sign Up</button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="lp-hamburger"
          onClick={() => setMobileMenuOpen(o => !o)}
          style={{ display: 'none', padding: 8, borderRadius: 8, border: '1.5px solid #e1e7f0', background: 'transparent', cursor: 'pointer', color: '#374151' }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99,
          background: '#fff', borderBottom: '1px solid #e1e7f0',
          padding: '16px 24px 20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {NAV_LINKS.map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, '-')}`}
              onClick={() => setMobileMenuOpen(false)}
              style={{ padding: '12px 0', fontSize: 15, fontWeight: 500, color: '#374151', textDecoration: 'none', borderBottom: '1px solid #f3f4f6' }}
            >{l}</a>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button onClick={() => { navigate('/login'); setMobileMenuOpen(false) }}
              style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1.5px solid #e1e7f0', background: 'transparent', color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
            >Log In</button>
            <button onClick={() => { navigate('/login'); setMobileMenuOpen(false) }}
              style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#0d9488,#14b8a6)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >Sign Up Free</button>
          </div>
        </div>
      )}

      {/* ══════════ HERO ══════════ */}
      <section style={{
        minHeight: '100vh',
        marginTop: 64,
        background: 'linear-gradient(160deg,#f0fdfa 0%,#e0f2fe 40%,#f0f4f8 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(40px,6vw,80px) clamp(16px,5vw,80px)',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle,rgba(13,148,136,0.08) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,0.07) 0%,transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 860, margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: 20 }}>
            <SectionBadge color="#0d9488"><Zap size={11} /> AI-Powered Healthcare Documentation</SectionBadge>
          </div>

          <h1 style={{ fontSize: 'clamp(32px,6vw,72px)', fontFamily: "'DM Serif Display',Georgia,serif", fontWeight: 400, color: '#0d1117', lineHeight: 1.1, marginBottom: 24 }}>
            Clinical Documentation,<br />
            <GradText>Reimagined with AI</GradText>
          </h1>

          <p style={{ fontSize: 'clamp(14px,2vw,18px)', color: '#6b7280', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.75 }}>
            MediScribe automates SOAP note generation, transcribes consultations in real-time, and analyses medical documents — so you can focus entirely on patient care.
          </p>

          {/* Hero CTAs — Explore Platform + Workflow */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
            <a href="#features"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 32px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#0d9488,#14b8a6)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 6px 24px rgba(13,148,136,0.35)', transition: 'all 0.2s', fontFamily: 'inherit', textDecoration: 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 10px 32px rgba(13,148,136,0.45)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 24px rgba(13,148,136,0.35)' }}
            >
              Explore Platform <ChevronRight size={16} />
            </a>
            <a href="#how-it-works"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 10, border: '1.5px solid #e1e7f0', background: '#fff', color: '#374151', fontSize: 15, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit', textDecoration: 'none' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#0d9488'; (e.currentTarget as HTMLAnchorElement).style.color = '#0d9488' }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e1e7f0'; (e.currentTarget as HTMLAnchorElement).style.color = '#374151' }}
            >
              Clinical Workflow
            </a>
          </div>
        </div>

        {/* Dashboard mockup */}
        <div style={{ width: '100%', maxWidth: 900, position: 'relative' }}>
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e1e7f0', boxShadow: '0 24px 80px rgba(0,0,0,0.12)', overflow: 'hidden' }}>
            {/* Browser bar */}
            <div style={{ background: '#f7f8fc', borderBottom: '1px solid #e1e7f0', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f43f5e' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
              <div style={{ flex: 1, background: '#e1e7f0', borderRadius: 6, height: 22, marginLeft: 8, display: 'flex', alignItems: 'center', paddingLeft: 10 }}>
                <span style={{ fontSize: 11, color: '#9ca3af' }}>app.mediscribe.ai/dashboard</span>
              </div>
            </div>
            {/* Stat cards */}
            <div style={{ padding: 20, background: '#f0f4f8', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
              {[
                { label: 'Consultations Today', value: '24', color: '#0d9488', icon: '🩺' },
                { label: 'SOAP Notes Generated', value: '24', color: '#3b82f6', icon: '📋' },
                { label: 'Time Saved',           value: '3.2h', color: '#7c3aed', icon: '⏱️' },
                { label: 'Patients Seen',        value: '18',  color: '#f59e0b', icon: '👥' },
              ].map(c => (
                <div key={c.label} style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #e1e7f0' }}>
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{c.icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: c.color }}>{c.value}</div>
                  <div style={{ fontSize: 10.5, color: '#9ca3af', marginTop: 2 }}>{c.label}</div>
                </div>
              ))}
            </div>
            {/* SOAP preview */}
            <div style={{ padding: '0 20px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
              {[
                { label: 'S — Subjective', color: '#3b82f6', text: 'Patient reports persistent headache for 3 days, rated 7/10 severity...' },
                { label: 'O — Objective',  color: '#10b981', text: 'BP: 128/82 mmHg, HR: 76 bpm, Temp: 98.6°F, RR: 16/min...' },
                { label: 'A — Assessment', color: '#f43f5e', text: 'Tension-type headache, likely stress-induced. Rule out hypertension...' },
                { label: 'P — Plan',       color: '#7c3aed', text: 'Prescribe ibuprofen 400mg TID. Follow-up in 7 days if no improvement...' },
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', borderRadius: 10, padding: 12, border: `1px solid ${s.color}30`, borderTop: `3px solid ${s.color}` }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: s.color, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5 }}>{s.text}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Floating badge */}
          <div className="lp-float-badge" style={{ position: 'absolute', top: -14, right: -14, background: '#fff', borderRadius: 12, padding: '9px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #e1e7f0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 3px rgba(16,185,129,0.2)' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>AI Generating SOAP Note...</span>
          </div>
        </div>
      </section>

      {/* ══════════ STATS ══════════ */}
      <section style={{ background: 'linear-gradient(135deg,#0d9488 0%,#0f766e 100%)', padding: 'clamp(40px,6vw,72px) clamp(16px,5vw,80px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 32 }}>
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} style={{ textAlign: 'center', color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} color="#fff" />
                </div>
              </div>
              <div style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, fontFamily: "'DM Serif Display',serif", lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 8, fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ FEATURES ══════════ */}
      <section id="features" style={{ padding: 'clamp(56px,8vw,100px) clamp(16px,5vw,80px)', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <SectionBadge color="#0d9488"><Star size={11} /> Core Features</SectionBadge>
            <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontFamily: "'DM Serif Display',serif", color: '#0d1117', marginTop: 16, marginBottom: 14 }}>
              Everything You Need to <GradText>Document Smarter</GradText>
            </h2>
            <p style={{ fontSize: 15, color: '#6b7280', maxWidth: 540, margin: '0 auto', lineHeight: 1.75 }}>
              From real-time transcription to AI-powered analysis, MediScribe covers every step of your clinical documentation workflow.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 22 }}>
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title}
                style={{ background: '#fff', border: '1px solid #e1e7f0', borderRadius: 16, padding: 26, transition: 'all 0.2s', cursor: 'default' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.borderColor = color + '40' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.borderColor = '#e1e7f0' }}
              >
                <div style={{ width: 46, height: 46, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={21} color={color} />
                </div>
                <h3 style={{ fontSize: 15.5, fontWeight: 700, color: '#0d1117', marginBottom: 9 }}>{title}</h3>
                <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section id="how-it-works" style={{ padding: 'clamp(56px,8vw,100px) clamp(16px,5vw,80px)', background: '#f0f4f8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <SectionBadge color="#3b82f6"><Zap size={11} /> Simple Workflow</SectionBadge>
            <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontFamily: "'DM Serif Display',serif", color: '#0d1117', marginTop: 16, marginBottom: 14 }}>
              From Consultation to <GradText>Completed Note</GradText>
            </h2>
            <p style={{ fontSize: 15, color: '#6b7280', maxWidth: 500, margin: '0 auto', lineHeight: 1.75 }}>
              Four simple steps to eliminate documentation burden and reclaim hours of your day.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 22, position: 'relative' }}>
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }, i) => (
              <div key={step} style={{ position: 'relative' }}>
                <div style={{ background: '#fff', borderRadius: 16, padding: 26, border: '1px solid #e1e7f0', height: '100%', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#0d9488,#14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={19} color="#fff" />
                    </div>
                    <span style={{ fontSize: 26, fontWeight: 800, color: '#e1e7f0', fontFamily: "'DM Serif Display',serif" }}>{step}</span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0d1117', marginBottom: 9 }}>{title}</h3>
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65 }}>{desc}</p>
                </div>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="lp-how-arrow" style={{ position: 'absolute', right: -16, top: '50%', transform: 'translateY(-50%)', zIndex: 2 }}>
                    <ChevronRight size={20} color="#0d9488" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ AI ANALYSIS SPOTLIGHT ══════════ */}
      <section style={{ padding: 'clamp(56px,8vw,100px) clamp(16px,5vw,80px)', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 52, alignItems: 'center' }}>
          <div>
            <SectionBadge color="#7c3aed"><Brain size={11} /> AI Document Analysis</SectionBadge>
            <h2 style={{ fontSize: 'clamp(24px,3.5vw,40px)', fontFamily: "'DM Serif Display',serif", color: '#0d1117', marginTop: 16, marginBottom: 18, lineHeight: 1.2 }}>
              Upload Any Medical Document.<br /><GradText>AI Does the Rest.</GradText>
            </h2>
            <p style={{ fontSize: 14.5, color: '#6b7280', lineHeight: 1.75, marginBottom: 26 }}>
              Upload PDFs, DOCX files, or scanned images of medical records. MediScribe's GPT-4 pipeline extracts clinical entities, generates structured SOAP notes, and provides a side-by-side comparison with your existing records.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Supports PDF, DOCX, and image formats (up to 50 MB)',
                'Automated OCR for scanned documents',
                'Key entity extraction (medications, diagnoses, vitals)',
                'Side-by-side diff comparison with existing notes',
                'One-click approval to create consultation record',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <CheckCircle size={15} color="#0d9488" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 13.5, color: '#374151' }}>{item}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/login')}
              style={{ marginTop: 28, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 26px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 16px rgba(124,58,237,0.3)', transition: 'all 0.2s', fontFamily: 'inherit' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)' }}
            >
              Try AI Analysis <ArrowRight size={15} />
            </button>
          </div>

          {/* Mockup card */}
          <div style={{ background: '#f7f8fc', borderRadius: 20, padding: 22, border: '1px solid #e1e7f0', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, border: '1px solid #e1e7f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#7c3aed18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Brain size={17} color="#7c3aed" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0d1117' }}>AI Analysis Complete</div>
                  <div style={{ fontSize: 10.5, color: '#9ca3af' }}>patient_report_2026.pdf</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: '#10b98118', color: '#10b981', border: '1px solid #10b98130', whiteSpace: 'nowrap' }}>98% Confidence</span>
              </div>
              {[
                { label: 'Medications Found',  value: '4 items',      color: '#3b82f6' },
                { label: 'Diagnoses Extracted',value: '2 conditions', color: '#f43f5e' },
                { label: 'Vitals Detected',    value: '6 readings',   color: '#10b981' },
                { label: 'Follow-up Required', value: 'Yes — 7 days', color: '#f59e0b' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>{row.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: '#fff', borderRadius: 10, padding: 12, border: '1px solid #3b82f630', borderTop: '3px solid #3b82f6' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Original</div>
                <div style={{ fontSize: 10.5, color: '#9ca3af', lineHeight: 1.5 }}>Patient c/o chest pain radiating to left arm...</div>
              </div>
              <div style={{ background: '#fff', borderRadius: 10, padding: 12, border: '1px solid #0d948830', borderTop: '3px solid #0d9488' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>AI Enhanced</div>
                <div style={{ fontSize: 10.5, color: '#374151', lineHeight: 1.5 }}>Patient presents with acute chest pain (8/10) radiating to left arm, onset 2h ago...</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ SECURITY ══════════ */}
      <section id="security" style={{ padding: 'clamp(56px,8vw,100px) clamp(16px,5vw,80px)', background: 'linear-gradient(160deg,#0d1117 0%,#111827 100%)', color: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <SectionBadge color="#14b8a6"><Shield size={11} /> Enterprise Security</SectionBadge>
            <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontFamily: "'DM Serif Display',serif", color: '#f0f6fc', marginTop: 16, marginBottom: 14 }}>
              Built for Healthcare's <GradText>Strictest Standards</GradText>
            </h2>
            <p style={{ fontSize: 15, color: '#8b949e', maxWidth: 520, margin: '0 auto', lineHeight: 1.75 }}>
              Every layer of MediScribe is designed with HIPAA, GDPR, and SOC 2 compliance in mind — from encryption to audit trails.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 18 }}>
            {[
              { icon: Lock,     title: 'AES-256 Encryption',  desc: 'All PHI encrypted at rest and in transit using military-grade AES-256-GCM with key rotation every 90 days.', color: '#14b8a6' },
              { icon: Shield,   title: 'HIPAA Compliant',     desc: 'Full administrative, physical, and technical safeguards. BAAs available for all third-party integrations.', color: '#3b82f6' },
              { icon: Database, title: 'Audit Trail',         desc: 'Immutable event logging for every clinical and administrative action with tamper-proof timestamps.', color: '#7c3aed' },
              { icon: Lock,     title: 'GDPR Ready',          desc: 'Full data subject rights — access, rectification, erasure, and portability on demand.', color: '#10b981' },
              { icon: Activity, title: '99.9% Uptime SLA',   desc: 'Multi-AZ AWS deployment with auto-scaling, blue-green deployments, and 15-minute MTTR guarantee.', color: '#f43f5e' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 22, transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLDivElement).style.borderColor = color + '40' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)' }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 12, background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon size={19} color={color} />
                </div>
                <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#f0f6fc', marginBottom: 7 }}>{title}</h3>
                <p style={{ fontSize: 12.5, color: '#8b949e', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section style={{ padding: 'clamp(56px,8vw,100px) clamp(16px,5vw,80px)', background: '#f0f4f8' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <SectionBadge color="#f59e0b"><Heart size={11} /> Trusted by Doctors</SectionBadge>
            <h2 style={{ fontSize: 'clamp(26px,4vw,44px)', fontFamily: "'DM Serif Display',serif", color: '#0d1117', marginTop: 16 }}>
              What Healthcare Professionals <GradText>Are Saying</GradText>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: 22 }}>
            {TESTIMONIALS.map(({ name, role, org, text, rating }) => (
              <div key={name} style={{ background: '#fff', borderRadius: 16, padding: 26, border: '1px solid #e1e7f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} size={13} color="#f59e0b" fill="#f59e0b" />
                  ))}
                </div>
                <p style={{ fontSize: 13.5, color: '#374151', lineHeight: 1.7, fontStyle: 'italic', flex: 1 }}>"{text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#0d9488,#14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    {name.charAt(3)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0d1117' }}>{name}</div>
                    <div style={{ fontSize: 11.5, color: '#9ca3af' }}>{role} · {org}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TECH STACK ══════════ */}
      <section style={{ padding: 'clamp(36px,5vw,56px) clamp(16px,5vw,80px)', background: '#fff', borderTop: '1px solid #e1e7f0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>Powered by Industry-Leading Technology</p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12 }}>
            {TECH_STACK.map(({ name, icon }) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: '#f7f8fc', borderRadius: 10, border: '1px solid #e1e7f0', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                <span style={{ fontSize: 17 }}>{icon}</span> {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA BANNER ══════════ */}
      <section style={{ padding: 'clamp(56px,8vw,100px) clamp(16px,5vw,80px)', background: 'linear-gradient(135deg,#0d9488 0%,#0f766e 50%,#115e59 100%)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(26px,4vw,46px)', fontFamily: "'DM Serif Display',serif", color: '#fff', marginBottom: 18, lineHeight: 1.2 }}>
            Ready to Transform Your Clinical Documentation?
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', marginBottom: 32, lineHeight: 1.75 }}>
            Join 500+ healthcare professionals who save hours every day with MediScribe.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/login')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 32px', borderRadius: 10, border: 'none', background: '#fff', color: '#0d9488', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 24px rgba(0,0,0,0.2)', transition: 'all 0.2s', fontFamily: 'inherit' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)' }}
            >
              Sign Up <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/login')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 10, border: '2px solid rgba(255,255,255,0.4)', background: 'transparent', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              Log In
            </button>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ background: '#0d1117', color: '#8b949e', padding: 'clamp(36px,5vw,56px) clamp(16px,5vw,80px) 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Top: brand + nav columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 36, marginBottom: 40 }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#0d9488,#14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Stethoscope size={15} color="#fff" />
                </div>
                <span style={{ fontSize: 17, fontWeight: 700, color: '#f0f6fc', fontFamily: "'DM Serif Display',serif" }}>MediScribe</span>
              </div>
              <p style={{ fontSize: 12.5, lineHeight: 1.7, color: '#6b7280', maxWidth: 200 }}>
                AI-powered clinical documentation platform for healthcare professionals.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 style={{ fontSize: 11, fontWeight: 700, color: '#f0f6fc', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Product</h4>
              {['Features', 'How It Works', 'Security'].map(l => (
                <div key={l} style={{ marginBottom: 9 }}>
                  <a href={`#${l.toLowerCase().replace(/ /g, '-')}`}
                    style={{ fontSize: 13, color: '#6b7280', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#14b8a6')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
                  >{l}</a>
                </div>
              ))}
            </div>

            {/* Account */}
            <div>
              <h4 style={{ fontSize: 11, fontWeight: 700, color: '#f0f6fc', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Account</h4>
              {[
                { label: 'Log In',  action: () => navigate('/login') },
                { label: 'Sign Up', action: () => navigate('/login') },
              ].map(({ label, action }) => (
                <div key={label} style={{ marginBottom: 9 }}>
                  <button onClick={action}
                    style={{ fontSize: 13, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#14b8a6')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
                  >{label}</button>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid #21262d', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <p style={{ fontSize: 12, color: '#484f58' }}>
              © 2026 MediScribe. Built with Love❤️.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
