import { mkdir, readdir, stat, writeFile, rename, unlink, copyFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'

const exports = [
  { kind: 'videos', name: 'videos.xlsx', prefix: '作品列表导出' },
  { kind: 'metrics', name: 'views & engagement.xlsx', prefix: '数据表现_短视频全量指标' },
  { kind: 'fans', name: 'fans.xlsx', prefix: '数据表现_粉丝全量指标' },
]
const fail = (status, message) => Object.assign(new Error(message), { status })
const today = () => {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()).map(part => [part.type, part.value]))
  return `${parts.year}-${parts.month}-${parts.day}`
}
const exists = async file => {
  try { return await stat(file) } catch (error) { if (error.code === 'ENOENT') return null; throw error }
}

export function douyinAcquisition(root) {
  const directory = path.join(root, 'data/douyin')
  let busy = false
  const mutate = async action => {
    if (busy) throw fail(409, '抖音文件操作正在进行，请稍后重试')
    busy = true
    try { return await action() } finally { busy = false }
  }
  const inspect = async folder => Promise.all(exports.map(async item => {
    const info = await exists(path.join(folder, item.name))
    const present = !!info?.isFile()
    return { kind: item.kind, name: item.name, exists: present, bytes: present ? info.size : 0, valid: present && info.size > 0, message: !present ? '文件不存在' : info.size ? '文件存在且非空' : '文件为空，请重新导入' }
  }))
  const status = async () => {
    const date = today()
    const folder = path.join(directory, date)
    return { date, directory: folder, exists: !!(await exists(folder))?.isDirectory(), files: await inspect(folder) }
  }
  const currentFolder = async date => {
    if (date !== today()) throw fail(409, '日期已变化，请确认 / 刷新当天目录后继续')
    const folder = path.join(directory, date)
    if (!(await exists(folder))?.isDirectory()) throw fail(400, '请先创建当天目录')
    return folder
  }
  const check = async () => {
    let entries = []
    try { entries = await readdir(directory, { withFileTypes: true }) } catch (error) { if (error.code !== 'ENOENT') throw error }
    const dates = entries.filter(entry => entry.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(entry.name) && Number.isFinite(Date.parse(`${entry.name}T00:00:00Z`)) && new Date(`${entry.name}T00:00:00Z`).toISOString().slice(0, 10) === entry.name).map(entry => entry.name).sort()
    const date = dates.at(-1) || null
    const folder = date ? path.join(directory, date) : directory
    const files = date ? await inspect(folder) : []
    return { date, directory: folder, files, valid: files.length === 3 && files.every(file => file.valid) }
  }
  return {
    status, check,
    prepare: () => mutate(async () => { await mkdir(path.join(directory, today()), { recursive: true }); return status() }),
    upload: (date, kind, body) => mutate(async () => {
      const folder = await currentFolder(date)
      const item = exports.find(item => item.kind === kind)
      if (!item) throw fail(400, '不支持的抖音文件类型')
      if (!body.length) throw fail(400, '不能上传空文件')
      const target = path.join(folder, item.name)
      const temporary = path.join(folder, `.${kind}-${randomUUID()}.tmp`)
      try {
        await writeFile(temporary, body, { flag: 'wx' })
        if (await exists(target)) {
          const backupDir = path.join(root, 'data/admin-backups/douyin', date)
          await mkdir(backupDir, { recursive: true })
          await copyFile(target, path.join(backupDir, `${kind}-${randomUUID()}.xlsx`))
        }
        await rename(temporary, target)
        return { state: await status(), check: await check(), logs: [`已导入并命名为 ${item.name}`] }
      } finally { await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error }) }
    }),
    normalize: date => mutate(async () => {
      const folder = await currentFolder(date)
      const entries = await readdir(folder, { withFileTypes: true })
      const plans = []
      for (const item of exports) {
        const matches = entries.filter(entry => entry.isFile() && entry.name.startsWith(item.prefix) && path.extname(entry.name).toLowerCase() === '.xlsx')
        if (matches.length > 1 || matches.length && await exists(path.join(folder, item.name))) throw fail(409, `${item.name} 存在重复候选或标准名文件，请先保留一份待导入文件后重试`)
        if (matches.length) {
          const source = path.join(folder, matches[0].name)
          if (!(await stat(source)).size) throw fail(400, `${matches[0].name} 为空，请重新下载`)
          plans.push({ source, target: path.join(folder, item.name), original: matches[0].name, name: item.name })
        }
      }
      for (const plan of plans) await rename(plan.source, plan.target)
      return { state: await status(), check: await check(), logs: plans.length ? plans.map(plan => `${plan.original} → ${plan.name}`) : ['没有待重命名的下载文件；可在网页上传，或将原始文件放入当天目录后重试。'] }
    }),
  }
}
