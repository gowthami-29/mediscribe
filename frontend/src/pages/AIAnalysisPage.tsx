import { useState } from 'react'
import FileUploadPanel from '@/components/ai-analysis/FileUploadPanel'
import AnalysisResultPanel from '@/components/ai-analysis/AnalysisResultPanel'
import RadiologyPanel from '@/components/ai-analysis/RadiologyPanel'
import { BrainCircuit, Upload, Sparkles, Image } from 'lucide-react'

export default function AIAnalysisPage() {
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'document' | 'radiology'>('document')

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Header / Top Section ─────────────────────────── */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 8
      }}>
        {/* Sleek Premium Tab Selector */}
        <div style={{
          display: 'flex',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 4,
          gap: 4
        }}>
          <button
            onClick={() => setActiveTab('document')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === 'document' ? 'var(--surface)' : 'transparent',
              color: activeTab === 'document' ? 'var(--text-1)' : 'var(--text-3)',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: activeTab === 'document' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <BrainCircuit size={15} color={activeTab === 'document' ? 'var(--violet)' : 'var(--text-4)'} />
            Clinical Document RAG
          </button>
          
          <button
            onClick={() => setActiveTab('radiology')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === 'radiology' ? 'var(--surface)' : 'transparent',
              color: activeTab === 'radiology' ? 'var(--text-1)' : 'var(--text-3)',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              boxShadow: activeTab === 'radiology' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <Image size={15} color={activeTab === 'radiology' ? 'var(--violet)' : 'var(--text-4)'} />
            Radiology AI & Search
            <span style={{
              background: 'var(--grad-violet)',
              color: '#fff', 
              fontSize: 8.5, 
              borderRadius: 20,
              padding: '1px 6px', 
              fontWeight: 700, 
              marginLeft: 4,
              boxShadow: 'var(--shadow-violet)'
            }}>
              New
            </span>
          </button>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'var(--violet-light)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--violet)', fontWeight: 600,
        }}>
          <Sparkles size={13} />
          GPT-4 & Vision Enabled
        </div>
      </div>

      {activeTab === 'document' ? (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* ── Info Banner ────────────────────── */}
          <div style={{
            background: 'var(--violet-light)',
            border: '1px solid var(--border)', borderRadius: 16,
            padding: '20px 24px',
            display: 'flex', alignItems: 'flex-start', gap: 16,
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div className="icon-box-premium" style={{ color: 'var(--violet)' }}>
              <BrainCircuit size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--violet)', marginBottom: 4 }}>
                How AI Analysis Works
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6, opacity: 0.9 }}>
                Our upgraded AI now uses <strong>RAG (Retrieval-Augmented Generation)</strong> to analyze documents.
                It automatically retrieves relevant information from historical patient records and medical documents
                to generate highly contextualized and accurate SOAP reports.
              </div>
            </div>
          </div>

          {/* ── Main Content ───────────────────── */}
          <div className="grid-responsive" style={{
            display: 'grid',
            gridTemplateColumns: analysisId ? '1.1fr 0.9fr' : '1fr',
            gap: 24,
            transition: 'grid-template-columns 0.3s ease',
          }}>
            {/* Upload Panel */}
            <div className="card">
              <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="icon-box-premium" style={{ color: 'var(--violet)' }}>
                  <Upload size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: 15, margin: 0, fontWeight: 700 }}>
                    Upload Document
                  </h3>
                  <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>PDF, DOCX, or image</p>
                </div>
              </div>
              <div style={{ padding: 22 }}>
                <FileUploadPanel onAnalysisReady={(id) => setAnalysisId(id)} />
              </div>
            </div>

            {/* Results Panel */}
            {analysisId && (
              <div className="card slide-in">
                <div style={{
                  padding: '18px 22px 14px', borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="icon-box-premium" style={{ color: 'var(--emerald)' }}>
                      <BrainCircuit size={16} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 15, margin: 0, fontWeight: 700 }}>
                        Analysis Results
                      </h3>
                      <p style={{ fontSize: 11.5, color: 'var(--emerald)', marginTop: 2 }}>AI-generated SOAP note ready</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAnalysisId(null)}
                    className="btn btn-sm"
                    style={{ fontSize: 12, padding: '4px 10px' }}
                  >
                    ✕ Clear
                  </button>
                </div>
                <div style={{ padding: 22 }}>
                  <AnalysisResultPanel analysisId={analysisId} />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Radiology AI Info Banner */}
          <div style={{
            background: 'var(--violet-light)',
            border: '1px solid var(--border)', borderRadius: 16,
            padding: '20px 24px',
            display: 'flex', alignItems: 'flex-start', gap: 16,
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div className="icon-box-premium" style={{ color: 'var(--violet)' }}>
              <Image size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--violet)', marginBottom: 4 }}>
                Radiology AI & pgvector RAG Integration
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6, opacity: 0.9 }}>
                Our latest radiology pipeline leverages <strong>Azure OpenAI Vision</strong> to perform direct, multi-modal analysis on chest X-rays and medical images. 
                The system automatically links findings to patient files, performs historical comparison against previous reports, and allows high-speed <strong>pgvector semantic searches</strong> to retrieve similar matching cases from the hospital database.
              </div>
            </div>
          </div>

          <RadiologyPanel />
        </div>
      )}
    </div>
  )
}
