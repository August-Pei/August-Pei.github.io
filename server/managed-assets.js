import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'

const types = {
  '.pdf': 'application/pdf', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.json': 'application/json; charset=utf-8', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.m4a': 'audio/mp4', '.ogg': 'audio/ogg', '.flac': 'audio/flac',
}

// These files are excluded from Vite's watcher to preserve drafts in the manager.
// Serve them directly because newly uploaded files are absent from Vite's public-file cache.
export function managedAssets(projectRoot) {
  return async (req, res, next) => {
    if (!['GET', 'HEAD'].includes(req.method)) return next()
    let pathname
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname) } catch { return next() }
    if (pathname.includes('..')) return next()
    if (!['/site-content.json', '/overall-data.json', '/resume.json'].includes(pathname)
      && !/^\/resume\/[^/\\]+\.(pdf|docx)$/i.test(pathname)
      && !/^\/uploads\/(image|audio)\/[a-zA-Z0-9-]+\.(jpg|jpeg|png|webp|gif|avif|mp3|wav|m4a|ogg|flac)$/i.test(pathname)) return next()
    const filename = path.join(projectRoot, 'public', pathname.slice(1))
    try {
      const info = await stat(filename)
      if (!info.isFile()) return next()
      res.setHeader('Content-Type', types[path.extname(filename).toLowerCase()])
      res.setHeader('Cache-Control', 'no-store')
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.setHeader('Accept-Ranges', 'bytes')
      let start = 0
      let end = info.size - 1
      if (req.headers.range) {
        const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range)
        if (range && (range[1] || range[2])) {
          if (!range[1]) start = Math.max(0, info.size - Number(range[2]))
          else {
            start = Number(range[1])
            if (range[2]) end = Math.min(end, Number(range[2]))
          }
        } else start = info.size
        if (start > end || start < 0 || !Number.isSafeInteger(start) || !Number.isSafeInteger(end)) {
          res.statusCode = 416
          res.setHeader('Content-Range', `bytes */${info.size}`)
          return res.end()
        }
        res.statusCode = 206
        res.setHeader('Content-Range', `bytes ${start}-${end}/${info.size}`)
      }
      res.setHeader('Content-Length', Math.max(0, end - start + 1))
      if (req.method === 'HEAD' || info.size === 0) return res.end()
      const stream = createReadStream(filename, { start, end })
      stream.on('error', error => res.destroy(error))
      res.on('close', () => stream.destroy())
      stream.pipe(res)
    } catch (error) {
      if (error.code === 'ENOENT') return next()
      next(error)
    }
  }
}
