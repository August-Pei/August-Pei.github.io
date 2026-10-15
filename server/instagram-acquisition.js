import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, stat, writeFile, unlink } from 'node:fs/promises'
import { promisify } from 'node:util'
import { randomUUID } from 'node:crypto'
import path from 'node:path'

const execute = promisify(execFile)
const fail = (status, message) => Object.assign(new Error(message), { status })
const today = () => {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()).map(part => [part.type, part.value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}

export function instagramAcquisition(root) {
  const directory = path.join(root, 'data/Instagram')
  const python = process.env.PORTFOLIO_PYTHON || (existsSync(path.join(root, '.venv/bin/python')) ? path.join(root, '.venv/bin/python') : 'python3')
  let busy = false
  const mutate = async action => {
    if (busy) throw fail(409, 'Instagram 文件操作正在进行，请稍后重试')
    busy = true
    try { return await action() } finally { busy = false }
  }
  const run = async args => {
    try {
      const { stdout } = await execute(python, ['scripts/instagram_acquisition.py', ...args], { cwd: root, timeout: 60000, maxBuffer: 2 * 1024 * 1024 })
      return JSON.parse(stdout)
    } catch (error) {
      let message
      try { message = JSON.parse(error.stdout).error } catch { /* Interpreter failures may not emit JSON. */ }
      throw fail(400, message || 'Excel 处理失败，请检查 Python 环境（npm run setup:data）。')
    }
  }
  const totals = values => {
    if (!values || ['shares', 'fans'].some(key => !Number.isSafeInteger(values[key]) || values[key] < 0)) throw fail(400, 'shares 和 fans 均须为有效的非负整数')
    return { shares: values.shares, fans: values.fans }
  }
  const currentFolder = date => {
    if (date !== today()) throw fail(409, '日期已变化，请确认 / 刷新当天目录后继续')
    const folder = path.join(directory, date)
    if (!existsSync(folder)) throw fail(400, '请先创建当天目录')
    return folder
  }
  const status = async () => {
    const date = today()
    const folder = path.join(directory, date)
    let file = { name: 'videos.xlsx', exists: false }
    try { const info = await stat(path.join(folder, file.name)); file = { ...file, exists: info.isFile(), bytes: info.size } }
    catch (error) { if (error.code !== 'ENOENT') throw error }
    return { date, directory: folder, exists: existsSync(folder), file }
  }
  const result = async response => ({ ...response, state: await status() })
  return {
    status,
    prepare: () => mutate(async () => { await mkdir(path.join(directory, today()), { recursive: true }); return status() }),
    check: expected => run(['check', ...(expected == null ? [] : ['--totals', JSON.stringify(totals(expected))])]),
    normalize: date => mutate(async () => { currentFolder(date); return result(await run(['normalize', '--date', date])) }),
    update: (date, expected) => mutate(async () => { currentFolder(date); return result(await run(['update', '--date', date, '--totals', JSON.stringify(totals(expected))])) }),
    upload: (date, name, body) => mutate(async () => {
      const folder = currentFolder(date)
      const extension = path.extname(name).toLowerCase()
      if (!name.startsWith('SuperIns_') || !['.xlsx', '.csv'].includes(extension)) throw fail(400, '请选择 SuperIns_ 开头的 XLSX 或 CSV 导出文件')
      if (!body.length) throw fail(400, '不能上传空文件')
      const temporary = path.join(folder, `.upload-${randomUUID()}${extension}`)
      try {
        await writeFile(temporary, body, { flag: 'wx' })
        return await result(await run(['import', '--date', date, '--file', temporary]))
      } finally { await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error }) }
    }),
  }
}
