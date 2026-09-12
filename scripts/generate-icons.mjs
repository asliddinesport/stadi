import sharp from 'sharp'
import { mkdirSync } from 'fs'

mkdirSync('public/icons', { recursive: true })

const sizes = [192, 512]
const svg = 'public/pwa-icon.svg'

for (const size of sizes) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}x${size}.png`)
  console.log(`✅ icon-${size}x${size}.png`)
}
