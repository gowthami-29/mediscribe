import { useState, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { patientsApi } from '@/api/patients'
import { radiologyApi, RadiologyResponse, SimilarReport } from '@/api/radiology'
import { 
  UploadCloud, FileImage, Loader2, 
  AlertTriangle, History, Search, BookOpen, User, 
  Sparkles, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function RadiologyPanel() {
  const [patientId, setPatientId] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [statusText, setStatusText] = useState('')
  const [report, setReport] = useState<RadiologyResponse['report'] | null>(null)
  
  // pgvector search states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchingCases, setSearchingCases] = useState(false)
  const [similarCases, setSimilarCases] = useState<SimilarReport[]>([])
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch patients list
  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientsApi.list(),
  })

  // Handle image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file (PNG, JPG, JPEG)')
        return
      }
      setSelectedFile(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setReport(null) // reset previous report
    }
  }

  // Trigger Azure Vision AI Analysis
  const handleAnalyze = async () => {
    if (!patientId) {
      toast.error('Please link a patient to match medical records')
      return
    }
    if (!selectedFile) {
      toast.error('Please select or upload an X-ray image')
      return
    }

    setLoading(true)
    setStatusText('Uploading X-ray image to secure storage...')
    setReport(null)

    try {
      // Step-by-step loading simulation for excellent UX
      setTimeout(() => setStatusText('Analyzing image utilizing Azure OpenAI Vision...'), 1500)
      setTimeout(() => setStatusText('Cross-referencing findings with patient history...'), 3500)
      setTimeout(() => setStatusText('Generating structured radiology JSON report...'), 5500)

      const response = await radiologyApi.analyzeXray(patientId, selectedFile)
      
      if (response.success && response.report) {
        setReport(response.report)
        toast.success('Radiology Vision analysis complete!')
      } else {
        toast.error('Failed to analyze radiology image')
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.detail || 'Analysis failed. Check backend console.')
    } finally {
      setLoading(false)
      setStatusText('')
    }
  }

  // Search similar reports with pgvector
  const handleSearchSimilar = async (queryStr = searchQuery) => {
    const queryToUse = queryStr || searchQuery
    if (!queryToUse.trim()) {
      toast.error('Please enter a clinical condition or query')
      return
    }
    
    setSearchingCases(true)
    try {
      const res = await radiologyApi.getSimilarReports(queryToUse)
      setSimilarCases(res.matches || [])
      if (res.matches?.length === 0) {
        toast.error('No matching records found')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to perform similar case search')
    } finally {
      setSearchingCases(false)
    }
  }

  // Rapid Query Buttons for Testing
  const handlePredefinedSearch = (term: string) => {
    setSearchQuery(term)
    handleSearchSimilar(term)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Upper Section: Input + Visual Preview */}
      <div className="grid-responsive" style={{
        display: 'grid',
        gridTemplateColumns: report ? '1fr 1fr' : '1.1fr 0.9fr',
        gap: 24
      }}>
        {/* Left Column: Link Patient & Image Upload */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card-premium" style={{ padding: 22, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-1)' }}>
              <User size={18} color="var(--violet)" />
              1. Link Patient & Upload X-ray
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Patient Dropdown */}
              <div className="form-group">
                <label className="form-label">Link Patient (Required)</label>
                <select 
                  className="form-control"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  style={{ height: 42 }}
                >
                  <option value="">-- Choose Patient for Record-linking --</option>
                  {patients?.map((p: any) => (
                    <option key={p.patient_id} value={p.patient_id}>
                      {p.first_name} {p.last_name} ({p.gender}, DOB: {p.date_of_birth})
                    </option>
                  ))}
                </select>
              </div>

              {/* Drag and Drop Container */}
              <div className="form-group">
                <label className="form-label">Upload Scanned Image / Chest X-ray</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      const file = e.dataTransfer.files[0]
                      if (file.type.startsWith('image/')) {
                        setSelectedFile(file)
                        const reader = new FileReader()
                        reader.onloadend = () => setImagePreview(reader.result as string)
                        reader.readAsDataURL(file)
                        setReport(null)
                      }
                    }
                  }}
                  style={{
                    border: '2px dashed var(--border)',
                    borderRadius: 12,
                    padding: '32px 20px',
                    textAlign: 'center',
                    background: 'var(--surface-2)',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'border 0.2s',
                  }}
                >
                  <input 
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <UploadCloud size={32} color="var(--violet)" style={{ margin: '0 auto 10px', opacity: 0.8 }} />
                  <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: 'var(--text-1)' }}>
                    {selectedFile ? selectedFile.name : 'Choose or drop radiology image'}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4 }}>Supports DICOM-export, PNG, JPG, JPEG.</p>
                </div>
              </div>

              {/* Action Button */}
              {selectedFile && !loading && (
                <button
                  onClick={handleAnalyze}
                  className="btn btn-primary btn-lg"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    background: 'var(--grad-violet)',
                    boxShadow: 'var(--shadow-violet)',
                    border: 'none',
                    fontWeight: 600,
                  }}
                >
                  <Sparkles size={16} /> Run Vision AI Analysis
                </button>
              )}

              {/* Loading spinner */}
              {loading && (
                <div style={{
                  padding: '16px 20px',
                  borderRadius: 10,
                  background: 'var(--violet-light)',
                  border: '1px solid rgba(124, 58, 237, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}>
                  <Loader2 size={20} className="spin" color="var(--violet)" />
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--violet)' }}>
                    {statusText}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Visual Preview & AI Vision Results */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
          <div style={{
            padding: '18px 22px 14px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface-2)',
            borderRadius: 'var(--radius) var(--radius) 0 0',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <div className="icon-box-premium" style={{ color: 'var(--violet)' }}>
              <FileImage size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, margin: 0, fontWeight: 700 }}>
                X-ray Preview & Analysis
              </h3>
              <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>Interactive Vision sheet</p>
            </div>
          </div>

          <div style={{ padding: 22, flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {imagePreview ? (
              <div style={{
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid var(--border)',
                background: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                maxHeight: 280,
                position: 'relative'
              }}>
                <img 
                  src={imagePreview} 
                  alt="Scanned Radiology" 
                  style={{ maxHeight: 280, width: 'auto', maxWidth: '100%', objectFit: 'contain' }} 
                />
                <div style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  background: 'rgba(0, 0, 0, 0.75)',
                  backdropFilter: 'blur(4px)',
                  color: '#fff',
                  fontSize: 10,
                  padding: '3px 8px',
                  borderRadius: 20,
                  fontWeight: 600,
                  letterSpacing: '0.05em'
                }}>
                  DICOM PREVIEW
                </div>
              </div>
            ) : (
              <div style={{
                flex: 1,
                border: '2px dashed var(--border)',
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 40,
                color: 'var(--text-3)',
                background: 'var(--surface-hover-op)',
                minHeight: 220,
              }}>
                <FileImage size={36} style={{ marginBottom: 10, opacity: 0.5 }} />
                <span style={{ fontSize: 13 }}>Please upload an X-ray to preview</span>
              </div>
            )}

            {/* AI Results Display */}
            {report && (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Indication & Technique */}
                {(report.indication || report.technique) && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {report.indication && (
                      <div style={{ background: 'var(--surface-hover)', borderRadius: 10, padding: 16, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>
                          Clinical Indication
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.5, margin: 0 }}>
                          {report.indication}
                        </p>
                      </div>
                    )}
                    {report.technique && (
                      <div style={{ background: 'var(--surface-hover)', borderRadius: 10, padding: 16, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 6 }}>
                          Technique & Modality
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.5, margin: 0 }}>
                          {report.technique}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Findings */}
                <div style={{ background: 'var(--surface-hover)', borderRadius: 10, padding: 16, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--violet)', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={12} /> Findings
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.5, margin: 0 }}>
                    {report.findings}
                  </p>
                </div>

                {/* Impression */}
                <div style={{ background: 'var(--surface-hover)', borderRadius: 10, padding: 16, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--violet)', textTransform: 'uppercase', marginBottom: 6 }}>
                    Clinical Impression
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.5, margin: 0 }}>
                    {report.impression}
                  </p>
                </div>

                {/* Abnormalities */}
                {report.abnormalities && report.abnormalities.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--rose)', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <AlertTriangle size={12} /> Detected Clinical Markers / Abnormalities
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {report.abnormalities.map((item, idx) => (
                        <span 
                          key={idx} 
                          className="badge badge-red"
                          style={{
                            fontSize: 11.5,
                            padding: '4px 10px',
                            borderRadius: 20,
                            fontWeight: 600,
                          }}
                        >
                          ⚠️ {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comparisons */}
                {report.comparison && (
                  <div style={{ background: 'rgba(59, 130, 246, 0.06)', borderRadius: 10, padding: 16, border: '1px solid rgba(59, 130, 246, 0.15)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <History size={12} /> Comparison with Previous Reports
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
                      {report.comparison}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lower Section: pgvector Similarity Search Finder */}
      <div className="card" style={{ padding: 22, background: 'var(--surface)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-1)' }}>
          <BookOpen size={18} color="var(--violet)" />
          2. pgvector Semantic Similar Case Study Finder (RAG)
        </h3>
        <p style={{ fontSize: 12.5, color: 'var(--text-3)', marginBottom: 20, maxWidth: 800 }}>
          Search the hospital database using natural language. The system converts your query into high-dimensional vector embeddings and performs a cosine-similarity pgvector search across past radiography records.
        </p>

        {/* Predefined Search Help Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-4)' }}>Testing Presets:</span>
          {['Cardiomegaly', 'Pleural Effusion', 'Pneumothorax', 'No acute abnormality'].map((term) => (
            <button
              key={term}
              onClick={() => handlePredefinedSearch(term)}
              className="btn btn-ghost"
              style={{
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 20,
                border: '1px solid var(--border)',
                background: 'var(--surface-2)',
                color: 'var(--text-2)'
              }}
            >
              🔎 {term}
            </button>
          ))}
        </div>

        {/* Search Bar Input */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 22 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="var(--text-4)" style={{ position: 'absolute', left: 14, top: 13 }} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. pleural effusion in left lung or enlarged cardiac silhouette..."
              className="form-control"
              style={{ paddingLeft: 38, height: 42, fontSize: 13.5 }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSimilar() }}
            />
          </div>
          <button
            onClick={() => handleSearchSimilar()}
            disabled={searchingCases}
            className="btn btn-primary"
            style={{
              background: 'var(--grad-violet)',
              boxShadow: 'var(--shadow-violet)',
              border: 'none',
              padding: '0 24px',
              fontWeight: 600,
              height: 42,
            }}
          >
            {searchingCases ? (
              <RefreshCw size={14} className="spin" />
            ) : (
              'Search Database'
            )}
          </button>
        </div>

        {/* Results List */}
        {similarCases.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--violet)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              🎯 Top pgvector Case Matches Found:
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {similarCases.map((match, index) => (
                <div 
                  key={index} 
                  className="fade-in"
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    background: 'var(--surface-hover-op)',
                    padding: 16,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-4)' }}>MATCH #{index + 1}</span>
                      {match.created_at && (
                        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                          • {match.created_at}
                        </span>
                      )}
                    </div>
                    <span 
                      className="badge badge-teal"
                      style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4 }}
                    >
                      Patient: {match.patient_name || `${match.patient_id.slice(0, 8)}...`}
                    </span>
                  </div>

                   {(match.indication || match.technique) && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                      {match.indication && (
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', marginBottom: 2 }}>Indication</div>
                          <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0, lineHeight: 1.3 }}>{match.indication}</p>
                        </div>
                      )}
                      {match.technique && (
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-4)', textTransform: 'uppercase', marginBottom: 2 }}>Technique</div>
                          <p style={{ fontSize: 12, color: 'var(--text-2)', margin: 0, lineHeight: 1.3 }}>{match.technique}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 4 }}>Findings</div>
                      <p style={{ fontSize: 12.5, color: 'var(--text-1)', margin: 0, lineHeight: 1.4 }}>{match.findings}</p>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 4 }}>Impression</div>
                      <p style={{ fontSize: 12.5, color: 'var(--text-1)', margin: 0, lineHeight: 1.4 }}>{match.impression}</p>
                    </div>
                  </div>
                  
                  {match.comparison && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>
                      Historical Comparison: {match.comparison}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          searchQuery && !searchingCases && (
            <div style={{
              textAlign: 'center',
              padding: '24px 0',
              color: 'var(--text-4)',
              fontSize: 13,
              border: '1px dashed var(--border)',
              borderRadius: 12
            }}>
              No matching records found in the database. Try another query like "cardiomegaly".
            </div>
          )
        )}
      </div>
    </div>
  )
}
