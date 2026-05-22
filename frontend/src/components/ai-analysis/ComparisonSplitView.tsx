import React, { useState, useEffect } from 'react';
import { DicomViewer } from './DicomViewer';
import { Clock, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import axios from 'axios';
import { clsx } from 'clsx';

interface ComparisonSplitViewProps {
  patientId: string;
  currentFile?: File | null;
  currentImageUrl?: string;
  currentMetadata?: any;
}

export const ComparisonSplitView: React.FC<ComparisonSplitViewProps> = ({ 
  patientId, 
  currentFile, 
  currentImageUrl, 
  currentMetadata 
}) => {
  const [history, setHistory] = useState<any[]>([]);
  const [selectedHistoricalScan, setSelectedHistoricalScan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // Assuming API URL is proxy-mapped or available directly
        const res = await axios.get(`/api/v1/radiology/patient-radiology-history/${patientId}`);
        if (res.data && res.data.history) {
          setHistory(res.data.history);
        }
      } catch (err) {
        console.error("Failed to fetch radiology history:", err);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchHistory();
    }
  }, [patientId]);

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4">
      {/* Current Scan Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <h3 className="text-slate-300 font-medium mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" /> 
          Current Scan
        </h3>
        <div className="flex-1 bg-slate-900/50 rounded-xl border border-slate-800/60 shadow-xl overflow-hidden">
          <DicomViewer 
            file={currentFile} 
            imageUrl={currentImageUrl} 
            metadata={currentMetadata} 
          />
        </div>
      </div>

      {/* Historical Comparison Column */}
      <div className="w-full lg:w-[450px] flex flex-col shrink-0">
        <h3 className="text-slate-300 font-medium mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" /> 
          Historical Comparison
        </h3>

        {selectedHistoricalScan ? (
          <div className="flex flex-col h-full gap-4">
            {/* Split viewport for historical image */}
            <div className="bg-slate-900/50 rounded-xl border border-slate-800/60 shadow-xl overflow-hidden h-[400px]">
              <DicomViewer 
                imageUrl={selectedHistoricalScan.image_url} 
                metadata={{
                  modality: selectedHistoricalScan.modality,
                  study_date: selectedHistoricalScan.study_date,
                  body_part: selectedHistoricalScan.body_part
                }} 
              />
            </div>
            
            {/* Comparison RAG Insights */}
            <div className="flex-1 bg-slate-900/50 rounded-xl border border-slate-800/60 p-4 overflow-y-auto">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <h4 className="text-sm font-semibold text-slate-200">Historical Findings</h4>
                <button 
                  onClick={() => setSelectedHistoricalScan(null)}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  View Timeline
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prior Impression</span>
                  <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                    {selectedHistoricalScan.impression}
                  </p>
                </div>
                
                {selectedHistoricalScan.comparison && (
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Previous Comparison</span>
                    <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                      {selectedHistoricalScan.comparison}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-slate-900/50 rounded-xl border border-slate-800/60 p-4 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <AlertTriangle className="w-10 h-10 text-slate-600 mb-3" />
                <h4 className="text-slate-300 font-medium">No Historical Scans</h4>
                <p className="text-slate-500 text-sm mt-1">This patient has no prior radiology reports on record.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-medium text-slate-400 mb-4 px-1 uppercase tracking-wider">
                  Select a prior scan to compare
                </p>
                {history.map((scan) => (
                  <button
                    key={scan.report_id}
                    onClick={() => setSelectedHistoricalScan(scan)}
                    className="w-full text-left p-4 rounded-lg bg-slate-800/40 hover:bg-slate-800 transition-colors border border-slate-700 hover:border-indigo-500/50 group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded text-xs font-medium border border-indigo-500/20">
                          {scan.modality || 'X-RAY'}
                        </span>
                        <span className="text-sm font-medium text-slate-200">
                          {scan.study_date || scan.created_at?.split(' ')[0]}
                        </span>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2">
                      {scan.impression || "No impression available."}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
