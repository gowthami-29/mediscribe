import React, {
  useEffect,
  useRef,
  useState
} from 'react'

import cornerstone from 'cornerstone-core'
import cornerstoneTools from 'cornerstone-tools'
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'
import cornerstoneMath from 'cornerstone-math'
import dicomParser from 'dicom-parser'
import Hammer from 'hammerjs'

import {
  ZoomIn,
  Move,
  Ruler,
  Sun,
  Info,
  RotateCcw
} from 'lucide-react'

import { clsx } from 'clsx'

cornerstoneTools.external.cornerstone =
  cornerstone

cornerstoneTools.external.cornerstoneMath =
  cornerstoneMath

cornerstoneTools.external.Hammer =
  Hammer

cornerstoneWADOImageLoader.external.cornerstone =
  cornerstone

cornerstoneWADOImageLoader.external.dicomParser =
  dicomParser

try {

  cornerstoneWADOImageLoader
    .webWorkerManager
    .initialize({

      maxWebWorkers:
        navigator.hardwareConcurrency || 1,

      startWebWorkersOnDemand: true,

      taskConfiguration: {

        decodeTask: {

          initializeCodecsOnStartup: false,

          usePDFJS: false,

          strict: false
        }
      }
    })

} catch (e) {

  console.warn(
    'Cornerstone workers already initialized'
  )
}

interface DicomViewerProps {

  file?: File | null

  imageUrl?: string

  metadata?: any
}

export const DicomViewer:
React.FC<DicomViewerProps> = ({
  file,
  imageUrl,
  metadata
}) => {

  const viewerRef =
    useRef<HTMLDivElement>(null)

  const [
    activeTool,
    setActiveTool
  ] = useState('Pan')

  const [
    showMetadata,
    setShowMetadata
  ] = useState(false)

  const [
    isLoaded,
    setIsLoaded
  ] = useState(false)

  const [
    loadError,
    setLoadError
  ] = useState(false)

  const isDicom =
    (
      file?.name
        .toLowerCase()
        .endsWith('.dcm')
    ) ||
    (
      imageUrl &&
      imageUrl
        .toLowerCase()
        .endsWith('.dcm')
    )

  const initializeTools = () => {

    const added =
      (
        window as any
      ).__cornerstoneToolsAdded

    if (added) return

    try {

      cornerstoneTools.init({
        showSVGCursors: true
      })

    } catch (e) {

      console.warn(
        'CornerstoneTools already initialized'
      )
    }

    cornerstoneTools.addTool(
      cornerstoneTools.WwwcTool
    )

    cornerstoneTools.addTool(
      cornerstoneTools.PanTool
    )

    cornerstoneTools.addTool(
      cornerstoneTools.ZoomTool
    )

    cornerstoneTools.addTool(
      cornerstoneTools.LengthTool
    )

    ;(
      window as any
    ).__cornerstoneToolsAdded = true
  }

  useEffect(() => {

    if (
      !isDicom &&
      imageUrl
    ) {

      setIsLoaded(true)

      return
    }

    if (!viewerRef.current)
      return

    const element =
      viewerRef.current

    cornerstone.enable(element)

    initializeTools()

    cornerstoneTools.setToolActive(
      'Pan',
      {
        mouseButtonMask: 1
      }
    )

    const loadImage =
      async () => {

        try {

          let imageId = ''

          if (file) {

            if (
              file.name
                .toLowerCase()
                .endsWith('.dcm')
            ) {

              imageId =
                cornerstoneWADOImageLoader
                  .wadouri
                  .fileManager
                  .add(file)
            }
          }

          else if (
            imageUrl &&
            imageUrl
              .toLowerCase()
              .endsWith('.dcm')
          ) {

            imageId =
              `wadouri:${imageUrl}`
          }

          if (imageId) {

            const image =
              await cornerstone
                .loadImage(imageId)

            cornerstone.displayImage(
              element,
              image
            )

            // Add stack state

            cornerstoneTools.addStackStateManager(
              element,
              ['stack']
            )

            cornerstoneTools.addToolState(
              element,
              'stack',
              {
                currentImageIdIndex: 0,
                imageIds: [imageId]
              }
            )

            // Default active tools

            cornerstoneTools.setToolActive(
              'Pan',
              {
                mouseButtonMask: 1
              }
            )

            cornerstoneTools.setToolActive(
              'Zoom',
              {
                mouseButtonMask: 2
              }
            )

            cornerstoneTools.setToolActive(
              'Wwwc',
              {
                mouseButtonMask: 4
              }
            )

            setIsLoaded(true)
          }

        } catch (err) {

          console.error(
            'Failed to load DICOM:',
            err
          )

          setLoadError(true)

          setIsLoaded(true)
        }
      }

    loadImage()

    return () => {

      try {

        cornerstone.disable(
          element
        )

      } catch (e) {

        console.warn(e)
      }
    }

  }, [file, imageUrl])

  const handleToolActivate = (
    toolName: string
  ) => {

    cornerstoneTools.setToolPassive(
      'Pan'
    )

    cornerstoneTools.setToolPassive(
      'Wwwc'
    )

    cornerstoneTools.setToolPassive(
      'Zoom'
    )

    cornerstoneTools.setToolPassive(
      'Length'
    )

    cornerstoneTools.setToolActive(
      toolName,
      {
        mouseButtonMask: 1
      }
    )

    setActiveTool(toolName)
  }

  const handleResetViewport = () => {

    if (!viewerRef.current)
      return

    const viewport =
      cornerstone.getDefaultViewport(
        viewerRef.current,
        cornerstone.getImage(
          viewerRef.current
        )
      )

    cornerstone.setViewport(
      viewerRef.current,
      viewport
    )
  }

  return (

    <div
      className="
        relative
        w-full
        h-full
        flex
        flex-col
        bg-black
        overflow-hidden
      "
    >

      {/* Standard Image */}

      {!isDicom &&
        (imageUrl || file) && (

        <div
          className="
            w-full
            h-full
            flex
            items-center
            justify-center
            bg-black
          "
        >

          {file ? (

            <img
              src={URL.createObjectURL(file)}
              alt="Radiology Scan"
              className="
                max-w-full
                max-h-full
                object-contain
              "
            />

          ) : (

            <img
              src={imageUrl}
              alt="Radiology Scan"
              className="
                max-w-full
                max-h-full
                object-contain
              "
            />

          )}

        </div>

      )}

      {/* DICOM Viewer */}

      {(isDicom || file) && (

        <div
          ref={viewerRef}
          className="
            flex-1
            w-full
            relative
            bg-black
          "
          style={{
            height: '100%'
          }}
          onContextMenu={(e) =>
            e.preventDefault()
          }
        >

          {!isLoaded &&
            !loadError && (

            <div
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                text-slate-400
              "
            >

              <span
                className="
                  animate-pulse
                "
              >
                Loading DICOM...
              </span>

            </div>

          )}

        </div>

      )}

      {/* Toolbar */}

      {isDicom && (

        <div
          className="
            absolute
            top-3
            left-3
            flex
            gap-2
            z-20
          "
        >

          {[
            {
              icon: Sun,
              tool: 'Wwwc',
              title: 'Window Level'
            },
            {
              icon: Move,
              tool: 'Pan',
              title: 'Pan'
            },
            {
              icon: ZoomIn,
              tool: 'Zoom',
              title: 'Zoom'
            },
            {
              icon: Ruler,
              tool: 'Length',
              title: 'Measure'
            }
          ].map((item) => (

            <button
              key={item.tool}

              onClick={() =>
                handleToolActivate(
                  item.tool
                )
              }

              className={clsx(
                `
                p-2
                rounded-lg
                backdrop-blur
                transition-all
                border
                `,
                activeTool === item.tool
                  ? `
                    bg-indigo-600
                    border-indigo-400
                    text-white
                  `
                  : `
                    bg-slate-900/70
                    border-slate-700
                    text-slate-300
                    hover:bg-slate-800
                  `
              )}

              title={item.title}
            >

              <item.icon
                className="w-5 h-5"
              />

            </button>

          ))}

          {/* Reset */}

          <button
            onClick={handleResetViewport}

            className="
              p-2
              rounded-lg
              bg-slate-900/70
              border
              border-slate-700
              text-slate-300
              hover:bg-slate-800
              transition-all
            "

            title="Reset View"
          >

            <RotateCcw
              className="w-5 h-5"
            />

          </button>

          {/* Metadata */}

          <button
            onClick={() =>
              setShowMetadata(
                !showMetadata
              )
            }

            className={clsx(
              `
              p-2
              rounded-lg
              border
              transition-all
              `,
              showMetadata
                ? `
                  bg-indigo-600
                  border-indigo-400
                  text-white
                `
                : `
                  bg-slate-900/70
                  border-slate-700
                  text-slate-300
                `
            )}

            title="Metadata"
          >

            <Info
              className="w-5 h-5"
            />

          </button>

        </div>

      )}

      {/* Metadata Panel */}

      {showMetadata &&
        metadata && (

        <div
          className="
            absolute
            right-0
            top-0
            bottom-0
            w-72
            bg-slate-900/95
            border-l
            border-slate-700
            p-4
            overflow-y-auto
            z-30
          "
        >

          <h3
            className="
              text-white
              text-sm
              font-semibold
              mb-4
              uppercase
              tracking-wide
            "
          >
            DICOM Metadata
          </h3>

          <div
            className="
              space-y-3
            "
          >

            {Object.entries(metadata)
              .map(([key, value]) => (

              <div
                key={key}

                className="
                  border-b
                  border-slate-800
                  pb-2
                "
              >

                <div
                  className="
                    text-slate-500
                    text-xs
                    capitalize
                    mb-1
                  "
                >
                  {
                    key.replace(
                      /_/g,
                      ' '
                    )
                  }
                </div>

                <div
                  className="
                    text-slate-200
                    text-xs
                    break-all
                    font-mono
                  "
                >
                  {String(value)}
                </div>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>
  )
}