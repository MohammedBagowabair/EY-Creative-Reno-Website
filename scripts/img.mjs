// node scripts/img.mjs -> src-images/*.jpg -> public/images/<name>-<w>.webp (+ prints sizes)
import sharp from 'sharp'
import fs from 'node:fs'
const src = 'src-images', out = 'public/images'
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true })
// [output name, source file, crop {left, top, width, height}, widths, quality]
const jobs = [
  ['hero', 'hero', { left: 330, top: 0, width: 1010, height: 1125 }, [720, 1100], 60],
  ['hero-m', 'hero', { left: 160, top: 0, width: 1500, height: 1125 }, [560, 800], 56],
  ['aircon', 'aircon', { left: 880, top: 0, width: 1120, height: 1400 }, [420, 640], 62],
  ['electrical', 'electrical', { left: 260, top: 0, width: 1200, height: 1500 }, [420, 640], 60],
  ['reno', 'reno', { left: 0, top: 420, width: 2000, height: 2500 }, [420, 640], 62],
  ['interior', 'interior', { left: 520, top: 0, width: 900, height: 1125 }, [420, 640], 62],
]
for (const [n, f, crop, widths, q] of jobs) for (const w of widths)
  await sharp(`${src}/${f}.jpg`).extract(crop).resize({ width: w }).webp({ quality: q, effort: 6 }).toFile(`${out}/${n}-${w}.webp`)
for (const f of fs.readdirSync(out)) { const m = await sharp(`${out}/${f}`).metadata(); console.log(f, m.width + 'x' + m.height, (fs.statSync(`${out}/${f}`).size / 1024).toFixed(0) + 'KB') }
