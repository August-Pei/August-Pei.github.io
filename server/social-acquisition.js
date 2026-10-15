import { spawn, execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFile, writeFile, mkdir, rename, unlink } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { promisify } from 'node:util'
import path from 'node:path'

const execute = promisify(execFile)
const fields = ['SESSDATA', 'buvid3', 'buvid4', 'bili_jct', 'DedeUserID']
const fail = (status, message) => Object.assign(new Error(message), { status })

export function socialAcquisition(projectRoot) {
  const cookieFile = path.join(projectRoot, 'data/.bilibili_cookie')
  const python = process.env.PORTFOLIO_PYTHON || (existsSync(path.join(projectRoot, '.venv/bin/python')) ? path.join(projectRoot, '.venv/bin/python') : 'python3')
  let job = null
  let starting = false
  let child = null
  let disposed = false
  const credentials = async () => {
    let cookie = ''
    try { cookie = await readFile(cookieFile, 'utf8') } catch (error) { if (error.code !== 'ENOENT') throw error }
    const parts = Object.fromEntries(cookie.trim().split(';').map(part => {
      const index = part.indexOf('=')
      return index < 0 ? ['', ''] : [part.slice(0, index).trim(), part.slice(index + 1).trim()]
    }))
    return Object.fromEntries(fields.map(key => [key, parts[key] || '']))
  }
  const saveCredentials = async value => {
    const clean = {}
    for (const key of fields) {
      if (typeof value?.[key] !== 'string' || !value[key].trim() || value[key].length > 8192 || /[;\r\n\x00-\x1f\x7f]/.test(value[key])) throw fail(400, `请填写有效的 ${key}（只填值，不含分号或换行）`)
      clean[key] = value[key].trim()
    }
    if (!/^\d+$/.test(clean.DedeUserID)) throw fail(400, 'DedeUserID 必须为数字')
    const cookie = fields.map(key => `${key}=${clean[key]}`).join('; ')
    await mkdir(path.dirname(cookieFile), { recursive: true })
    const temporary = `${cookieFile}.${randomUUID()}.tmp`
    try {
      await writeFile(temporary, cookie, { mode: 0o600, flag: 'wx' })
      await rename(temporary, cookieFile)
    } finally { await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error }) }
    return { clean, cookie }
  }
  const check = async startedAt => {
    const result = await execute(python, ['scripts/check_bilibili_exports.py', ...(startedAt ? ['--since', String(startedAt)] : [])], {
      cwd: projectRoot, timeout: 15000, maxBuffer: 1024 * 1024,
    })
    return JSON.parse(result.stdout)
  }
  const start = async value => {
    if (starting || job?.status === 'running') throw fail(409, 'Bilibili 采集正在运行，请等待完成')
    if (disposed) throw fail(503, '开发服务正在重启，请刷新后台')
    starting = true
    try {
      const { clean, cookie } = await saveCredentials(value)
      if (disposed) throw fail(503, '开发服务正在重启，请刷新后台')
      const secrets = [cookie, ...Object.values(clean)].sort((a, b) => b.length - a.length)
      const redact = text => secrets.reduce((result, secret) => result.split(secret).join('[已隐藏]'), text)
      job = { id: randomUUID(), status: 'running', startedAt: Date.now(), logs: '', commands: [], check: null }
      const current = job
      const append = text => { current.logs = (current.logs + redact(text)).slice(-250000) }
      const run = (script, args) => new Promise(resolve => {
        append(`\n$ ${path.basename(python)} -u scripts/${script}${args.length ? ` ${args.join(' ')}` : ''}\n`)
        let settled = false
        const finish = code => {
          if (settled) return
          settled = true
          clearTimeout(timer)
          current.commands.push({ script, code })
          append(`\n[${script}] 退出码：${code}\n`)
          child = null
          resolve(code)
        }
        child = spawn(python, ['-u', `scripts/${script}`, ...args], {
          cwd: projectRoot, env: { ...process.env, BILIBILI_COOKIE: cookie, PYTHONUNBUFFERED: '1', TZ: 'Asia/Shanghai' }, stdio: ['ignore', 'pipe', 'pipe'],
        })
        child.stdout.setEncoding('utf8')
        child.stderr.setEncoding('utf8')
        for (const stream of [child.stdout, child.stderr]) {
          // Redact complete lines so credentials split across chunks cannot leak.
          let pending = ''
          stream.on('data', chunk => {
            pending += chunk
            const end = pending.lastIndexOf('\n')
            if (end >= 0) { append(pending.slice(0, end + 1)); pending = pending.slice(end + 1) }
          })
          stream.on('end', () => { if (pending) append(pending) })
        }
        child.on('error', error => { append(`启动失败：${error.message}\n`); finish(-1) })
        child.on('close', code => finish(code ?? -1))
        const timer = setTimeout(() => { append('运行超过 30 分钟，已终止。\n'); child?.kill('SIGKILL') }, 30 * 60 * 1000)
      })
      void (async () => {
        try {
          await run('bilibili_video_stats.py', ['https://space.bilibili.com/512101041'])
          if (!disposed) await run('bilibili_account_stats.py', [])
          current.check = await check(current.startedAt)
          current.status = current.commands.length === 2 && current.commands.every(item => item.code === 0) && current.check.valid ? 'success' : 'failed'
          append(current.status === 'success' ? '\n采集完成，两个 CSV 均通过本次生成检查。\n' : '\n采集未全部成功，请查看日志与文件检查结果。\n')
        } catch (error) { current.status = 'failed'; append(`\n${error.message}\n`) }
        finally { current.finishedAt = Date.now() }
      })()
      return job
    } finally { starting = false }
  }
  return {
    credentials,
    save: async value => {
      if (starting || job?.status === 'running') throw fail(409, '采集或保存正在进行，请稍后再试')
      starting = true
      try { await saveCredentials(value); return { saved: true } }
      finally { starting = false }
    },
    start, check, status: () => ({ job }),
    dispose: () => { disposed = true; child?.kill('SIGKILL') },
  }
}
