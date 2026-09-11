import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY') ?? ''
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') ?? '*'

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY не задан в секретах Supabase')

    const body = await req.json()
    const { messages, model = 'openai/gpt-oss-20b', temperature = 0.3 } = body

    if (!Array.isArray(messages)) {
      throw new Error(`messages должен быть массивом, получено: ${typeof messages}`)
    }

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({ model, messages, temperature }),
    })

    const text = await res.text()
    if (!res.ok) console.error('Groq API Error:', res.status, text)

    return new Response(text, {
      status: res.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('CRITICAL ERROR:', e.message, e.stack)
    return new Response(
      JSON.stringify({ error: String(e.message ?? e), stack: String(e.stack ?? '') }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
