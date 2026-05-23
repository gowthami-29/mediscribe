import React, { useEffect, useRef, useState } from 'react';
import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import cornerstoneMath from 'cornerstone-math';
import dicomParser from 'dicom-parser';
import Hammer from 'hammerjs';
import { ZoomIn, Move, Ruler, Sun, Info } from 'lucide-react';
import { clsx } from 'clsx';

// Configure external dependencies for Cornerstone
cornerstoneTools.external.cornerstone = cornerstone;
cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
cornerstoneTools.external.Hammer = Hammer;
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

// Setup web workers for dicom-parser
try {
  cornerstoneWADOImageLoader.webWorkerManager.initialize({
    maxWebWorkers: navigator.hardwareConcurrency || 1,
    startWebWorkersOnDemand: true,
    taskConfiguration: {
      decodeTask: {
        initializeCodecsOnStartup: false,
        usePDFJS: false,
        strict: false,
      },
    },
  });
} catch (e) {
  console.warn("Cornerstone web worker already initialized", e);
}

interface DicomViewerProps {
  file?: File | null;
  imageUrl?: string; // Optional remote image URL
  metadata?: any;
}

export const DicomViewer: React.FC<DicomViewerProps> = ({ file, imageUrl, metadata }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [activeTool, setActiveTool] = useState<string>('Pan');
  const [showMetadata, setShowMetadata] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<boolean>(false);

  const isDicom = (file?.name.toLowerCase().endsWith('.dcm')) || 
                  (imageUrl && imageUrl.toLowerCase().endsWith('.dcm'));

  useEffect(() => {
    if (!isDicom && imageUrl) {
      setIsLoaded(true);
      return;
    }
    
    if (!viewerRef.current) return;

    // Enable the element
    cornerstone.enable(viewerRef.current);
    
    // Initialize tools
    try {
      cornerstoneTools.init({
        showSVGCursors: true,
      });
    } catch (e) {
      console.warn("Cornerstone Tools already initialized", e);
    }

    const element = viewerRef.current;

    // Add and activate tools safely (ignore if already added)
    try {
      cornerstoneTools.addTool(cornerstoneTools.WwwcTool, { name: 'Wwwc' });
      cornerstoneTools.addTool(cornerstoneTools.PanTool, { name: 'Pan' });
      cornerstoneTools.addTool(cornerstoneTools.ZoomTool, { name: 'Zoom' });
      cornerstoneTools.addTool(cornerstoneTools.LengthTool, { name: 'Length' });
    } catch(e) {
      // Ignore if tools already added on a re-render
    }

    cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 1 }); // Left click

    const loadImage = async () => {
      try {
        let imageId = '';
        if (file) {
          if (file.name.toLowerCase().endsWith('.dcm')) {
            imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
          }
        } else if (imageUrl && imageUrl.toLowerCase().endsWith('.dcm')) {
          imageId = `wadouri:${imageUrl}`; // WADO URI for remote dicom
        }

        if (imageId) {
          const image = await cornerstone.loadImage(imageId);
          cornerstone.displayImage(element, image);
          setIsLoaded(true);
        }
      } catch (err) {
        console.error("Failed to load DICOM:", err);
        setIsLoaded(true);
        setLoadError(true);
      }
    };

    loadImage();

    return () => {
      if (viewerRef.current) {
        cornerstone.disable(viewerRef.current);
      }
    };
  }, [file, imageUrl]);

  const handleToolActivate = (toolName: string) => {
    // Correct way to deactivate tools in cornerstone
    cornerstoneTools.setToolPassive('Pan');
    cornerstoneTools.setToolPassive('Wwwc');
    cornerstoneTools.setToolPassive('Zoom');
    cornerstoneTools.setToolPassive('Length');

    // Activate selected tool
    cornerstoneTools.setToolActive(toolName, { mouseButtonMask: 1 });
    setActiveTool(toolName);
  };



  return (
    <div className="relative w-full h-full flex flex-col bg-black overflow-hidden group">
      
      {/* Standard Image Rendering */}
      {!isDicom && (imageUrl || file) && (
        <div className="w-full h-full flex items-center justify-center bg-black">
          {file ? (
            <img src={URL.createObjectURL(file)} alt="Radiology Scan" className="max-w-full max-h-full object-contain" />
          ) : (
            <img src={imageUrl} alt="Radiology Scan" className="max-w-full max-h-full object-contain" />
          )}
        </div>
      )}

      {/* DICOM Viewer rendering */}
      {(isDicom || file) && (
        <div 
          ref={viewerRef}
          className="flex-1 w-full relative"
          style={{ height: '100%' }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Loading Overlay */}
          {!isLoaded && !loadError && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              <span className="animate-pulse">Loading DICOM File...</span>
            </div>
          )}
        </div>
      )}

      {/* Top HUD */}
      {isDicom && (
        <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start z-10 pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
            <button 
              onClick={() => handleToolActivate('Wwwc')}
              className={clsx("p-2 rounded-md shadow-lg transition-colors", activeTool === 'Wwwc' ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700')}
              title="Window/Level"
            >
              <Sun className="w-5 h-5" />
            </button>
            <button 
              onClick={() => handleToolActivate('Pan')}
              className={clsx("p-2 rounded-md shadow-lg transition-colors", activeTool === 'Pan' ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700')}
              title="Pan"
            >
              <Move className="w-5 h-5" />
            </button>
            <button 
              onClick={() => handleToolActivate('Zoom')}
              className={clsx("p-2 rounded-md shadow-lg transition-colors", activeTool === 'Zoom' ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700')}
              title="Zoom"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button 
              onClick={() => handleToolActivate('Length')}
              className={clsx("p-2 rounded-md shadow-lg transition-colors", activeTool === 'Length' ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700')}
              title="Measure Ruler"
            >
              <Ruler className="w-5 h-5" />
            </button>
          </div>

          <button 
            onClick={() => setShowMetadata(!showMetadata)}
            className={clsx("p-2 rounded-md shadow-lg transition-colors pointer-events-auto", showMetadata ? 'bg-indigo-600 text-white' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700')}
            title="DICOM Metadata"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Metadata Pane */}
      {showMetadata && metadata && (
        <div className="absolute right-0 top-14 bottom-0 w-64 bg-slate-900/95 backdrop-blur border-l border-slate-800 p-4 overflow-y-auto text-xs z-10 text-slate-300">
          <h3 className="text-white font-medium mb-3 uppercase tracking-wider text-xs">DICOM Tags</h3>
          <div className="space-y-2">
            {Object.entries(metadata).map(([key, value]) => (
              <div key={key} className="flex flex-col border-b border-slate-800 pb-1">
                <span className="text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="font-mono text-slate-200">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
