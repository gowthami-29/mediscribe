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
    setLiveText,
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
  const sessionReadyRef = useRef(false)

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

        const ws = new WebSocket(`wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&speech_model=universal-streaming-english&format_turns=true&token=${token}`)
        wsRef.current = ws

        ws.onopen = () => {
          console.log('[AssemblyAI] WebSocket opened')
        }

        ws.onmessage = (message) => {
          const res = JSON.parse(message.data)
          
          if (res.error) {
            console.error('[AssemblyAI] Error:', res.error)
            toast.error('Live transcription error: ' + res.error)
            return
          }

          // v3 session start — field is "type", not "message_type"
          if (res.type === 'Begin') {
            console.log('[AssemblyAI] Session ready (v3)')
            sessionReadyRef.current = true
            return
          }

          // v3 Turn messages: transcript accumulates words progressively within a turn.
          // end_of_turn=false → partial (live preview), end_of_turn=true → turn complete.
          if (res.type === 'Turn') {
            const turnText: string = res.transcript || ''
            if (!res.end_of_turn) {
              // Partial — show the growing text as live caption
              setLiveText(turnText)
            } else if (turnText) {
              // Turn complete — commit to the permanent transcript, clear live caption
              finalTranscriptRef.current = `${finalTranscriptRef.current} ${turnText}`.trim()
              appendTranscript(finalTranscriptRef.current)
              // appendTranscript already clears liveText via the store action
            }
          }
        }

        ws.onerror = (error) => {
          console.error('[AssemblyAI] WebSocket error:', error)
          toast.error('Live transcription connection error')
        }

        ws.onclose = () => {
          console.log('[AssemblyAI] WebSocket closed')
          wsRef.current = null
          sessionReadyRef.current = false
        }

        // Setup ScriptProcessorNode for PCM streaming
        const processor = audioContext.createScriptProcessor(4096, 1, 1)
        audioProcessorRef.current = processor
        
        processor.onaudioprocess = (e) => {
          if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !sessionReadyRef.current) return
          
          const channelData = e.inputBuffer.getChannelData(0)
          const pcm16 = new Int16Array(channelData.length)
          for (let i = 0; i < channelData.length; i++) {
            pcm16[i] = Math.max(-1, Math.min(1, channelData[i])) * 0x7FFF
          }
          
          // AssemblyAI v3 expects raw binary audio data (pcm_s16le)
          wsRef.current.send(pcm16.buffer)
        }
        
        // Prevent audio feedback loop (echo)
        const gainNode = audioContext.createGain()
        gainNode.gain.value = 0
        source.connect(processor)
        processor.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
      } catch (err: any) {
        console.warn('[Recording] Could not start AssemblyAI Live Transcription:', err)
        toast.error('Live transcription unavailable: ' + (err.response?.data?.detail || err.message))
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

  }, [appendTranscript, setLiveText, startRecording, tick])


  // STOP RECORDING — returns the audio Blob
  const stop = useCallback((): Promise<Blob> => {

    return new Promise((resolve) => {

      stopRecording()
      if (wsRef.current) {
        // Send termination message and close (v3 format)
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'Terminate' }))
        }
        wsRef.current.close()
        wsRef.current = null
        sessionReadyRef.current = false
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
