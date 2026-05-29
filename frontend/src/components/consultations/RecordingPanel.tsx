import { useState, useEffect, useRef } from 'react'

import { useMutation } from '@tanstack/react-query'

import { consultationsApi } from '@/api/consultations'

import { useRecording } from '@/hooks/useRecording'

import { useConsultationStore } from '@/store/consultationStore'

import {
  Mic,
  StopCircle,
  Loader2,
  Info
} from 'lucide-react'

import AudioVisualizer from './AudioVisualizer'

import toast from 'react-hot-toast'


interface Props {
  consultationId: string
  onComplete: () => void
}


export default function RecordingPanel({

  consultationId,
  onComplete

}: Props) {

  const {
    isRecording,
    start,
    stop,
    analyser
  } = useRecording()

  const {
    recSeconds,
    transcript,
    appendTranscript
  } = useConsultationStore()

  const [phase, setPhase] =
    useState<
      'idle' |
      'recording' |
      'stopping' |
      'done'
    >('idle')


  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }

  useEffect(() => {
    return () => stopPolling()
  }, [])

  const pollStatus = () => {
    if (pollIntervalRef.current) return

    pollIntervalRef.current = setInterval(async () => {
      try {
        const consultation = await consultationsApi.get(consultationId)
        
        if (consultation.status === 'completed') {
          stopPolling()
          if (consultation.transcription_text) {
            appendTranscript(consultation.transcription_text)
          }
          toast.success('Consultation completed and report generated!')
          setPhase('done')
          setTimeout(onComplete, 3000)
        } else if (consultation.status === 'failed' || consultation.status === 'failed_transcription' || consultation.status === 'failed_soap') {
          stopPolling()
          toast.error('Audio processing or AI generation failed. Please try again.')
          setPhase('idle')
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 5000)
  }

  // END CONSULTATION
  const endMut = useMutation({
    mutationFn: (audioBlob: Blob) =>
      consultationsApi.end(
        consultationId,
        audioBlob
      ),

    onSuccess: async () => {
      // Backend now returns processing status immediately
      toast.success('Audio uploaded. Processing in background...')
      pollStatus()
    },

    onError: (err: any) => {
      const detail = err.response?.data?.detail
      const msg = Array.isArray(detail)
        ? detail.map((d: any) => d.msg ?? JSON.stringify(d)).join(', ')
        : (typeof detail === 'string' ? detail : 'Failed to end consultation')

      toast.error(msg)
      setPhase('idle')
    },
  })


  // START RECORDING
  const handleStart = async () => {

    setPhase('recording')

    await start()
  }


  // STOP RECORDING
  const handleStop = async () => {

    setPhase('stopping')

    const audioBlob = await stop()

    if (audioBlob.size < 1000) {
      toast.error('Recording is empty. Please check microphone access and try again.')
      setPhase('idle')
      return
    }

    endMut.mutate(audioBlob)
  }


  // TIMER
  const minutes =
    Math.floor(recSeconds / 60)
      .toString()
      .padStart(2, '0')

  const seconds =
    (recSeconds % 60)
      .toString()
      .padStart(2, '0')


  return (

    <div style={{ padding: '8px 0' }}>

      {/* TIMER + VISUALIZER */}
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 20,
          boxShadow: 'var(--shadow-sm)'
        }}
      >

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 20
          }}
        >

          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              fontFamily: 'DM Sans, monospace',
              color: isRecording
                ? '#e74c3c'
                : 'var(--text-1)',
              transition: 'color 0.3s',
              letterSpacing: -1
            }}
          >

            {minutes}:{seconds}

          </div>

        </div>


        <AudioVisualizer
          analyser={analyser}
          isRecording={isRecording}
        />


        <div
          style={{
            textAlign: 'center',
            marginTop: 12
          }}
        >

          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: isRecording
                ? '#e74c3c'
                : 'var(--text-3)'
            }}
          >

            {phase === 'idle' &&
              'READY TO RECORD'}

            {phase === 'recording' && (
              <span
                className="pulse"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#e74c3c'
                  }}
                />

                LIVE RECORDING

              </span>
            )}

            {phase === 'stopping' &&
              'PROCESSING AUDIO...'}

            {phase === 'done' &&
              '✓ SESSION COMPLETE'}

          </div>

        </div>

      </div>


      {/* INFO BOX */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 14px',
          background: '#eff6ff',
          color: '#2563eb',
          borderRadius: 10,
          fontSize: 12,
          marginBottom: 20,
          border: '1px solid #bfdbfe'
        }}
      >

        <Info size={14} />

        Audio is processed using
        real AI transcription.

      </div>


      {/* LIVE TRANSCRIPT */}
      {(phase === 'recording' ||
        phase === 'stopping') && (

        <div
          style={{
            background: 'var(--surface-hover)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 18,
            marginBottom: 24,
            minHeight: 120,
            maxHeight: 180,
            overflowY: 'auto',
            fontSize: 14,
            lineHeight: 1.6,
            color: 'var(--text-2)',
          }}
        >

          {transcript ? (

            <div>{transcript}</div>

          ) : (

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                marginTop: 20
              }}
            >

              <Loader2
                size={20}
                className="spin"
                style={{
                  color: 'var(--text-4)'
                }}
              />

              <span
                style={{
                  color: 'var(--text-4)',
                  fontStyle: 'italic'
                }}
              >

                Listening for speech…

              </span>

            </div>
          )}

        </div>
      )}


      {/* FINAL TRANSCRIPT */}
      {phase === 'done' && transcript && (

        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 12,
            padding: 18,
            marginBottom: 24,
            fontSize: 14,
            lineHeight: 1.6,
            color: '#166534',
          }}
        >

          <div
            style={{
              fontWeight: 700,
              marginBottom: 8,
              fontSize: 12,
              textTransform: 'uppercase',
              opacity: 0.7
            }}
          >

            Final Transcript

          </div>

          {transcript}

        </div>
      )}


      {/* BUTTONS */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center'
        }}
      >

        {phase === 'idle' && (

          <button
            onClick={handleStart}
            className="btn btn-primary"
            style={{
              padding: '14px 40px',
              borderRadius: 12,
              fontSize: 15
            }}
          >

            <Mic size={18} />

            Start Session

          </button>
        )}


        {phase === 'recording' && (

          <button
            onClick={handleStop}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 40px',
              background: '#e74c3c',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow:
                '0 4px 12px rgba(231, 76, 60, 0.3)'
            }}
          >

            <StopCircle size={18} />

            Stop & Generate SOAP

          </button>
        )}


        {phase === 'stopping' && (

          <button
            disabled
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 40px',
              background: 'var(--border)',
              color: 'var(--text-3)',
              border: 'none',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'not-allowed',
            }}
          >

            <Loader2
              size={18}
              className="spin"
            />

            Processing Audio...

          </button>
        )}

      </div>

    </div>
  )
}
