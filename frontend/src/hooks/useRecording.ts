import {
  useRef,
  useCallback,
  useEffect,
  useState
} from 'react'

import toast from 'react-hot-toast'

import { useConsultationStore } from '@/store/consultationStore'
import { apiClient } from '@/api/client'

export function useRecording() {

  const {
    isRecording,
    startRecording,
    stopRecording,
    appendTranscript,
    tick,
  } = useConsultationStore()

  const timerRef =
  useRef<number | null>(null)

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null)

  const streamRef =
    useRef<MediaStream | null>(null)

  const audioChunksRef =
    useRef<Blob[]>([])

  const recorderMimeTypeRef =
    useRef('audio/webm')

  const audioContextRef =
    useRef<AudioContext | null>(null)

  const finalTranscriptRef = useRef('')
  
  const wsRef = useRef<WebSocket | null>(null)
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null)

  const [analyser, setAnalyser] =
    useState<AnalyserNode | null>(null)


  // START RECORDING
  const start = useCallback(async () => {

    try {

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        })

      streamRef.current = stream

      // Audio Visualization
      const audioContext = new (
        window.AudioContext ||
        (window as any).webkitAudioContext
      )({ sampleRate: 16000 })

      const source =
        audioContext.createMediaStreamSource(stream)

      const analyserNode =
        audioContext.createAnalyser()

      analyserNode.fftSize = 256
      source.connect(analyserNode)

      audioContextRef.current = audioContext
      setAnalyser(analyserNode)

      // Reset audio chunks
      audioChunksRef.current = []
      finalTranscriptRef.current = ''

      // AssemblyAI Real-Time WebSocket
      try {
        const { data } = await apiClient.get('/speech/assemblyai-token')
        const token = data.token

        const ws = new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`)
        wsRef.current = ws

        ws.onopen = () => {
          console.log('[AssemblyAI] WebSocket opened')
        }

        ws.onmessage = (message) => {
          const res = JSON.parse(message.data)
          if (res.message_type === 'PartialTranscript') {
            appendTranscript(`${finalTranscriptRef.current} ${res.text}`.trim())
          } else if (res.message_type === 'FinalTranscript') {
            finalTranscriptRef.current = `${finalTranscriptRef.current} ${res.text}`.trim()
            appendTranscript(finalTranscriptRef.current)
          }
        }

        ws.onerror = (error) => {
          console.error('[AssemblyAI] WebSocket error:', error)
        }

        ws.onclose = () => {
          console.log('[AssemblyAI] WebSocket closed')
          wsRef.current = null
        }

        // Setup ScriptProcessorNode for PCM streaming
        const processor = audioContext.createScriptProcessor(4096, 1, 1)
        audioProcessorRef.current = processor
        
        processor.onaudioprocess = (e) => {
          if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
          
          const channelData = e.inputBuffer.getChannelData(0)
          const pcm16 = new Int16Array(channelData.length)
          for (let i = 0; i < channelData.length; i++) {
            pcm16[i] = Math.max(-1, Math.min(1, channelData[i])) * 0x7FFF
          }
          
          const uint8 = new Uint8Array(pcm16.buffer)
          let binary = ''
          for (let i = 0; i < uint8.byteLength; i++) {
            binary += String.fromCharCode(uint8[i])
          }
          const base64 = btoa(binary)
          
          wsRef.current.send(JSON.stringify({ audio_data: base64 }))
        }
        
        source.connect(processor)
        processor.connect(audioContext.destination)
        
      } catch (err) {
        console.warn('[Recording] Could not start AssemblyAI Live Transcription:', err)
      }

      // Create media recorder
      const preferredMimeType = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus'
      ].find((type) => MediaRecorder.isTypeSupported(type))

      const mediaRecorder = preferredMimeType
        ? new MediaRecorder(stream, { mimeType: preferredMimeType })
        : new MediaRecorder(stream)

      recorderMimeTypeRef.current =
        mediaRecorder.mimeType || preferredMimeType || 'audio/webm'

      console.log('[Recording] MediaRecorder MIME:', recorderMimeTypeRef.current)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start(1000)
      mediaRecorderRef.current = mediaRecorder

      startRecording()
      timerRef.current = window.setInterval(tick, 1000)

      console.log('[Recording] Started')

    } catch (error) {
      console.error('[Recording] Error:', error)
      toast.error('Could not access microphone')
    }

  }, [appendTranscript, startRecording, tick])


  // STOP RECORDING — returns the audio Blob
  const stop = useCallback((): Promise<Blob> => {

    return new Promise((resolve) => {

      stopRecording()
      if (wsRef.current) {
        // Send termination message and close
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ terminate_session: true }))
        }
        wsRef.current.close()
        wsRef.current = null
      }
      if (audioProcessorRef.current) {
        audioProcessorRef.current.disconnect()
        audioProcessorRef.current = null
      }

      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {

        const recorder = mediaRecorderRef.current

        recorder.onstop = async () => {

          // Close AudioContext AFTER MediaRecorder has fully stopped
          // (closing it before stop() can silence the final chunk)
          if (audioContextRef.current) {
            audioContextRef.current.close()
            audioContextRef.current = null
            setAnalyser(null)
          }

          try {

            const audioBlob = new Blob(
              audioChunksRef.current,
              { type: recorderMimeTypeRef.current }
            )

            console.log(`[Recording] Stopped. Chunks: ${audioChunksRef.current.length}, Blob size: ${audioBlob.size} bytes`)

            if (audioBlob.size < 1000) {
              console.warn('[Recording] Audio blob is very small — microphone may not have captured audio')
            }

            resolve(audioBlob)

          } catch (error) {
            console.error('[Recording] Audio processing error:', error)
            toast.error('Audio processing failed')
            resolve(new Blob([], { type: recorderMimeTypeRef.current }))
          } finally {
            streamRef.current
              ?.getTracks()
              .forEach((track) => track.stop())
            streamRef.current = null
          }
        }

        if (recorder.state === 'recording') {
          recorder.requestData()
        }

        recorder.stop()

      } else {

        // Close AudioContext if MediaRecorder was already inactive
        if (audioContextRef.current) {
          audioContextRef.current.close()
          audioContextRef.current = null
          setAnalyser(null)
        }

        resolve(new Blob([], { type: recorderMimeTypeRef.current }))
      }

    })

  }, [stopRecording])


  // CLEANUP on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      if (audioProcessorRef.current) {
        audioProcessorRef.current.disconnect()
        audioProcessorRef.current = null
      }
      if (audioContextRef.current) audioContextRef.current.close()
      streamRef.current
        ?.getTracks()
        .forEach((track) => track.stop())
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])


  return {
    isRecording,
    start,
    stop,
    analyser
  }
}
