import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, FileImage } from 'lucide-react'
import { DicomViewer } from '@/components/ai-analysis/DicomViewer'
import RadiologyPanel from '@/components/ai-analysis/RadiologyPanel'
import { ComparisonSplitView } from '@/components/ai-analysis/ComparisonSplitView'

export default function RadiologyViewerPage() {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [patientId, setPatientId] = useState<string>('')
  const [showComparison, setShowComparison] = useState(false)

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#0f172a' }}>
      {/* Main Viewport */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Header Overlay */}
        <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 50, display: 'flex', gap: 12 }}>
          <button 
            onClick={() => navigate(-1)} 
            className="btn" 
            style={{ 
              background: 'rgba(15, 23, 42, 0.7)', 
              color: 'white', 
              border: '1px solid rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(8px)',
              padding: '8px 16px'
            }}
          >
            <ChevronLeft size={16} /> Back
          </button>
        </div>
        
        {showComparison && patientId && selectedFile ? (
          <div style={{ flex: 1, padding: '70px 24px 24px', overflowY: 'auto' }}>
            <div style={{ background: 'var(--surface)', borderRadius: 16, padding: 24, minHeight: '100%' }}>
              <ComparisonSplitView patientId={patientId} currentFile={selectedFile} />
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, padding: '70px 24px 24px', display: 'flex', flexDirection: 'column' }}>
             {selectedFile ? (
               <div style={{ flex: 1, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                 <DicomViewer file={selectedFile} />
               </div>
             ) : (
               <div style={{ 
                 flex: 1, 
                 display: 'flex', 
                 flexDirection: 'column',
                 alignItems: 'center', 
                 justifyContent: 'center', 
                 color: '#64748b', 
                 border: '2px dashed rgba(255,255,255,0.1)', 
                 borderRadius: 16,
                 background: 'rgba(0,0,0,0.2)'
               }}>
                  <FileImage size={48} style={{ opacity: 0.5, marginBottom: 16 }} />
                  <div style={{ fontSize: 16, fontWeight: 500, color: '#94a3b8' }}>Upload a DICOM or image file to begin</div>
                  <div style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>Use the sidebar controls to link a patient and load a scan</div>
               </div>
             )}
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div style={{ 
        width: 450, 
        minWidth: 450,
        background: 'var(--surface)', 
        borderLeft: '1px solid var(--border)', 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '-4px 0 15px rgba(0,0,0,0.05)',
        zIndex: 40
      }}>
        <RadiologyPanel 
           selectedFile={selectedFile} 
           setSelectedFile={setSelectedFile}
           patientId={patientId}
           setPatientId={setPatientId}
           showComparison={showComparison}
           setShowComparison={setShowComparison}
        />
      </div>
    </div>
  )
}
