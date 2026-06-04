import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { format } from 'date-fns'
import { ArrowLeft, FileText, User, Stethoscope, ClipboardList, CheckSquare, Pill, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

const SECTION_CONFIG = [
  { key: 'subjective',  label: 'S — Subjective',  icon: User,          color: '#2563eb', bg: '#eff6ff',  desc: 'Patient-reported symptoms and history' },
  { key: 'objective',   label: 'O — Objective',   icon: Stethoscope,   color: '#059669', bg: '#ecfdf5',  desc: 'Clinical observations and exam findings' },
  { key: 'assessment',  label: 'A — Assessment',  icon: ClipboardList, color: '#e11d48', bg: '#fff1f2',  desc: 'Diagnosis and clinical reasoning' },
  { key: 'plan',        label: 'P — Plan',        icon: CheckSquare,   color: '#7c3aed', bg: '#f5f3ff',  desc: 'Treatment plan and next steps' },
]

export default function PatientReportPage() {
  const { reportId } = useParams()
  const navigate     = useNavigate()
  const user         = useAuthStore((s) => s.user)
  const logout       = useAuthStore((s) => s.logout)

  const { data: report, isLoading, isError } = useQuery({
    queryKey: ['patient-report', reportId],
    queryFn:  () => apiClient.get(`/patient/reports/${reportId}`).then(r => r.data),
    enabled:  !!reportId,
  })

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-1)', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
      {/* Top bar */}
      <div style={{
        height: 64, background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 clamp(16px,5vw,40px)', boxShadow: 'var(--shadow-xs)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#0d9488,#14b8a6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={17} color="#fff" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>Patient Portal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>{user?.full_name ?? 'Patient'}</span>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
            borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)',
            color: 'var(--text-3)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#fecdd3'; e.currentTarget.style.background = '#fff1f2' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface-2)' }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(20px,4vw,40px) clamp(16px,5vw,40px)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button
            onClick={() => navigate('/patient/reports')}
            style={{ width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            <ArrowLeft size={15} color="var(--text-2)" />
          </button>
          <div style={{ width: 42, height: 42, borderRadius: 11, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={20} color="#7c3aed" />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>Medical Report</h1>
            {report?.created_at && (
              <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '2px 0 0' }}>
                {format(new Date(report.created_at), 'MMMM d, yyyy')}
              </p>
            )}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ color: 'var(--text-1)' }}>Could not load report</h3>
            <p style={{ color: 'var(--text-3)', fontSize: 13 }}>This report may not be available or you may not have access to it.</p>
            <button onClick={() => navigate('/patient/reports')} className="btn btn-primary" style={{ marginTop: 16 }}>Back to Reports</button>
          </div>
        )}

        {/* Report content */}
        {report && !isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Status badge */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{
                fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20,
                background: report.status === 'approved' ? '#ecfdf5' : '#fffbeb',
                color:      report.status === 'approved' ? '#059669' : '#d97706',
                border:     `1px solid ${report.status === 'approved' ? '#a7f3d0' : '#fde68a'}`,
                textTransform: 'capitalize',
              }}>
                {report.status ?? 'draft'}
              </span>
            </div>

            {/* SOAP sections */}
            {SECTION_CONFIG.map(({ key, label, icon: Icon, color, bg, desc }) => (
              <div key={key} className="card" style={{ padding: 0, overflow: 'hidden', borderTop: `3px solid ${color}` }}>
                <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color={color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>{label}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginTop: 2 }}>{desc}</div>
                  </div>
                </div>
                <div style={{ padding: '16px 22px' }}>
                  {(report as any)[key] ? (
                    <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.75, margin: 0, whiteSpace: 'pre-wrap' }}>
                      {(report as any)[key]}
                    </p>
                  ) : (
                    <p style={{ fontSize: 13, color: 'var(--text-4)', margin: 0, fontStyle: 'italic' }}>Not recorded.</p>
                  )}
                </div>
              </div>
            ))}

            {/* Medications */}
            {Array.isArray(report.medications) && report.medications.length > 0 && (
              <div className="card" style={{ padding: 0, overflow: 'hidden', borderTop: '3px solid #0d9488' }}>
                <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Pill size={16} color="#0d9488" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)' }}>Medications</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginTop: 2 }}>Prescribed medications and dosages</div>
                  </div>
                </div>
                <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {report.medications.map((med: any, idx: number) => (
                    <div key={idx} style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '12px 16px', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-1)', minWidth: 140 }}>{med.name}</div>
                      {[
                        { label: 'Dosage',    val: med.dosage    },
                        { label: 'Frequency', val: med.frequency },
                        { label: 'Duration',  val: med.duration  },
                        { label: 'Route',     val: med.route     },
                      ].map(({ label, val }) => val ? (
                        <div key={label} style={{ fontSize: 12 }}>
                          <span style={{ color: 'var(--text-4)', fontWeight: 600 }}>{label}: </span>
                          <span style={{ color: 'var(--text-2)' }}>{val}</span>
                        </div>
                      ) : null)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up */}
            {report.follow_up_needed && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ClipboardList size={16} color="#d97706" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e' }}>Follow-up Required</div>
                  <div style={{ fontSize: 13, color: '#b45309', marginTop: 2 }}>
                    {report.follow_up_days ? `Please schedule a follow-up visit in ${report.follow_up_days} day(s).` : 'Please schedule a follow-up visit as advised.'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
