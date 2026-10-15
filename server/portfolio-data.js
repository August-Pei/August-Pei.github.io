import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { readFile } from 'node:fs/promises'
import { validateSocialData } from '../src/content-schema.js'

const execFileAsync = promisify(execFile)

export async function readLatestSocialData(projectRoot) {
  const localPython = path.join(projectRoot, '.venv', 'bin', 'python')
  const python = process.env.PORTFOLIO_PYTHON || (existsSync(localPython) ? localPython : 'python3')
  const runScript = script => execFileAsync(python, [path.join(projectRoot, 'scripts', script)], {
    cwd: projectRoot, maxBuffer: 4 * 1024 * 1024, timeout: 60_000,
  })
  const [overall, growth] = await Promise.all([runScript('overall_data.py'), runScript('growth.py')])
  return validateSocialData({ ...JSON.parse(overall.stdout), follower_growth: JSON.parse(growth.stdout) })
}

export async function readPublishedSocialData(projectRoot) {
  try {
    return validateSocialData(JSON.parse(await readFile(path.join(projectRoot, 'public/overall-data.json'), 'utf8')))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    return readLatestSocialData(projectRoot)
  }
}
