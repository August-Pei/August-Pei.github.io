import path from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { readPublishedSocialData } from './server/portfolio-data.js'
import { adminApi } from './server/admin-api.js'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

function overallDataMiddleware() {
  const handler = (req, res, next) => {
    const pathname = new URL(req.url, 'http://localhost').pathname
    if (req.method !== 'GET' || pathname !== '/api/overall-data') return next()
    readPublishedSocialData(projectRoot)
      .then(data => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.setHeader('Cache-Control', 'no-store')
        res.end(JSON.stringify(data))
      })
      .catch(error => {
        console.error('[overall-data]', error)
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify({ error: '社交媒体数据读取失败' }))
      })
  }
  return {
    name: 'overall-data-api',
    async generateBundle() {
      // Public snapshots are already copied by Vite. Generate only before the first admin save.
      const data = await readPublishedSocialData(projectRoot)
      if (!existsSync(path.join(projectRoot, 'public/overall-data.json'))) {
        this.emitFile({ type: 'asset', fileName: 'overall-data.json', source: JSON.stringify(data) })
      }
    },
    configureServer(server) { server.middlewares.use(handler) },
    configurePreviewServer(server) { server.middlewares.use(handler) },
  }
}

export default defineConfig({
  base: '/',
  server: {
    fs: {
      deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/.bilibili_cookie*'],
    },
    watch: {
      // Saving in the manager must not reload the page and discard other drafts.
      ignored: ['**/data/.site-publisher/**', '**/public/resume/**', '**/public/resume.json', '**/public/site-content.json', '**/public/overall-data.json', '**/public/*.json.*.tmp', '**/public/uploads/**', '**/data/admin-backups/**', '**/data/.bilibili_cookie*', '**/data/bilibili/**', '**/data/rednote/**', '**/data/douyin/**', '**/data/kuaishou/**', '**/data/YouTube/**', '**/data/TikTok/**', '**/data/Instagram/**'],
    },
  },
  plugins: [react(), adminApi(projectRoot), overallDataMiddleware()],
})
