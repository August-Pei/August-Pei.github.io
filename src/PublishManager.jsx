import React, { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Check, CloudUpload, RefreshCw } from 'lucide-react'

const labels = { preparing: '正在检查发布内容', ready: '已准备好发布', publishing: '正在提交并推送', pushed: '已推送，等待部署', deployed: '网站已发布', deploy_failed: '源码已推送，部署失败', failed: '操作未完成', interrupted: '上次操作已中断' }
const changeLabels = { A: '新增', M: '修改', D: '删除', T: '类型变化' }
const time = value => new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })

export default function PublishManager({ api, hasUnsaved, onBusyChange }) {
  const [state, setState] = useState(null)
  const [error, setError] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [message, setMessage] = useState('')
  const [showAll, setShowAll] = useState(false)
  const requestLock = useRef(false)
  const job = state?.job
  const preview = state?.preview
  const working = state?.busy || ['preparing', 'publishing'].includes(job?.phase)
  const waiting = job?.phase === 'pushed'
  useEffect(() => { onBusyChange(!!working || requesting) }, [working, requesting, onBusyChange])
  useEffect(() => {
    let active = true
    let timer
    const poll = async () => {
      try {
        const result = await api('publish/status')
        if (!active) return
        setState(result); setError('')
        timer = setTimeout(poll, result.busy || ['preparing', 'publishing', 'pushed'].includes(result.job?.phase) ? 2500 : 15000)
      } catch (failure) {
        if (!active) return
        setError(failure.message)
        timer = setTimeout(poll, 8000)
      }
    }
    poll()
    return () => { active = false; clearTimeout(timer) }
  }, [api, requesting])
  const action = async endpoint => {
    if (requestLock.current) return
    requestLock.current = true; setRequesting(true); setError('')
    try {
      await api(`publish/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ previewId: preview?.id, message }) })
      setState(await api('publish/status'))
      setShowAll(false)
    } catch (failure) { setError(failure.message) }
    finally { requestLock.current = false; setRequesting(false) }
  }
  const refresh = async () => {
    try { setState(await api('publish/status')); setError('') } catch (failure) { setError(failure.message) }
  }
  const changes = preview?.changes || []
  return <>
    {error && <div className="message error" role="alert">{error}</div>}
    {hasUnsaved && <div className="message warning">后台还有未保存的修改，请先到对应页面保存，再检查发布内容。</div>}
    <section className="admin-panel publish-destination">
      <span className="eyebrow">GITHUB PAGES</span>
      <h2>将本地更新发布到公网</h2>
      <p>提交网站源码、图片、音乐、简历和已保存的后台内容到 GitHub，由 GitHub Actions 自动构建并发布。</p>
      <div className="publish-links"><a href="https://github.com/August-Pei/August-Pei.github.io" target="_blank" rel="noreferrer">August-Pei / August-Pei.github.io <ArrowUpRight size={15}/></a><span>分支 main</span></div>
      <div className="publish-links"><a href={job?.siteUrl || 'https://augustpei.com/'} target="_blank" rel="noreferrer">访问公网网站 <ArrowUpRight size={15}/></a><a href={job?.deployment?.url || 'https://github.com/August-Pei/August-Pei.github.io/actions'} target="_blank" rel="noreferrer">查看 GitHub Actions <ArrowUpRight size={15}/></a></div>
    </section>
    <section className="admin-panel">
      <div className="resume-heading"><h2>发布内容</h2><button type="button" disabled={working || requesting || (waiting && !job?.monitorError) || hasUnsaved} onClick={() => action('prepare')}><RefreshCw size={15}/>{job?.phase === 'preparing' ? '检查中…' : '检查发布内容'}</button></div>
      <p>先检查本地文件与远端的差异，再提交发布。检查不会向仓库写入内容。</p>
      {preview ? <>
        <div className="publish-summary">{['A', 'M', 'D'].map(kind => <span key={kind}>{changeLabels[kind]} <strong>{changes.filter(item => item.status === kind).length}</strong></span>)}<span>网站文件共 {(preview.bytes / 1024 / 1024).toFixed(1)} MB</span></div>
        {changes.length ? <div className="publish-file-list" aria-label="将提交的文件变化">{(showAll ? changes : changes.slice(0, 30)).map(item => <div className="publish-file" key={item.path}><span className={`change-${item.status}`}>{changeLabels[item.status] || item.status}</span><code>{item.path}</code></div>)}</div> : <p className="muted">网站文件与远端一致，仍可点击发布，重新触发部署。</p>}
        {changes.length > 30 && <button type="button" className="publish-expand" onClick={() => setShowAll(value => !value)}>{showAll ? '收起文件列表' : `查看全部 ${changes.length} 个文件`}</button>}
        <label className="publish-note">发布说明（选填）<input maxLength={200} value={message} disabled={working || requesting} onChange={event => setMessage(event.target.value)} placeholder="例如：更新简历和最新作品"/></label>
        <button type="button" className="primary" disabled={hasUnsaved || working || requesting} onClick={() => action('start')}><CloudUpload size={17}/>提交并发布</button>
      </> : <p className="muted">{working ? '正在处理，请在下方查看进度。' : '点击「检查发布内容」生成本次发布的文件列表。'}</p>}
      <small className="publish-scope">使用本机 GitHub CLI 登录。采集 Cookie、原始平台数据、本地备份、依赖与缓存不会上传；本地开发仓库的提交和暂存区保持原样。发布期间请保持开发服务运行。</small>
    </section>
    {job && <section className="admin-panel">
      <div className="resume-heading"><h2 className="publish-status">{job.phase === 'deployed' && <Check size={18}/>} {labels[job.phase] || job.phase}</h2><button type="button" onClick={refresh}><RefreshCw size={15}/>刷新状态</button></div>
      {job.sha && <p>提交：<a href={`https://github.com/August-Pei/August-Pei.github.io/commit/${job.sha}`} target="_blank" rel="noreferrer"><code>{job.sha.slice(0, 7)}</code></a></p>}
      {job.error && <div className="message error" role="alert">{job.error}</div>}
      {job.monitorError && <div className="message warning">{job.monitorError}</div>}
      {job.phase === 'pushed' && <p>源码提交已完成，网站正在等待构建和部署。此处会自动更新结果。</p>}
      {job.phase === 'deploy_failed' && <p>本次源码已保存在 GitHub。请打开 Actions 查看原因，修正后重新检查并发布。</p>}
      <div className="publish-log" role="log" aria-label="发布日志">{job.logs?.map((entry, index) => <p key={index}><time>{time(entry.time)}</time><span>{entry.message}</span></p>)}</div>
    </section>}
    <details className="admin-panel"><summary>首次使用与登录</summary><p>本机需要 Git 和 GitHub CLI（gh）。尚未登录或登录失效时，在终端运行 <code>gh auth login</code>，选择 github.com 和 HTTPS，并授权仓库与工作流访问；之后重新检查发布内容。</p><p>GitHub 仓库 Settings → Pages → Source 应设置为 GitHub Actions。网页部署由 GitHub 执行，通常需要等待数分钟；如构建失败，页面会保留源码提交并提供 Actions 链接。</p></details>
  </>
}
