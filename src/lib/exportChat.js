import { marked } from 'marked'

/**
 * Открывает новое окно с красиво свёрстанным чатом и вызывает печать.
 * Пользователь сохраняет как PDF через «Сохранить как PDF» в диалоге печати.
 */
export function exportChatToPDF({ messages, materialName, userName }) {
  const w = window.open('', '_blank')
  if (!w) {
    alert('Разрешите всплывающие окна, чтобы сохранить PDF')
    return
  }

  const items = messages
    .map((m) => {
      const role = m.role === 'user' ? 'Вопрос' : 'Стади'
      const body =
        m.role === 'user'
          ? escapeHtml(m.content)
          : marked.parse(m.content || '')
      return `
        <div class="msg ${m.role}">
          <div class="role">${role}</div>
          <div class="body">${body}</div>
        </div>`
    })
    .join('')

  const html = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <title>Чат со Стади</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, system-ui, sans-serif;
      color: #0f172a; max-width: 780px; margin: 40px auto; padding: 0 24px;
      line-height: 1.55;
    }
    h1 { font-size: 22px; margin: 0 0 6px; }
    .meta { color: #64748b; font-size: 13px; margin-bottom: 24px; }
    .msg {
      margin: 18px 0; padding: 14px 18px; border-radius: 14px;
      page-break-inside: avoid;
    }
    .msg.user { background: #eef2ff; }
    .msg.assistant { background: #f8fafc; border: 1px solid #e2e8f0; }
    .role { font-weight: 600; font-size: 12px; color: #4f6ef7; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em; }
    .body { font-size: 14px; }
    .body p { margin: 0.5em 0; }
    .body h1, .body h2, .body h3 { font-weight: 600; margin: 0.8em 0 0.4em; }
    .body h1 { font-size: 18px; } .body h2 { font-size: 16px; } .body h3 { font-size: 15px; }
    .body ul, .body ol { padding-left: 1.3em; margin: 0.5em 0; }
    .body code { background: #e2e8f0; padding: 1px 5px; border-radius: 4px; font-size: 0.85em; }
    .body pre { background: #0f172a; color: #e2e8f0; padding: 12px; border-radius: 8px; overflow-x: auto; }
    .body pre code { background: transparent; color: inherit; padding: 0; }
    .body blockquote { border-left: 3px solid #4f6ef7; margin: 0.6em 0; padding: 4px 12px; color: #475569; background: #f8fafc; }
    .body table { border-collapse: collapse; width: 100%; font-size: 13px; margin: 0.6em 0; }
    .body th, .body td { border: 1px solid #e2e8f0; padding: 6px 10px; text-align: left; }
    .body th { background: #f1f5f9; }
    @media print {
      body { margin: 0; padding: 20px; }
      .msg.user { background: #eef2ff; }
    }
  </style>
</head>
<body>
  <h1>Стади — беседа</h1>
  <div class="meta">
    Материал: <b>${escapeHtml(materialName || 'без материала')}</b><br>
    Пользователь: ${escapeHtml(userName || '')}<br>
    Дата: ${new Date().toLocaleString('ru-RU')}
  </div>
  ${items}
  <script>setTimeout(() => window.print(), 400)<\/script>
</body>
</html>`

  w.document.open()
  w.document.write(html)
  w.document.close()
  w.focus()
}

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
