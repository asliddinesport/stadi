import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { listChats } from '../lib/chats'
import { useAuth } from './AuthContext'

const ChatContext = createContext({})

export function ChatProvider({ children }) {
  const { user } = useAuth()
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!user) { setChats([]); return }
    setLoading(true)
    try {
      const list = await listChats()
      setChats(list)
    } catch (e) {
      console.error('listChats error', e)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  return (
    <ChatContext.Provider
      value={{ chats, setChats, activeChatId, setActiveChatId, refresh, loading }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export const useChats = () => useContext(ChatContext)
