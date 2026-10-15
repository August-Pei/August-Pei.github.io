import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile, rename, unlink, stat, readdir } from 'node:fs/promises'
import path from 'node:path'

const revision = text => createHash('sha256').update(text).digest('hex')
const fail = (status, message) => Object.assign(new Error(message), { status })

export function resumeManagement(projectRoot) {
  const manifest = path.join(projectRoot, 'public/resume.json')
  const directory = path.join(projectRoot, 'public/resume')
  const backupDirectory = path.join(projectRoot, 'data/admin-backups/resume')
  let queue = Promise.resolve()
  async function current() {
    const text = await readFile(manifest, 'utf8')
    const data = JSON.parse(text)
    if (!/^\/resume\/[^/\\]+\.(pdf|docx)$/i.test(data.path) || data.path.includes('..')) throw fail(400, '简历配置中的路径无效')
    const info = await stat(path.join(directory, data.path.slice('/resume/'.length)))
    if (!info.isFile()) throw fail(400, '当前简历文件不存在')
    return { data: { ...data, size: info.size }, revision: revision(text) }
  }
  async function save(name, body, expectedRevision) {
    const extension = path.extname(name).toLowerCase()
    if (!['.pdf', '.docx'].includes(extension)) throw fail(400, '请上传 PDF 或 Word（.docx）简历')
    if (!body.length || body.length > 20 * 1024 * 1024) throw fail(400, '简历不能为空，且不能超过 20 MB')
    if (extension === '.pdf' ? body.subarray(0, 5).toString() !== '%PDF-' : (!body.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04])) || !body.includes(Buffer.from('[Content_Types].xml')) || !body.includes(Buffer.from('word/document.xml')))) throw fail(400, '文件内容与扩展名不符，请选择有效的 PDF 或 DOCX 文件')
    const previous = await readFile(manifest, 'utf8')
    if (revision(previous) !== expectedRevision) throw fail(409, '简历已在其他页面更新，请先点击「刷新当前版本」，再选择是否上传。')
    await mkdir(directory, { recursive: true })
    await mkdir(backupDirectory, { recursive: true })
    // Backups retain the old manifest; old resume assets stay available for recovery.
    const backupName = `${Date.now()}-${randomUUID()}.json`
    await writeFile(path.join(backupDirectory, backupName), previous, { flag: 'wx' })
    const backups = (await readdir(backupDirectory)).filter(file => file.endsWith('.json')).sort().reverse()
    for (const file of backups.slice(20)) await unlink(path.join(backupDirectory, file))
    const filename = `${randomUUID()}${extension}`
    const data = { path: `/resume/${filename}`, name: path.basename(name).replace(/[\u0000-\u001f\u007f]/g, ''), downloadName: `裴宇航-个人简历${extension}`, updatedAt: new Date().toISOString() }
    const text = `${JSON.stringify(data, null, 2)}\n`
    const temporary = `${manifest}.${randomUUID()}.tmp`
    let published = false
    try {
      await writeFile(path.join(directory, filename), body, { flag: 'wx' })
      await writeFile(temporary, text, { flag: 'wx' })
      await rename(temporary, manifest)
      published = true
      return { data: { ...data, size: body.length }, revision: revision(text) }
    } finally {
      await unlink(temporary).catch(() => {})
      if (!published) await unlink(path.join(directory, filename)).catch(() => {})
    }
  }
  return {
    current,
    upload(name, body, expectedRevision) {
      const next = queue.then(() => save(name, body, expectedRevision))
      queue = next.catch(() => {})
      return next
    },
  }
}
