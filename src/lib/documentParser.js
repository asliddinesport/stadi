import mammoth from 'mammoth'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export async function extractTextFromFile(file) {
  const arrayBuffer = await file.arrayBuffer()
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items.map((it) => it.str).join(' ') + '\n'
    }
    return text.trim()
  }
  if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value.trim()
  }
  throw new Error('Поддерживаются только PDF и DOCX файлы')
}
