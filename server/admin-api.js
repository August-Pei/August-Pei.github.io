import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { readFile, writeFile, mkdir, rename, readdir, unlink } from 'node:fs/promises'
import path from 'node:path'
import { validateContent, validateSocialData } from '../src/content-schema.js'
import { readLatestSocialData } from './portfolio-data.js'
import { managedAssets } from './managed-assets.js'
import { resumeManagement } from './resume-management.js'
import { sitePublisher } from './site-publisher.js'
import { socialAcquisition } from './social-acquisition.js'
import { rednoteAcquisition } from './rednote-acquisition.js'
import { douyinAcquisition } from './douyin-acquisition.js'
import { kuaishouAcquisition } from './kuaishou-acquisition.js'
import { youtubeAcquisition } from './youtube-acquisition.js'
import { tiktokAcquisition } from './tiktok-acquisition.js'
import { instagramAcquisition } from './instagram-acquisition.js'

const revision = text => text == null ? null : createHash('sha256').update(text).digest('hex')
const httpError = (status, message) => Object.assign(new Error(message), { status })
const loopback = address => ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(address)
const extensions = {
  image: new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']),
  audio: new Set(['.mp3', '.wav', '.m4a', '.ogg', '.flac']),
}

async function readText(file) {
  try { return await readFile(file, 'utf8') } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

async function readBody(req, limit) {
  if (Number(req.headers['content-length']) > limit) throw httpError(413, '上传或数据超过大小限制')
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > limit) throw httpError(413, '上传或数据超过大小限制')
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

async function assetsIn(directory, prefix = '') {
  let entries
  try { entries = await readdir(directory, { withFileTypes: true }) } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }
  const assets = []
  for (const entry of entries) {
    const relative = `${prefix}/${entry.name}`
    if (entry.isDirectory()) assets.push(...await assetsIn(path.join(directory, entry.name), relative))
    else if (entry.isFile()) {
      const extension = path.extname(entry.name).toLowerCase()
      const kind = extensions.image.has(extension) ? 'image' : extensions.audio.has(extension) ? 'audio' : null
      if (kind) assets.push({ path: relative, kind })
    }
  }
  return assets
}

export function adminApi(projectRoot) {
  // A separate local-only entry, no management API in preview or static builds.
  const token = randomBytes(32).toString('hex')
  const contentFile = path.join(projectRoot, 'public/site-content.json')
  const socialFile = path.join(projectRoot, 'public/overall-data.json')
  const publisher = sitePublisher(projectRoot)
  const resumes = resumeManagement(projectRoot)
  const acquisition = socialAcquisition(projectRoot)
  const rednote = rednoteAcquisition(projectRoot)
  const douyin = douyinAcquisition(projectRoot)
  const kuaishou = kuaishouAcquisition(projectRoot)
  const youtube = youtubeAcquisition(projectRoot)
  const tiktok = tiktokAcquisition(projectRoot)
  const instagram = instagramAcquisition(projectRoot)
  let queue = Promise.resolve()
  const serialize = action => {
    const next = queue.then(action)
    queue = next.catch(() => {})
    return next
  }
  const save = async (file, value, expectedRevision) => serialize(async () => {
    const previous = await readText(file)
    if (revision(previous) !== expectedRevision) throw httpError(409, '文件已被其他页面或程序修改。请先导出当前草稿备份，再重新加载后台。')
    const backupDir = path.join(projectRoot, 'data/admin-backups')
    await mkdir(backupDir, { recursive: true })
    if (previous != null) {
      await writeFile(path.join(backupDir, `${path.basename(file, '.json')}-${Date.now()}-${randomUUID()}.json`), previous, { flag: 'wx' })
      const backups = (await readdir(backupDir)).filter(name => name.startsWith(`${path.basename(file, '.json')}-`)).sort().reverse()
      for (const name of backups.slice(20)) await unlink(path.join(backupDir, name))
    }
    value.updatedAt = new Date().toISOString()
    const text = `${JSON.stringify(value, null, 2)}\n`
    const temporary = `${file}.${randomUUID()}.tmp`
    try {
      await writeFile(temporary, text, { flag: 'wx' })
      await rename(temporary, file)
    } finally {
      await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error })
    }
    return { data: value, revision: revision(text) }
  })

  return {
    name: 'portfolio-local-admin',
    configureServer(server) {
      server.httpServer?.once('close', acquisition.dispose)
      server.httpServer?.once('close', publisher.dispose)
      server.middlewares.use(managedAssets(projectRoot))
      server.middlewares.use(async (req, res, next) => {
        const requestUrl = new URL(req.url, 'http://localhost')
        if (!requestUrl.pathname.startsWith('/api/admin/')) return next()
        const reply = (status, value) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.setHeader('Cache-Control', 'no-store')
          res.end(JSON.stringify(value))
        }
        try {
          if (!loopback(req.socket.remoteAddress)) throw httpError(403, '后台仅允许通过本机 localhost 访问')
          const host = new URL(`http://${req.headers.host}`).hostname
          if (!['localhost', '127.0.0.1', '[::1]'].includes(host)) throw httpError(403, '请使用 localhost 打开后台')
          const origin = req.headers.origin
          if (origin && new URL(origin).host !== req.headers.host) throw httpError(403, '不允许跨站访问后台')
          if (req.headers['sec-fetch-site'] === 'cross-site') throw httpError(403, '不允许跨站访问后台')
          if (requestUrl.pathname === '/api/admin/session' && req.method === 'GET') return reply(200, { token })
          if (req.headers['x-admin-token'] !== token) throw httpError(403, '管理会话已失效，请刷新后台')
          const endpoint = requestUrl.pathname.slice('/api/admin/'.length)
          if (req.method === 'GET' && endpoint === 'publish/status') return reply(200, await publisher.status())
          if (req.method === 'POST' && endpoint === 'publish/prepare') return reply(202, await publisher.prepare())
          if (req.method === 'POST' && endpoint === 'publish/start') {
            const body = JSON.parse((await readBody(req, 4096)).toString('utf8'))
            return reply(202, await publisher.publish(body.previewId, body.message))
          }
          if (req.method === 'GET' && endpoint === 'resume') return reply(200, await resumes.current())
          if (req.method === 'POST' && endpoint === 'resume/upload') {
            return reply(201, await resumes.upload(requestUrl.searchParams.get('name') || '', await readBody(req, 20 * 1024 * 1024), requestUrl.searchParams.get('revision')))
          }
          if (req.method === 'GET' && endpoint === 'acquisition/instagram/status') return reply(200, await instagram.status())
          if (req.method === 'GET' && endpoint === 'acquisition/instagram/check') return reply(200, await instagram.check())
          if (req.method === 'POST' && endpoint === 'acquisition/instagram/prepare') return reply(200, await instagram.prepare())
          if (req.method === 'POST' && endpoint === 'acquisition/instagram/upload') {
            return reply(200, await instagram.upload(requestUrl.searchParams.get('date'), requestUrl.searchParams.get('name') || '', await readBody(req, 20 * 1024 * 1024)))
          }
          if (req.method === 'POST' && ['acquisition/instagram/normalize', 'acquisition/instagram/update', 'acquisition/instagram/check'].includes(endpoint)) {
            const body = JSON.parse((await readBody(req, 4096)).toString('utf8'))
            if (endpoint.endsWith('/check')) return reply(200, await instagram.check(body.totals))
            return reply(200, endpoint.endsWith('/normalize') ? await instagram.normalize(body.date) : await instagram.update(body.date, body.totals))
          }
          if (req.method === 'GET' && endpoint === 'acquisition/tiktok/status') return reply(200, await tiktok.status())
          if (req.method === 'GET' && endpoint === 'acquisition/tiktok/check') return reply(200, await tiktok.check())
          if (req.method === 'POST' && endpoint === 'acquisition/tiktok/prepare') return reply(200, await tiktok.prepare())
          if (req.method === 'POST' && endpoint === 'acquisition/tiktok/upload') {
            const kind = requestUrl.searchParams.get('kind')
            const name = requestUrl.searchParams.get('name') || ''
            const prefix = kind === 'videos' ? '【社媒助手】' : kind === 'account' ? 'Overview' : null
            const extension = path.extname(name).toLowerCase()
            if (!prefix || !name.startsWith(prefix) || !(kind === 'account' ? ['.zip', '.xlsx'] : ['.xlsx']).includes(extension)) throw httpError(400, '视频请选择「【社媒助手】」开头的 XLSX；账号请选择「Overview」开头的 ZIP 或已解压的 XLSX')
            return reply(200, await tiktok.upload(requestUrl.searchParams.get('date'), kind, await readBody(req, 20 * 1024 * 1024), name))
          }
          if (req.method === 'POST' && endpoint === 'acquisition/tiktok/normalize') {
            const body = JSON.parse((await readBody(req, 4096)).toString('utf8'))
            return reply(200, await tiktok.normalize(body.date))
          }
          if (req.method === 'GET' && endpoint === 'acquisition/youtube/status') return reply(200, await youtube.status())
          if (req.method === 'GET' && endpoint === 'acquisition/youtube/check') return reply(200, await youtube.check())
          if (req.method === 'POST' && endpoint === 'acquisition/youtube/prepare') return reply(200, await youtube.prepare())
          if (req.method === 'POST' && endpoint === 'acquisition/youtube/import') {
            const body = JSON.parse((await readBody(req, 4096)).toString('utf8'))
            return reply(200, await youtube.import(body.date, body.name))
          }
          if (req.method === 'GET' && endpoint === 'acquisition/kuaishou/status') return reply(200, await kuaishou.status())
          if (req.method === 'GET' && endpoint === 'acquisition/kuaishou/check') return reply(200, await kuaishou.check())
          if (req.method === 'POST' && endpoint === 'acquisition/kuaishou/prepare') return reply(200, await kuaishou.prepare())
          if (req.method === 'POST' && endpoint === 'acquisition/kuaishou/upload') {
            const kind = requestUrl.searchParams.get('kind')
            const name = requestUrl.searchParams.get('name') || ''
            if (!['videos', 'account'].includes(kind) || path.extname(name).toLowerCase() !== (kind === 'videos' ? '.csv' : '.xlsx')) throw httpError(400, '视频文件请上传 CSV，账号文件请上传 XLSX')
            return reply(200, await kuaishou.upload(requestUrl.searchParams.get('date'), kind, await readBody(req, 20 * 1024 * 1024)))
          }
          if (req.method === 'POST' && ['acquisition/kuaishou/normalize', 'acquisition/kuaishou/update', 'acquisition/kuaishou/check'].includes(endpoint)) {
            const body = JSON.parse((await readBody(req, 4096)).toString('utf8'))
            if (endpoint.endsWith('/check')) return reply(200, await kuaishou.check(body.totals))
            return reply(200, endpoint.endsWith('/normalize') ? await kuaishou.normalize(body.date) : await kuaishou.update(body.date, body.totals))
          }
          if (req.method === 'GET' && endpoint === 'acquisition/douyin/status') return reply(200, await douyin.status())
          if (req.method === 'GET' && endpoint === 'acquisition/douyin/check') return reply(200, await douyin.check())
          if (req.method === 'POST' && endpoint === 'acquisition/douyin/prepare') return reply(200, await douyin.prepare())
          if (req.method === 'POST' && endpoint === 'acquisition/douyin/upload') {
            const name = requestUrl.searchParams.get('name') || ''
            if (path.extname(name).toLowerCase() !== '.xlsx') throw httpError(400, '请上传 .xlsx 文件，保留原 Excel 格式')
            return reply(200, await douyin.upload(requestUrl.searchParams.get('date'), requestUrl.searchParams.get('kind'), await readBody(req, 20 * 1024 * 1024)))
          }
          if (req.method === 'POST' && endpoint === 'acquisition/douyin/normalize') {
            const body = JSON.parse((await readBody(req, 4096)).toString('utf8'))
            return reply(200, await douyin.normalize(body.date))
          }
          if (req.method === 'GET' && endpoint === 'acquisition/rednote/status') return reply(200, await rednote.status())
          if (req.method === 'GET' && endpoint === 'acquisition/rednote/check') return reply(200, await rednote.check(requestUrl.searchParams.get('fans')))
          if (req.method === 'POST' && endpoint === 'acquisition/rednote/prepare') return reply(200, await rednote.prepare())
          if (req.method === 'POST' && endpoint === 'acquisition/rednote/upload') {
            const name = requestUrl.searchParams.get('name') || ''
            if (path.extname(name).toLowerCase() !== '.xlsx') throw httpError(400, '请上传 .xlsx 文件，保留原 Excel 格式')
            return reply(200, await rednote.upload(requestUrl.searchParams.get('date'), requestUrl.searchParams.get('kind'), await readBody(req, 20 * 1024 * 1024)))
          }
          if (req.method === 'POST' && ['acquisition/rednote/normalize', 'acquisition/rednote/update'].includes(endpoint)) {
            const body = JSON.parse((await readBody(req, 4096)).toString('utf8'))
            return reply(200, endpoint.endsWith('/normalize') ? await rednote.normalize(body.date) : await rednote.update(body.date, body.fans))
          }
          if (req.method === 'GET' && endpoint === 'acquisition/bilibili/credentials') return reply(200, { credentials: await acquisition.credentials() })
          if (req.method === 'GET' && endpoint === 'acquisition/bilibili/status') return reply(200, acquisition.status())
          if (req.method === 'GET' && endpoint === 'acquisition/bilibili/check') return reply(200, await acquisition.check())
          if (['POST', 'PUT'].includes(req.method) && ['acquisition/bilibili/credentials', 'acquisition/bilibili/start'].includes(endpoint)) {
            const body = JSON.parse((await readBody(req, 64 * 1024)).toString('utf8'))
            if (req.method === 'PUT' && endpoint.endsWith('/credentials')) return reply(200, await acquisition.save(body.credentials))
            if (req.method === 'POST' && endpoint.endsWith('/start')) return reply(202, { job: await acquisition.start(body.credentials) })
          }
          if (req.method === 'GET' && endpoint === 'content') {
            const text = await readText(contentFile)
            if (!text) throw httpError(404, '找不到 site-content.json')
            return reply(200, { data: validateContent(JSON.parse(text)), revision: revision(text) })
          }
          if (req.method === 'GET' && endpoint === 'social') {
            const text = await readText(socialFile)
            return reply(200, { data: text == null ? null : validateSocialData(JSON.parse(text)), revision: revision(text) })
          }
          if (req.method === 'GET' && endpoint === 'assets') return reply(200, { assets: await assetsIn(path.join(projectRoot, 'public')) })
          if (req.method === 'POST' && endpoint === 'social/refresh') {
            try { return reply(200, { data: await readLatestSocialData(projectRoot) }) } catch (error) {
              console.error('[admin-social-refresh]', error)
              throw httpError(500, '读取脚本失败，请检查数据文件及 Python 环境（npm run setup:data），详细原因见终端。现有保存数据未变动。')
            }
          }
          if (req.method === 'PUT' && ['content', 'social'].includes(endpoint)) {
            const body = JSON.parse((await readBody(req, 4 * 1024 * 1024)).toString('utf8'))
            const validator = endpoint === 'content' ? validateContent : validateSocialData
            return reply(200, await save(endpoint === 'content' ? contentFile : socialFile, validator(body.data), body.revision))
          }
          if (req.method === 'POST' && endpoint === 'upload') {
            const kind = requestUrl.searchParams.get('kind')
            const name = requestUrl.searchParams.get('name') || ''
            const extension = path.extname(name).toLowerCase()
            if (!extensions[kind]?.has(extension)) throw httpError(400, '文件格式不支持，请上传 JPG / PNG / WebP / GIF / AVIF 封面或 MP3 / WAV / M4A / OGG / FLAC 音频')
            const body = await readBody(req, (kind === 'image' ? 10 : 80) * 1024 * 1024)
            if (!body.length) throw httpError(400, '不能上传空文件')
            const filename = `${randomUUID()}${extension}`
            const directory = path.join(projectRoot, 'public/uploads', kind)
            await mkdir(directory, { recursive: true })
            await writeFile(path.join(directory, filename), body, { flag: 'wx' })
            return reply(201, { path: `/uploads/${kind}/${filename}`, name })
          }
          throw httpError(404, '管理接口不存在')
        } catch (error) {
          if (!error.status && !(error instanceof SyntaxError)) console.error('[admin]', error)
          reply(error.status || 400, { error: error instanceof SyntaxError ? 'JSON 格式不正确' : error.message || '操作失败' })
        }
      })
    },
  }
}
