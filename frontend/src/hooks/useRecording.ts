import {
  useRef,
  useCallback,
  useEffect,
  useState
} from 'react'

import toast from 'react-hot-toast'

import { useConsultationStore } from '@/store/consultationStore'

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

  const speechRecognitionRef =
    useRef<any>(null)

  const speechRecognitionWantedRef =
    useRef(false)

  const finalTranscriptRef =
    useRef('')

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

      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition

      if (SpeechRecognition) {
        speechRecognitionWantedRef.current = true

        const startLiveRecognition = () => {
          if (!speechRecognitionWantedRef.current) return

          const recognition = new SpeechRecognition()
          recognition.continuous = true
          recognition.interimResults = true
          recognition.lang = 'en-US'

          recognition.onresult = (event: any) => {
            let interimTranscript = ''

            for (let i = event.resultIndex; i < event.results.length; i += 1) {
              const text = event.results[i][0].transcript

              if (event.results[i].isFinal) {
                finalTranscriptRef.current = `${finalTranscriptRef.current} ${text}`.trim()
              } else {
                interimTranscript += text
              }
            }

            appendTranscript(
              `${finalTranscriptRef.current} ${interimTranscript}`.trim()
            )
          }

          recognition.onerror = (event: any) => {
            console.warn('[Recording] Live speech recognition error:', event.error)
          }

          recognition.onend = () => {
            speechRecognitionRef.current = null

            if (speechRecognitionWantedRef.current) {
              window.setTimeout(startLiveRecognition, 300)
            }
          }

          try {
            recognition.start()
            speechRecognitionRef.current = recognition
          } catch (error) {
            console.warn('[Recording] Could not start live speech recognition:', error)
          }
        }

        startLiveRecognition()
      } else {
        console.warn('[Recording] Live speech recognition is not supported by this browser')
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
      speechRecognitionWantedRef.current = false

      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop()
        } catch (error) {
          console.warn('[Recording] Could not stop live speech recognition:', error)
        }
        speechRecognitionRef.current = null
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
      speechRecognitionWantedRef.current = false
      if (speechRecognitionRef.current) speechRecognitionRef.current.stop()
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
