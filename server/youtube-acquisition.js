import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readdir, lstat } from 'node:fs/promises'
import { promisify } from 'node:util'
import path from 'node:path'

const execute = promisify(execFile)
const downloads = '/Users/pyh/Downloads'
const pattern = /^内容 \d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2} .+\.zip$/i
const fail = (status, message) => Object.assign(new Error(message), { status })
const today = () => {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()).map(part => [part.type, part.value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}

export function youtubeAcquisition(root) {
  const directory = path.join(root, 'data/YouTube')
  const python = process.env.PORTFOLIO_PYTHON || (existsSync(path.join(root, '.venv/bin/python')) ? path.join(root, '.venv/bin/python') : 'python3')
  let busy = false
  const mutate = async action => {
    if (busy) throw fail(409, 'YouTube 文件操作正在进行，请稍后重试')
    busy = true
    try { return await action() } finally { busy = false }
  }
  const run = async args => {
    try {
      const { stdout } = await execute(python, ['scripts/youtube_acquisition.py', ...args], { cwd: root, timeout: 120000, maxBuffer: 2 * 1024 * 1024 })
      return JSON.parse(stdout)
    } catch (error) {
      let message
      try { message = JSON.parse(error.stdout).error } catch { /* Interpreter failures may not emit JSON. */ }
      throw fail(400, message || 'YouTube 文件处理失败，请检查 Python 环境及目录访问权限。')
    }
  }
  const status = async () => {
    const date = today()
    let candidates = []
    let downloadsError = null
    try {
      const names = (await readdir(downloads)).filter(name => pattern.test(name))
      candidates = (await Promise.all(names.map(async name => {
        try { const file = await lstat(path.join(downloads, name)); return file.isFile() ? { name, bytes: file.size, modifiedAt: file.mtimeMs } : null }
        catch (error) { if (error.code === 'ENOENT') return null; throw error }
      }))).filter(Boolean).sort((a, b) => b.modifiedAt - a.modifiedAt)
    } catch (error) { downloadsError = `无法读取 Downloads：${error.message}` }
    const folder = path.join(directory, date)
    return { date, directory: folder, exists: existsSync(folder), downloads, candidates, downloadsError }
  }
  return {
    status,
    prepare: () => mutate(async () => { await mkdir(path.join(directory, today()), { recursive: true }); return status() }),
    check: () => run(['check']),
    import: (date, name) => mutate(async () => {
      if (date !== today()) throw fail(409, '日期已变化，请确认 / 刷新当天目录后继续')
      if (!existsSync(path.join(directory, date))) throw fail(400, '请先创建当天目录')
      if (typeof name !== 'string' || path.basename(name) !== name || !pattern.test(name)) throw fail(400, '请选择匹配的 YouTube 下载 ZIP')
      const result = await run(['import', '--date', date, '--archive', name])
      return { ...result, state: await status() }
    }),
  }
}
