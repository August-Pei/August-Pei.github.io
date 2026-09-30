import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const execFileAsync = promisify(execFile)
const projectRoot = path.dirname(fileURLToPath(import.meta.url))
const overallDataScript = path.join(projectRoot, 'scripts', 'overall_data.py')
const followerGrowthScript = path.join(projectRoot, 'scripts', 'growth.py')

async function readOverallData() {
  const localPython = path.join(projectRoot, '.venv', 'bin', 'python')
  const python = process.env.PORTFOLIO_PYTHON || (existsSync(localPython) ? localPython : 'python3')
  const runDataScript = script => execFileAsync(python, [script], {
    cwd: projectRoot,
    maxBuffer: 1024 * 1024,
    timeout: 30_000,
  })
  const [overallResult, followerGrowthResult] = await Promise.all([
    runDataScript(overallDataScript),
    runDataScript(followerGrowthScript),
  ])
  return {
    ...JSON.parse(overallResult.stdout),
    follower_growth: JSON.parse(followerGrowthResult.stdout),
  }
}

function overallDataMiddleware() {
  const handler = (req, res, next) => {
    const pathname = new URL(req.url, 'http://localhost').pathname
    if (req.method !== 'GET' || pathname !== '/api/overall-data') {
      next()
      return
    }

    readOverallData()
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
        res.setHeader('Cache-Control', 'no-store')
        res.end(JSON.stringify({ error: '社交媒体数据读取失败' }))
      })
  }

  return {
    name: 'overall-data-api',
    async generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'overall-data.json',
        source: JSON.stringify(await readOverallData()),
      })
    },
    configureServer(server) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler)
    },
  }
}

export default defineConfig({
  base: '/',
  plugins: [react(), overallDataMiddleware()],
})
