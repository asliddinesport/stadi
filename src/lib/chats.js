import { supabase } from './supabase'
import { sanitizeText } from './sanitize'

export async function listChats() {
  const { data, error } = await supabase
    .from('chats')
    .select('id, title, material_name, created_at, updated_at')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function loadChat(chatId) {
  const [chatRes, msgRes] = await Promise.all([
    supabase.from('chats').select('*').eq('id', chatId).single(),
    supabase
      .from('messages')
      .select('id, role, content, sources, created_at')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true }),
  ])
  if (chatRes.error) throw chatRes.error
  if (msgRes.error) throw msgRes.error
  return { chat: chatRes.data, messages: msgRes.data || [] }
}

export async function createChat({ userId, material }) {
  const { data, error } = await supabase
    .from('chats')
    .insert({
      user_id: userId,
      title: material ? sanitizeText(material.name).slice(0, 60) : 'Новый чат',
      material_name: material?.name ? sanitizeText(material.name) : null,
      material_text: material?.text ? sanitizeText(material.text.slice(0, 200000)) : null,
      material_size: material?.size || null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateChat(chatId, patch) {
  const clean = { ...patch }
  if (typeof clean.title === 'string') clean.title = sanitizeText(clean.title)
  const { error } = await supabase
    .from('chats')
    .update({ ...clean, updated_at: new Date().toISOString() })
    .eq('id', chatId)
  if (error) throw error
}

export async function deleteChat(chatId) {
  const { error } = await supabase.from('chats').delete().eq('id', chatId)
  if (error) throw error
}

export async function addMessage({ chatId, userId, role, content, sources = [] }) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      chat_id: chatId,
      user_id: userId,
      role,
      content: sanitizeText(content),
      sources: (sources || []).map(sanitizeText),
    })
    .select()
    .single()
  if (error) throw error
  await supabase
    .from('chats')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', chatId)
  return data
}

export function autoTitle(question) {
  const t = sanitizeText(question).trim().replace(/\s+/g, ' ')
  return t.length > 50 ? t.slice(0, 50) + '…' : t
}
