import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readdir, stat, writeFile, rename, unlink, copyFile } from 'node:fs/promises'
import { promisify } from 'node:util'
import { randomUUID } from 'node:crypto'
import path from 'node:path'

const execute = promisify(execFile)
const fail = (status, message) => Object.assign(new Error(message), { status })
const kinds = ['notes', 'views', 'engagement', 'fans']

export function rednoteAcquisition(root) {
  const directory = path.join(root, 'data/rednote')
  const python = process.env.PORTFOLIO_PYTHON || (existsSync(path.join(root, '.venv/bin/python')) ? path.join(root, '.venv/bin/python') : 'python3')
  const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  let busy = false
  const mutate = async action => {
    if (busy) throw fail(409, '小红书文件操作正在进行，请稍后重试')
    busy = true
    try { return await action() } finally { busy = false }
  }
  const run = async args => {
    try {
      const { stdout } = await execute(python, ['scripts/rednote_acquisition.py', ...args], { cwd: root, timeout: 60000, maxBuffer: 2 * 1024 * 1024 })
      return JSON.parse(stdout)
    } catch (error) {
      let message
      try { message = JSON.parse(error.stdout).error } catch { /* Python may be unavailable. */ }
      throw fail(400, message || 'Excel 处理失败，请检查 Python 环境并运行 npm run setup:data。')
    }
  }
  const status = async () => {
    const date = today()
    const folder = path.join(directory, date)
    const entries = existsSync(folder) ? await readdir(folder) : []
    const files = await Promise.all(kinds.map(async kind => {
      const file = path.join(folder, `${kind}.xlsx`)
      try { const info = await stat(file); return { kind, name: `${kind}.xlsx`, exists: info.isFile(), bytes: info.size } }
      catch (error) { if (error.code !== 'ENOENT') throw error; return { kind, name: `${kind}.xlsx`, exists: false } }
    }))
    return { date, directory: folder, exists: existsSync(folder), files, downloads: entries.filter(name => name.endsWith('.xlsx') && !name.startsWith('.')) }
  }
  const assertToday = date => { if (date !== today()) throw fail(409, '日期已变化，请重新创建或刷新当天目录后继续') }
  return {
    status,
    prepare: () => mutate(async () => { await mkdir(path.join(directory, today()), { recursive: true }); return status() }),
    check: async fans => {
      if (fans != null && (!/^\d+$/.test(String(fans)) || !Number.isSafeInteger(Number(fans)))) throw fail(400, '粉丝数必须为有效的非负整数')
      return run(['check', ...(fans == null ? [] : ['--fans', String(fans)])])
    },
    normalize: date => mutate(async () => { assertToday(date); return run(['normalize', '--date', date]) }),
    update: (date, fans) => mutate(async () => {
      assertToday(date)
      if (typeof fans !== 'number' || !Number.isSafeInteger(fans) || fans < 0) throw fail(400, '粉丝数必须为有效的非负整数')
      return run(['update', '--date', date, '--fans', String(fans)])
    }),
    upload: (date, kind, body) => mutate(async () => {
      assertToday(date)
      if (!kinds.includes(kind)) throw fail(400, '不支持的文件类型')
      const folder = path.join(directory, date)
      if (!existsSync(folder)) throw fail(400, '请先创建当天目录')
      if (!body.length) throw fail(400, '不能上传空文件')
      const temporary = path.join(folder, `.${kind}-${randomUUID()}.xlsx`)
      const target = path.join(folder, `${kind}.xlsx`)
      try {
        await writeFile(temporary, body, { flag: 'wx' })
        await run(['validate', '--file', temporary, '--kind', kind])
        if (existsSync(target)) {
          const backups = path.join(root, 'data/admin-backups/rednote', date)
          await mkdir(backups, { recursive: true })
          await copyFile(target, path.join(backups, `${kind}-${randomUUID()}.xlsx`))
        }
        await rename(temporary, target)
        return { ...await status(), logs: [`已导入并命名为 ${kind}.xlsx${kind === 'notes' ? '，请继续填写并写入粉丝数。' : ''}`] }
      } finally { await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error }) }
    }),
  }
}
