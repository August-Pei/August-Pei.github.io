import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, stat, writeFile, unlink } from 'node:fs/promises'
import { promisify } from 'node:util'
import { randomUUID } from 'node:crypto'
import path from 'node:path'

const execute = promisify(execFile)
const fail = (status, message) => Object.assign(new Error(message), { status })
const keys = ['收藏量', '转发量', '粉丝量']
const today = () => {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()).map(part => [part.type, part.value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}

export function kuaishouAcquisition(root) {
  const directory = path.join(root, 'data/kuaishou')
  const python = process.env.PORTFOLIO_PYTHON || (existsSync(path.join(root, '.venv/bin/python')) ? path.join(root, '.venv/bin/python') : 'python3')
  let busy = false
  const mutate = async action => {
    if (busy) throw fail(409, '快手文件操作正在进行，请稍后重试')
    busy = true
    try { return await action() } finally { busy = false }
  }
  const run = async args => {
    try {
      const { stdout } = await execute(python, ['scripts/kuaishou_acquisition.py', ...args], { cwd: root, timeout: 60000, maxBuffer: 2 * 1024 * 1024 })
      return JSON.parse(stdout)
    } catch (error) {
      let message
      try { message = JSON.parse(error.stdout).error } catch { /* Interpreter errors are not JSON. */ }
      throw fail(400, message || '文件处理失败，请检查 Python 环境（npm run setup:data）。')
    }
  }
  const totals = value => {
    if (!value || keys.some(key => !Number.isSafeInteger(value[key]) || value[key] < 0)) throw fail(400, '收藏量、转发量、粉丝量均须为有效的非负整数')
    return Object.fromEntries(keys.map(key => [key, value[key]]))
  }
  const status = async () => {
    const date = today()
    const folder = path.join(directory, date)
    const files = await Promise.all([['videos', 'videos.csv'], ['account', 'account.xlsx']].map(async ([kind, name]) => {
      try { const info = await stat(path.join(folder, name)); return { kind, name, exists: info.isFile(), bytes: info.size } }
      catch (error) { if (error.code !== 'ENOENT') throw error; return { kind, name, exists: false } }
    }))
    return { date, directory: folder, exists: existsSync(folder), files }
  }
  const currentFolder = date => {
    if (date !== today()) throw fail(409, '日期已变化，请确认 / 刷新当天目录后继续')
    const folder = path.join(directory, date)
    if (!existsSync(folder)) throw fail(400, '请先创建当天目录')
    return folder
  }
  const result = async response => ({ ...response, state: await status() })
  return {
    status,
    prepare: () => mutate(async () => { await mkdir(path.join(directory, today()), { recursive: true }); return status() }),
    check: expected => run(['check', ...(expected == null ? [] : ['--totals', JSON.stringify(totals(expected))])]),
    normalize: date => mutate(async () => { currentFolder(date); return result(await run(['normalize', '--date', date])) }),
    update: (date, expected) => mutate(async () => { currentFolder(date); return result(await run(['update', '--date', date, '--totals', JSON.stringify(totals(expected))])) }),
    upload: (date, kind, body) => mutate(async () => {
      const folder = currentFolder(date)
      if (!['videos', 'account'].includes(kind)) throw fail(400, '不支持的文件类型')
      if (!body.length) throw fail(400, '不能上传空文件')
      const temporary = path.join(folder, `.upload-${randomUUID()}${kind === 'videos' ? '.csv' : '.xlsx'}`)
      try {
        await writeFile(temporary, body, { flag: 'wx' })
        return await result(await run(['import', '--date', date, '--file', temporary, '--kind', kind]))
      } finally { await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error }) }
    }),
  }
}
