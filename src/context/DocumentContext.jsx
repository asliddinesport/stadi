import { createContext, useContext, useEffect, useState } from 'react'

const DocumentContext = createContext({})

export function DocumentProvider({ children }) {
  const [activeMaterial, setActiveMaterial] = useState(() => {
    try {
      const saved = localStorage.getItem('stadi-active-material')
      return saved ? JSON.parse(saved) : null
    } catch (_) {
      return null
    }
  })

  useEffect(() => {
    try {
      if (activeMaterial) {
        localStorage.setItem('stadi-active-material', JSON.stringify(activeMaterial))
      } else {
        localStorage.removeItem('stadi-active-material')
      }
    } catch (_) { /* ignore */ }
  }, [activeMaterial])

  return (
    <DocumentContext.Provider value={{ activeMaterial, setActiveMaterial }}>
      {children}
    </DocumentContext.Provider>
  )
}

export const useDocument = () => useContext(DocumentContext)
