export function sanitizeText(input) {
  if (typeof input !== 'string') return input
  return input
    .replace(/\u0000/g, '')
    .replace(/[\uD800-\uDFFF]/g, '')
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '')
}
