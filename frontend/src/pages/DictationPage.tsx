import { useState, useRef, useEffect } from 'react'
import { 
  Mic, MicOff, Upload, FileText, Printer, 
  RefreshCw, Trash2, ArrowRight, User, AlertCircle,
  Volume2
} from 'lucide-react'
import { dictationApi } from '@/api/dictation'
import { useQuery } from '@tanstack/react-query'
import { patientsApi } from '@/api/patients'
import { useDictationStore } from '@/store/dictationStore'

// Extended window type for webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function DictationPage() {
  const {
    patientId, setPatientId,
    letterhead, setLetterhead,
    transcript, setTranscript,
    realtimeText, setRealtimeText,
    statusText, setStatusText,
    report, setReport,
    clearDictation
  } = useDictationStore()

  const [letterheadPreview, setLetterheadPreview] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [pdfGenerating, setPdfGenerating] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // MediaRecorder refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)

  // Fetch patients list for context
  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientsApi.list(),
  })

  // Handle letterhead upload
  const handleLetterheadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setLetterhead(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setLetterheadPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Clear current dictation
  const handleClear = () => {
    clearDictation()
    setErrorMsg('')
  }

  // Initialize Speech Recognition for Real-time Display
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = true
      rec.interimResults = true
      rec.lang = 'en-US'

      rec.onresult = (event: any) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' '
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }

        setRealtimeText(interimTranscript)
        if (finalTranscript) {
          const currentTranscript = useDictationStore.getState().transcript;
          setTranscript(currentTranscript + finalTranscript)
        }
      }

      rec.onerror = (e: any) => {
        console.error('Speech recognition error', e)
        if (e.error !== 'no-speech') {
          setStatusText(`Mic error: ${e.error}`)
        }
      }

      recognitionRef.current = rec
    } else {
      console.warn('Web Speech API is not supported in this browser.')
    }
  }, [])

  // Start recording audio and live transcription
  const startRecording = async () => {
    setErrorMsg('')
    setRealtimeText('')
    audioChunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Setup audio recording
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach(track => track.stop())
        await processAudio(audioBlob)
      }

      // Start recording
      mediaRecorder.start(250) // capture chunks every 250ms
      setIsRecording(true)
      setStatusText('Listening actively... speak now.')

      // Start live speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
        } catch (err) {
          console.error('Recognition start error', err)
        }
      }
    } catch (err: any) {
      console.error('Failed to get media devices', err)
      setErrorMsg('Could not access your microphone. Please check system permissions.')
      setStatusText('Microphone access denied.')
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setStatusText('Recording stopped. Processing audio...')

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (err) {
          console.error('Recognition stop error', err)
        }
      }
    }
  }

  // Process the final audio blob
  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)
    setStatusText('Transcribing speech and generating structured clinical report...')
    setErrorMsg('')

    try {
      // Find patient context if selected
      let patientContext = ''
      if (patientId && patients) {
        const selectedPat = patients.find((p: any) => p.patient_id === patientId)
        if (selectedPat) {
          patientContext = `Patient Name: ${selectedPat.first_name} ${selectedPat.last_name}, DOB: ${selectedPat.date_of_birth}, Gender: ${selectedPat.gender}. Medical History: ${selectedPat.medical_history || 'None recorded'}.`
        }
      }

      const response = await dictationApi.transcribeAndReport(audioBlob, letterhead, patientContext)
      
      if (response.success && response.report) {
        setReport(response.report)
        // If AssemblyAI returned a more comprehensive transcript than real-time, use it!
        if (response.transcript) {
          setTranscript(response.transcript)
        }
        setStatusText('Report generated successfully!')
      } else {
        setErrorMsg(response.error || 'Failed to process clinical dictation.')
        setStatusText('Generation failed.')
      }
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.response?.data?.detail || 'An unexpected error occurred during report generation.')
      setStatusText('Error occurred.')
    } finally {
      setIsProcessing(false)
    }
  };

  // Generate and download/print the PDF
  const handlePrint = async () => {
    if (!report) return
    setPdfGenerating(true)
    try {
      const blob = await dictationApi.generatePdfFromReport(report, letterhead)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `MediScribe_Report_${report.patient_name.replace(/\s+/g, '_') || 'Patient'}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to generate PDF', err)
      alert('Failed to generate PDF for printing.')
    } finally {
      setPdfGenerating(false)
    }
  }

  return (
    <div className="fade-in" style={{ paddingBottom: 40 }}>
      {/* ── Header ─────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ fontSize: 'clamp(20px, 5vw, 28px)', color: 'var(--teal)' }}>Voice Dictation & Letterhead Reports</h1>
          <p className="page-subtitle">Speak out your clinical dictation, generate beautifully formatted medical reports, and print with your custom clinic letterhead instantly.</p>
        </div>
      </div>

      {/* ── Main Grid (responsive: side-by-side on desktop, stacked on mobile) ── */}
      <div className="dictation-layout" style={{ display: 'grid', gap: 24 }}>
        {/* ── LEFT: Input Panel ─────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Patient Context & Letterhead Setup */}
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={18} color="var(--teal)" />
              1. Setup Report Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Patient Selector */}
              <div className="form-group">
                <label className="form-label">Link Patient (Optional - enriches context)</label>
                <select 
                  className="form-control"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  style={{ height: 42 }}
                >
                  <option value="">-- Standard Dictation (No linked records) --</option>
                  {patients?.map((p: any) => (
                    <option key={p.patient_id} value={p.patient_id}>
                      {p.first_name} {p.last_name} ({p.gender}, DOB: {p.date_of_birth})
                    </option>
                  ))}
                </select>
              </div>

              {/* Letterhead File Upload */}
              <div className="form-group">
                <label className="form-label">Upload Clinic Letterhead (Header banner)</label>
                <div style={{
                  border: '2px dashed var(--border)',
                  borderRadius: 10,
                  padding: '16px 20px',
                  textAlign: 'center',
                  background: 'var(--surface-2)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'border 0.2s',
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const file = e.dataTransfer.files[0]
                    setLetterhead(file)
                    const reader = new FileReader()
                    reader.onloadend = () => setLetterheadPreview(reader.result as string)
                    reader.readAsDataURL(file)
                  }
                }}
                >
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleLetterheadChange}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0,
                      cursor: 'pointer',
                      width: '100%',
                      height: '100%',
                    }}
                  />
                  <Upload size={22} color="var(--text-3)" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 13, fontWeight: 500, margin: 0, color: 'var(--text-2)' }}>
                    {letterhead ? letterhead.name : 'Choose or drop letterhead image'}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 4 }}>Supports PNG, JPEG, GIF. Recommended wide aspect ratio.</p>
                </div>

                {letterheadPreview && (
                  <div style={{ marginTop: 12, border: '1px solid var(--border)', borderRadius: 8, padding: 8, background: '#fff' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', marginBottom: 6 }}>Letterhead Preview:</div>
                    <img 
                      src={letterheadPreview} 
                      alt="Letterhead Preview" 
                      style={{ width: '100%', maxHeight: 90, objectFit: 'contain', borderRadius: 4 }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Speak & Capture Voice */}
          <div className="card" style={{ padding: 22, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Volume2 size={18} color="var(--teal)" />
              2. Clinical Dictation
            </h3>

            {/* Glowing recording microphone */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0', gap: 12 }}>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`icon-box-premium ${isRecording ? 'recording' : ''}`}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  color: isRecording ? '#fff' : 'var(--teal)',
                  background: isRecording ? 'var(--grad-rose)' : 'var(--teal-light)',
                  border: isRecording ? 'none' : '2px solid var(--teal)',
                  cursor: 'pointer',
                  boxShadow: isRecording ? '0 0 20px rgba(244, 63, 94, 0.4)' : 'var(--shadow-sm)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
              </button>

              <div style={{ textAlign: 'center' }}>
                <span className={`badge ${isRecording ? 'badge-red animate-pulse' : 'badge-teal'}`} style={{ fontSize: 12, padding: '4px 12px' }}>
                  {isRecording ? '● Live Recording Active' : 'Microphone Idle'}
                </span>
                <p style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 8, maxWidth: 320 }}>
                  {statusText}
                </p>
              </div>
            </div>

            {/* Real-time Subtitles / Live speech display */}
            {(realtimeText || isRecording) && (
              <div style={{
                background: 'rgba(255, 239, 239, 0.4)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span className="pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--rose)' }} />
                  Live Caption Feed:
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-1)', fontStyle: 'italic', margin: 0 }}>
                  {realtimeText || 'Speaking out to listen...'}
                </p>
              </div>
            )}

            {/* Main Edit Transcripts */}
            <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Voice Transcript (Editable)</span>
                {transcript && (
                  <button onClick={handleClear} className="btn-ghost" style={{ padding: '0 4px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Trash2 size={12} /> Clear
                  </button>
                )}
              </label>
              <textarea
                className="form-control"
                placeholder="Click the microphone above and speak. Your voice transcript will appear here. You can also type or edit this text directly."
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                style={{ flex: 1, minHeight: 200, resize: 'vertical', fontSize: 13.5, lineHeight: 1.6 }}
              />
            </div>

            {errorMsg && (
              <div style={{
                background: 'var(--rose-light)',
                border: '1px solid #fecdd3',
                borderRadius: 8,
                padding: '10px 14px',
                color: 'var(--rose)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 16,
                fontSize: 13,
              }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action submit button */}
            {transcript && !isRecording && (
              <button
                disabled={isProcessing}
                onClick={async () => {
                  // Direct submit edited transcript
                  setIsProcessing(true);
                  setStatusText('AI is analysis and formatting...');
                  try {
                    // Let's create a dummy audio blob so we hit standard endpoint or simulate it
                    const blob = new Blob([transcript], { type: 'text/plain' });
                    await processAudio(blob);
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                className="btn btn-primary btn-lg"
                style={{
                  marginTop: 16,
                  width: '100%',
                  justifyContent: 'center',
                  background: 'var(--grad-teal)',
                  boxShadow: 'var(--shadow-teal)',
                }}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={16} className="spin" /> Formatting clinical notes...
                  </>
                ) : (
                  <>
                    Generate Branded Report <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* ── RIGHT: Report Preview ─────────────────────── */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
          <div style={{
            padding: '18px 22px 14px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface-2)',
            borderRadius: 'var(--radius) var(--radius) 0 0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="icon-box-premium" style={{ color: 'var(--teal)' }}>
                <FileText size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, margin: 0, fontWeight: 700 }}>
                  Report Preview
                </h3>
                <p style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>Interactive medical sheet preview</p>
              </div>
            </div>

            {report && (
              <button
                onClick={handlePrint}
                disabled={pdfGenerating}
                className="btn btn-primary btn-sm"
                style={{ borderRadius: 8 }}
              >
                {pdfGenerating ? (
                  <RefreshCw size={13} className="spin" />
                ) : (
                  <Printer size={13} />
                )}
                Print Branded PDF
              </button>
            )}
          </div>

          <div style={{ padding: 24, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {report ? (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                
                {/* Simulated Custom Branded PDF Page */}
                <div style={{
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  boxShadow: 'var(--shadow-sm)',
                  background: '#ffffff',
                  padding: 24,
                  color: '#1f2937',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                }}>
                  {/* Letterhead Preview Header */}
                  {letterheadPreview ? (
                    <div style={{ borderBottom: '2px solid var(--teal)', paddingBottom: 14, marginBottom: 16 }}>
                      <img src={letterheadPreview} alt="Branded Banner" style={{ width: '100%', maxHeight: 80, objectFit: 'contain' }} />
                    </div>
                  ) : (
                    <div style={{
                      border: '2px dashed var(--border)',
                      borderRadius: 8,
                      padding: '14px 20px',
                      textAlign: 'center',
                      background: 'var(--surface-hover)',
                      marginBottom: 16,
                      fontSize: 12,
                      color: 'var(--text-3)',
                    }}>
                      [Hospital/Clinic Letterhead Banner will render here]
                    </div>
                  )}

                  {/* Consultation Details */}
                  <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: 12, marginBottom: 16 }}>
                    <h2 style={{ fontSize: 18, color: 'var(--teal-darker)', fontWeight: 700, margin: '0 0 10px', textAlign: 'center', fontFamily: 'sans-serif' }}>
                      CLINICAL CONSULTATION SHEET
                    </h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px 16px', fontSize: 12, color: '#374151' }}>
                      <div><strong>Patient:</strong> {report.patient_name}</div>
                      <div><strong>Date:</strong> {report.date || new Date().toLocaleDateString()}</div>
                      <div><strong>Age / Gender:</strong> {report.patient_age || '—'} / {report.patient_gender || '—'}</div>
                      <div><strong>Consultant:</strong> {report.doctor_name || 'Dr. Practitioner'}</div>
                    </div>
                  </div>

                  {/* Editable Sections */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13, color: '#1f2937' }}>
                    
                    {report.indication && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', marginBottom: 3 }}>Indication</div>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={report.indication}
                          onChange={(e) => setReport({ ...report, indication: e.target.value })}
                          style={{ background: 'transparent', padding: '6px 10px', fontSize: 13 }}
                        />
                      </div>
                    )}

                    {report.history && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', marginBottom: 3 }}>History</div>
                        <textarea
                          className="form-control" 
                          value={report.history}
                          rows={3}
                          onChange={(e) => setReport({ ...report, history: e.target.value })}
                          style={{ background: 'transparent', padding: '8px 10px', fontSize: 13 }}
                        />
                      </div>
                    )}

                    {report.findings && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', marginBottom: 3 }}>Findings & Vitals</div>
                        <textarea
                          className="form-control" 
                          value={report.findings}
                          rows={3}
                          onChange={(e) => setReport({ ...report, findings: e.target.value })}
                          style={{ background: 'transparent', padding: '8px 10px', fontSize: 13 }}
                        />
                      </div>
                    )}

                    {report.impression && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', marginBottom: 3 }}>Diagnosis & Clinical Impression</div>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={report.impression}
                          onChange={(e) => setReport({ ...report, impression: e.target.value })}
                          style={{ background: 'transparent', padding: '6px 10px', fontSize: 13 }}
                        />
                      </div>
                    )}

                    {report.plan && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', marginBottom: 3 }}>Treatment Plan</div>
                        <textarea
                          className="form-control" 
                          value={report.plan}
                          rows={3}
                          onChange={(e) => setReport({ ...report, plan: e.target.value })}
                          style={{ background: 'transparent', padding: '8px 10px', fontSize: 13 }}
                        />
                      </div>
                    )}

                    {report.medications && report.medications.length > 0 && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', marginBottom: 3 }}>Prescribed Medications</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {report.medications.map((med, index) => (
                            <input 
                              key={index}
                              type="text" 
                              className="form-control" 
                              value={med}
                              onChange={(e) => {
                                const newMeds = [...report.medications]
                                newMeds[index] = e.target.value
                                setReport({ ...report, medications: newMeds })
                              }}
                              style={{ background: 'transparent', padding: '4px 8px', fontSize: 12.5 }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {report.follow_up && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', marginBottom: 3 }}>Follow-up</div>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={report.follow_up}
                          onChange={(e) => setReport({ ...report, follow_up: e.target.value })}
                          style={{ background: 'transparent', padding: '6px 10px', fontSize: 13 }}
                        />
                      </div>
                    )}

                    {report.notes && (
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', marginBottom: 3 }}>Additional Notes</div>
                        <textarea
                          className="form-control" 
                          value={report.notes}
                          rows={2}
                          onChange={(e) => setReport({ ...report, notes: e.target.value })}
                          style={{ background: 'transparent', padding: '8px 10px', fontSize: 13 }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Signatures */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32, borderTop: '1px solid #eee', paddingTop: 16 }}>
                    <div style={{ textAlign: 'center', fontSize: 11, color: '#6b7280', width: 200 }}>
                      <div style={{ borderBottom: '1px solid #ccc', height: 36, marginBottom: 6 }}></div>
                      Doctor Signature / Stamp
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePrint}
                  disabled={pdfGenerating}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {pdfGenerating ? (
                    <>
                      <RefreshCw size={16} className="spin" /> Exporting Branded Document...
                    </>
                  ) : (
                    <>
                      <Printer size={16} /> Print Branded PDF Report
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '80px 20px' }}>
                <div className="icon-box-premium" style={{ color: 'var(--text-4)', width: 54, height: 54, marginBottom: 12 }}>
                  <FileText size={24} />
                </div>
                <h3>No report generated yet</h3>
                <p style={{ maxWidth: 280, margin: '0 auto' }}>
                  Link a patient details, upload a custom letterhead branding, and record your dictation notes to begin.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
