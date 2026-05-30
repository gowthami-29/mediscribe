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

  const timerRef          = useRef<number | null>(null)
  const mediaRecorderRef  = useRef<MediaRecorder | null>(null)
  const streamRef         = useRef<MediaStream | null>(null)
  const audioChunksRef    = useRef<Blob[]>([])
  const recorderMimeRef   = useRef('audio/webm')
  const audioContextRef   = useRef<AudioContext | null>(null)
  const workletNodeRef    = useRef<AudioWorkletNode | null>(null)
  const finalTextRef      = useRef('')
  const wsRef             = useRef<WebSocket | null>(null)
  const sessionReadyRef   = useRef(false)

  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)


  // ─── START ────────────────────────────────────────────────────────────────
  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      streamRef.current = stream

      // AudioContext at 16 kHz — matches AssemblyAI requirement
      const ctx = new AudioContext({ sampleRate: 16000 })
      audioContextRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)

      // Analyser for the waveform visualiser
      const analyserNode = ctx.createAnalyser()
      analyserNode.fftSize = 256
      source.connect(analyserNode)
      setAnalyser(analyserNode)

      // Reset state
      audioChunksRef.current = []
      finalTextRef.current   = ''

      // ── AssemblyAI v3 WebSocket ──────────────────────────────────────────
      try {
        const { data } = await apiClient.get('/speech/assemblyai-token')
        const token: string = data.token

        const wsUrl =
          `wss://streaming.assemblyai.com/v3/ws` +
          `?sample_rate=16000` +
          `&speech_model=universal-streaming-english` +
          `&format_turns=true` +
          `&token=${token}`

        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          console.log('[AssemblyAI] WebSocket connected')
        }

        ws.onmessage = (evt) => {
          let msg: any
          try { msg = JSON.parse(evt.data) } catch { return }

          if (msg.error) {
            console.error('[AssemblyAI] error:', msg.error)
            toast.error('Transcription error: ' + msg.error)
            return
          }

          if (msg.type === 'Begin') {
            console.log('[AssemblyAI] Session ready — id:', msg.id)
            sessionReadyRef.current = true
            return
          }

          if (msg.type === 'Turn') {
            const text: string = msg.transcript || ''
            if (!msg.end_of_turn) {
              // Partial — update live caption
              setLiveText(text)
            } else if (text) {
              // Turn complete — commit to transcript
              finalTextRef.current = `${finalTextRef.current} ${text}`.trim()
              appendTranscript(finalTextRef.current)
            }
          }
        }

        ws.onerror = () => {
          console.error('[AssemblyAI] WebSocket error')
          toast.error('Live transcription connection error')
        }

        ws.onclose = (evt) => {
          console.log('[AssemblyAI] WebSocket closed', evt.code, evt.reason)
          wsRef.current       = null
          sessionReadyRef.current = false
        }

        // ── AudioWorklet PCM pipeline ──────────────────────────────────────
        // Load the processor from /public (served at root)
        await ctx.audioWorklet.addModule('/pcm-processor.js')

        const worklet = new AudioWorkletNode(ctx, 'pcm-processor')
        workletNodeRef.current = worklet

        worklet.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
          if (
            wsRef.current &&
            wsRef.current.readyState === WebSocket.OPEN &&
            sessionReadyRef.current
          ) {
            wsRef.current.send(e.data)
          }
        }

        // source → analyser → worklet → (silent destination)
        source.connect(worklet)
        worklet.connect(ctx.destination)   // must be connected or Chrome suspends it

      } catch (err: any) {
        console.warn('[Recording] AssemblyAI setup failed:', err)
        toast.error(
          'Live transcription unavailable: ' +
          (err?.response?.data?.detail ?? err?.message ?? 'unknown error')
        )
      }

      // ── MediaRecorder (for final batch upload) ───────────────────────────
      const mime = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
      ].find(MediaRecorder.isTypeSupported)

      const recorder = mime
        ? new MediaRecorder(stream, { mimeType: mime })
        : new MediaRecorder(stream)

      recorderMimeRef.current = recorder.mimeType || mime || 'audio/webm'
      console.log('[Recording] MIME:', recorderMimeRef.current)

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      recorder.start(1000)
      mediaRecorderRef.current = recorder

      startRecording()
      timerRef.current = window.setInterval(tick, 1000)
      console.log('[Recording] Started')

    } catch (err) {
      console.error('[Recording] Failed to start:', err)
      toast.error('Could not access microphone')
    }
  }, [appendTranscript, setLiveText, startRecording, tick])


  // ─── STOP ─────────────────────────────────────────────────────────────────
  const stop = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {

      stopRecording()

      // Close WebSocket gracefully
      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'Terminate' }))
        }
        wsRef.current.close()
        wsRef.current       = null
        sessionReadyRef.current = false
      }

      // Disconnect worklet
      if (workletNodeRef.current) {
        workletNodeRef.current.disconnect()
        workletNodeRef.current = null
      }

      // Stop timer
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }

      const recorder = mediaRecorderRef.current

      if (recorder && recorder.state !== 'inactive') {

        recorder.onstop = () => {
          // Close AudioContext after recorder fully stops
          if (audioContextRef.current) {
            audioContextRef.current.close()
            audioContextRef.current = null
            setAnalyser(null)
          }

          const blob = new Blob(audioChunksRef.current, {
            type: recorderMimeRef.current,
          })
          console.log(
            `[Recording] Stopped — chunks: ${audioChunksRef.current.length}, size: ${blob.size} bytes`
          )
          if (blob.size < 1000) {
            console.warn('[Recording] Blob very small — mic may not have captured audio')
          }

          streamRef.current?.getTracks().forEach((t) => t.stop())
          streamRef.current = null

          resolve(blob)
        }

        if (recorder.state === 'recording') recorder.requestData()
        recorder.stop()

      } else {
        if (audioContextRef.current) {
          audioContextRef.current.close()
          audioContextRef.current = null
          setAnalyser(null)
        }
        streamRef.current?.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        resolve(new Blob([], { type: recorderMimeRef.current }))
      }
    })
  }, [stopRecording])


  // ─── CLEANUP on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null }
      if (workletNodeRef.current) { workletNodeRef.current.disconnect(); workletNodeRef.current = null }
      if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null }
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (mediaRecorderRef.current?.state !== 'inactive') {
        mediaRecorderRef.current?.stop()
      }
    }
  }, [])


  return { isRecording, start, stop, analyser }
}
