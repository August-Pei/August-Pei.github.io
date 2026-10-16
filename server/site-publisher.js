import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { setTimeout as delay } from 'node:timers/promises'
import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile, readdir, lstat, rm, rename } from 'node:fs/promises'
import path from 'node:path'

const exec = promisify(execFile)
const REPOSITORY = 'August-Pei/August-Pei.github.io'
const REMOTE = `https://github.com/${REPOSITORY}.git`
const BRANCH = 'main'
const roots = ['src', 'public', 'Photos', 'music', 'scripts', 'server']
const rootFiles = ['index.html', 'admin.html', 'package.json', 'package-lock.json', 'vite.config.js', 'requirements.txt', '.gitignore', 'ADMIN_README.md', '.github/workflows/deploy.yml']
const fail = (status, message) => Object.assign(new Error(message), { status })
const clean = value => String(value).replace(/(?:gh[pousr]_[A-Za-z0-9_]+|github_pat_[A-Za-z0-9_]+)/g, '[已隐藏凭据]').slice(-5000)

export function sitePublisher(projectRoot) {
  const stateDirectory = path.join(projectRoot, 'data/.site-publisher')
  const checkout = path.join(stateDirectory, 'repository')
  const stateFile = path.join(stateDirectory, 'status.json')
  const controller = new AbortController()
  let disposed = false
  const assertActive = () => { if (disposed) throw fail(409, '开发服务已关闭，发布操作中断') }
  let busy = false
  let preview = null
  let job = null
  let monitoring = null
  let lastMonitor = 0
  const ready = readFile(stateFile, 'utf8').then(text => {
    job = JSON.parse(text)
    if (['preparing', 'publishing', 'ready'].includes(job.phase)) {
      job.phase = 'interrupted'
      job.error = '开发服务已重启，操作中断。请重新检查发布内容；若已推送，请查看 GitHub Actions。'
    }
  }).catch(error => { if (error.code !== 'ENOENT') console.error('[publisher-state]', error.message) })
  const run = async (command, args, cwd = checkout) => {
    assertActive()
    try {
      const { stdout } = await exec(command, args, {
        cwd, timeout: 180_000, maxBuffer: 8 * 1024 * 1024, signal: controller.signal,
        env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GH_PROMPT_DISABLED: '1', GH_HOST: 'github.com', GIT_LFS_SKIP_SMUDGE: '1' },
      })
      return stdout
    } catch (error) {
      if (error.code === 'ENOENT') throw fail(400, `未找到 ${command}。请先安装 Git 和 GitHub CLI，并在终端执行 gh auth login。`)
      throw fail(400, clean(error.stderr || error.message))
    }
  }
  // Avoid intermittent HTTP/2 framing failures on the GitHub transport path.
  // Command-local configuration leaves the user's other repositories unchanged.
  const git = args => run('git', ['-c', 'http.version=HTTP/1.1', '-c', 'core.hooksPath=/dev/null', '-c', 'credential.helper=', '-c', 'credential.helper=!gh auth git-credential', ...args])
  const gitNetwork = async args => {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      assertActive()
      try { return await git(args) } catch (error) {
        assertActive()
        const transient = /HTTP.?2.*(?:framing|stream)|curl (?:16|18|28|35|52|55|56|92)\b|connection (?:reset|timed out|closed)|could not resolve host|failed to connect|TLS connection.*terminated|remote end hung up|empty reply from server/i.test(error.message)
        if (!transient || attempt === 3) throw error
        await log(`Git 网络连接中断，${attempt * 2} 秒后重试（${attempt + 1}/3，HTTP/1.1）…`)
        await delay(attempt * 2000, undefined, { signal: controller.signal })
      }
    }
  }
  const github = async endpoint => JSON.parse(await run('gh', ['api', '--hostname', 'github.com', endpoint], projectRoot))
  async function persist() {
    if (disposed) return
    await mkdir(stateDirectory, { recursive: true })
    const temporary = `${stateFile}.${randomUUID()}.tmp`
    try { await writeFile(temporary, JSON.stringify(job), { mode: 0o600 }); await rename(temporary, stateFile) }
    finally { await rm(temporary, { force: true }) }
  }
  async function log(message) {
    job.logs = [...(job.logs || []), { time: new Date().toISOString(), message }].slice(-80)
    await persist()
  }
  async function files() {
    const result = []
    async function visit(relative) {
      assertActive()
      const absolute = path.join(projectRoot, relative)
      let info
      try { info = await lstat(absolute) } catch (error) { if (error.code === 'ENOENT') return; throw error }
      if (info.isSymbolicLink()) throw fail(400, `发布目录含符号链接，请先换为普通文件：${relative}`)
      if (info.isDirectory()) {
        for (const name of (await readdir(absolute)).sort()) {
          if (name.startsWith('.') || ['node_modules', '__pycache__'].includes(name) || name.endsWith('.tmp') || name.endsWith('.log')) continue
          await visit(`${relative}/${name}`)
        }
      } else if (info.isFile()) result.push(relative)
    }
    for (const relative of [...roots, ...rootFiles]) await visit(relative)
    return result.sort()
  }
  async function snapshot(destination = null) {
    const hash = createHash('sha256')
    let bytes = 0
    for (const relative of await files()) {
      assertActive()
      const buffer = await readFile(path.join(projectRoot, relative))
      if (buffer.length >= 100 * 1024 * 1024) throw fail(400, `文件超过 GitHub 单文件限制：${relative}`)
      bytes += buffer.length
      hash.update(relative).update('\0').update(createHash('sha256').update(buffer).digest()).update('\0')
      if (destination) {
        const target = path.join(destination, relative)
        await mkdir(path.dirname(target), { recursive: true })
        await writeFile(target, buffer)
      }
    }
    return { fingerprint: hash.digest('hex'), bytes }
  }
  async function prepare() {
    await ready
    assertActive()
    if (busy || (job?.phase === 'pushed' && !job.monitorError)) throw fail(409, '发布任务正在进行，请等待完成或查看 GitHub Actions。')
    busy = true; preview = null
    job = { id: randomUUID(), phase: 'preparing', startedAt: new Date().toISOString(), logs: [] }
    try { await persist() } catch (error) { busy = false; job.phase = 'failed'; job.error = clean(error.message); throw error }
    // Work runs asynchronously so the manager can show progress and survive tab switches.
    void (async () => {
      try {
        await log('正在检查 GitHub 登录、仓库权限和 Pages 设置…')
        const repository = await github(`repos/${REPOSITORY}`)
        if (!repository.permissions?.push) throw fail(403, '当前 GitHub 账号没有该仓库的写入权限，请使用 gh auth login 登录正确账号。')
        if (repository.default_branch !== BRANCH) throw fail(409, '仓库默认分支已变化，请先检查发布配置。')
        let pages
        try { pages = await github(`repos/${REPOSITORY}/pages`) }
        catch { throw fail(400, '无法读取 GitHub Pages。请在仓库 Settings → Pages 中启用 Pages，并将 Source 设为 GitHub Actions。') }
        if (pages.build_type !== 'workflow') throw fail(400, '请在仓库 Settings → Pages 将 Source 设为 GitHub Actions，再重新检查。')
        job.siteUrl = pages.html_url
        const social = JSON.parse(await readFile(path.join(projectRoot, 'public/overall-data.json'), 'utf8'))
        if (!social || typeof social !== 'object') throw fail(400, '请先在「自媒体数据更新」保存正式数据。')
        await log('正在同步远端 main 到独立发布副本…')
        await mkdir(checkout, { recursive: true })
        let initialized = false
        try { initialized = (await lstat(path.join(checkout, '.git'))).isDirectory() } catch (error) { if (error.code !== 'ENOENT') throw error }
        if (!initialized) {
          await run('git', ['init', '--initial-branch=main', checkout], projectRoot)
          await git(['remote', 'add', 'origin', REMOTE])
        }
        if ((await git(['remote', 'get-url', 'origin'])).trim() !== REMOTE) throw fail(409, '发布副本的远端地址不符，请检查 data/.site-publisher/repository。')
        await gitNetwork(['fetch', '--depth=1', 'origin', BRANCH])
        const remoteHead = (await git(['rev-parse', 'FETCH_HEAD'])).trim()
        // Only this generated checkout is reset; the developer checkout is never staged or reset.
        await git(['reset', '--hard', remoteHead])
        await git(['clean', '-fdx'])
        await log('正在收集网站源码、素材和后台已保存的内容…')
        for (const relative of [...roots, ...rootFiles]) await rm(path.join(checkout, relative), { recursive: true, force: true })
        const captured = await snapshot(checkout)
        await git(['add', '--all'])
        const staged = (await git(['diff', '--cached', '--name-status', '-z', '--no-renames'])).split('\0')
        const changes = []
        for (let index = 0; index + 1 < staged.length; index += 2) changes.push({ status: staged[index], path: staged[index + 1] })
        preview = { id: randomUUID(), remoteHead, ...captured, changes, createdAt: new Date().toISOString() }
        job.phase = 'ready'
        await log(`检查完成：${changes.length} 个文件有变化。点击「提交并发布」后才会推送。`)
      } catch (error) {
        job.phase = 'failed'; job.error = clean(error.message)
        await log(`检查失败：${job.error}`)
      } finally { busy = false }
    })().catch(error => { busy = false; console.error('[publisher-prepare]', error) })
    return { job }
  }
  async function publish(id, message) {
    await ready
    assertActive()
    if (busy) throw fail(409, '已有发布操作正在运行')
    if (!preview || preview.id !== id || job?.phase !== 'ready') throw fail(409, '请先重新检查发布内容')
    const captured = preview
    const commitMessage = typeof message === 'string' ? message.trim() : ''
    if (commitMessage.length > 200 || /[\u0000-\u001f\u007f]/.test(commitMessage)) throw fail(400, '发布说明请填写 200 字以内的单行文字')
    busy = true; job.phase = 'publishing'; delete job.error
    try { await persist() } catch (error) { busy = false; job.phase = 'ready'; throw error }
    void (async () => {
      try {
        await log('正在确认本地文件和远端版本仍与检查结果一致…')
        if ((await snapshot()).fingerprint !== captured.fingerprint) throw fail(409, '检查后本地文件发生变化，请重新检查发布内容。')
        await gitNetwork(['fetch', '--depth=1', 'origin', BRANCH])
        if ((await git(['rev-parse', 'FETCH_HEAD'])).trim() !== captured.remoteHead) throw fail(409, '远端已更新，请重新检查变更列表后再发布。')
        let baseline = 0
        try { baseline = (await github(`repos/${REPOSITORY}/actions/workflows/deploy.yml/runs?per_page=1`)).workflow_runs?.[0]?.id || 0 } catch { /* First publication can introduce the workflow. */ }
        job.baselineRunId = baseline
        if (captured.changes.length) {
          const account = await github('user')
          await git(['-c', 'commit.gpgSign=false', '-c', `user.name=${account.login}`, '-c', `user.email=${account.id}+${account.login}@users.noreply.github.com`, 'commit', '-m', commitMessage || `发布网站更新 ${new Date().toISOString()}`])
          job.sha = (await git(['rev-parse', 'HEAD'])).trim()
          await log('正在将提交推送到 GitHub main…')
          // Retrying sends the same commit and ref; it never creates a new commit or force-pushes.
          await gitNetwork(['push', 'origin', 'HEAD:refs/heads/main'])
          job.phase = 'pushed'
          job.pushedAt = new Date().toISOString()
          await log('源码已推送，等待 GitHub Actions 构建并部署网站。')
        } else {
          job.sha = captured.remoteHead
          await log('源码与远端一致，正在重新触发 Pages 部署…')
          await run('gh', ['api', '--hostname', 'github.com', '--method', 'POST', `repos/${REPOSITORY}/actions/workflows/deploy.yml/dispatches`, '-f', 'ref=main'], projectRoot)
          job.phase = 'pushed'
          job.pushedAt = new Date().toISOString()
          await log('部署已触发，等待 GitHub Actions 完成。')
        }
        preview = null
      } catch (error) {
        job.phase = 'failed'; job.error = clean(error.message)
        await log(`发布失败：${job.error}`)
      } finally { busy = false }
    })().catch(error => { busy = false; console.error('[publisher-publish]', error) })
    return { job }
  }
  async function monitor() {
    if (job?.phase !== 'pushed' || busy || Date.now() - lastMonitor < 10_000) return
    if (monitoring) return monitoring
    lastMonitor = Date.now()
    const monitoredJob = job
    monitoring = (async () => {
      try {
        const result = await github(`repos/${REPOSITORY}/actions/workflows/deploy.yml/runs?per_page=30&head_sha=${monitoredJob.sha}`)
        if (job !== monitoredJob || disposed) return
        const run = result.workflow_runs.find(item => item.head_sha === job.sha && item.id > job.baselineRunId)
        delete job.monitorError
        if (!run) {
          if (Date.now() - new Date(job.pushedAt).getTime() > 5 * 60_000) job.monitorError = '尚未发现本次部署，请打开 GitHub Actions 检查工作流是否启用，或手动触发部署。'
          return
        }
        job.deployment = { id: run.id, url: run.html_url, status: run.status, conclusion: run.conclusion }
        if (run.status === 'completed') {
          job.phase = run.conclusion === 'success' ? 'deployed' : 'deploy_failed'
          await log(run.conclusion === 'success' ? 'GitHub Pages 部署成功，公网网站已更新。' : `源码已推送，但部署未成功（${run.conclusion}）。请查看 GitHub Actions 日志。`)
        } else await persist()
      } catch (error) { if (job === monitoredJob && !disposed) job.monitorError = `源码提交已保留，暂时无法读取部署状态：${clean(error.message)}` }
      finally { monitoring = null }
    })()
    return monitoring
  }
  return {
    async status() {
      await ready
      // Poll in the background: a slow network must not block the manager's progress display.
      void monitor().catch(error => console.error('[publisher-monitor]', error.message))
      return { repository: REPOSITORY, branch: BRANCH, job, preview: job?.phase === 'ready' ? preview : null, busy }
    },
    prepare, publish,
    dispose() { disposed = true; controller.abort() },
  }
}
