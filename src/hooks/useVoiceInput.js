import { useEffect, useRef, useState } from 'react'

export function useVoiceInput({ lang = 'ru-RU', onResult } = {}) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const recognitionRef = useRef(null)
  const onResultRef = useRef(onResult)

  useEffect(() => { onResultRef.current = onResult }, [onResult])

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    setSupported(true)
    const rec = new SR()
    rec.lang = lang
    rec.continuous = false
    rec.interimResults = true

    rec.onresult = (e) => {
      let text = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0].transcript
      }
      onResultRef.current?.(text)
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recognitionRef.current = rec

    return () => {
      try { rec.abort() } catch (_) {}
    }
  }, [lang])

  const start = () => {
    if (!recognitionRef.current || listening) return
    try {
      recognitionRef.current.start()
      setListening(true)
    } catch (_) {}
  }
  const stop = () => {
    try { recognitionRef.current?.stop() } catch (_) {}
    setListening(false)
  }

  return { supported, listening, start, stop }
}
