// node scripts/img.mjs -> src-images/*.jpg -> public/images/<name>-<w>.webp (+ prints sizes)
import sharp from 'sharp'
import fs from 'node:fs'
const src = 'src-images', out = 'public/images'
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true })
// per-image crop (left, top, width, height in source px) and widths
const cfg = {
  hero: { widths: [640, 1000], q: [58, 56] },
  interior: { widths: [480, 800] }, aircon: { widths: [480, 800] }, electrical: { widths: [480, 800] },
  reno: { widths: [480, 800], crop: { left: 0, top: 500, width: 2000, height: 2000 } }, site: { widths: [640, 1100], q: [55, 52] },
}
for (const f of fs.readdirSync(src)) {
  if (!/\.(jpe?g|png)$/i.test(f)) continue
  const n = f.replace(/\.\w+$/, ''); const c = cfg[n] || { widths: [480, 800] }
  for (const [k, w] of c.widths.entries()) {
    let s = sharp(`${src}/${f}`); if (c.crop) s = s.extract(c.crop)
    await s.resize({ width: w, withoutEnlargement: true }).webp({ quality: c.q ? c.q[k] : (w > 700 ? 66 : 64), effort: 6 }).toFile(`${out}/${n}-${w}.webp`)
  }
}
for (const f of fs.readdirSync(out)) { const m = await sharp(`${out}/${f}`).metadata(); console.log(f, m.width + 'x' + m.height, (fs.statSync(`${out}/${f}`).size / 1024).toFixed(0) + 'KB') }
