import React, { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Check, Play, RefreshCw, Save } from 'lucide-react'
import RednoteAcquisition from './RednoteAcquisition.jsx'
import DouyinAcquisition from './DouyinAcquisition.jsx'
import KuaishouAcquisition from './KuaishouAcquisition.jsx'
import YouTubeAcquisition from './YouTubeAcquisition.jsx'
import TikTokAcquisition from './TikTokAcquisition.jsx'
import InstagramAcquisition from './InstagramAcquisition.jsx'

const platforms = ['bilibili', '小红书', '抖音', '快手', 'YouTube', 'TikTok', 'Ins']
const cookieFields = ['SESSDATA', 'buvid3', 'buvid4', 'bili_jct', 'DedeUserID']
const equal = (left, right) => JSON.stringify(left) === JSON.stringify(right)

function FileCheck({ result }) {
  if (!result) return <p>执行采集后自动检查，也可以单独检查已有文件。</p>
  return <div className="acquisition-check">
    <p>最新日期：<strong>{result.date || '尚无日期目录'}</strong><br/><span className="acquisition-path">{result.directory}</span></p>
    {!result.files.length && <div className="message warning">尚未找到 Bilibili 导出文件。</div>}
    {result.files.map(file => <div className={`acquisition-file ${file.valid ? 'valid' : 'invalid'}`} key={file.name}>
      <strong>{file.valid ? '✓' : '×'} {file.name}</strong>
      <span>{file.message}</span>
      {file.exists && <small>{file.rows} 行数据 · {file.bytes} 字节 · 修改于 {new Date(file.modifiedAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })}</small>}
    </div>)}
  </div>
}

export default function SocialAcquisition({ api, onDirtyChange, onGoToUpdate }) {
  const [platform, setPlatform] = useState('bilibili')
  const [credentials, setCredentials] = useState(null)
  const [saved, setSaved] = useState(null)
  const [job, setJob] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)
  const [reconnect, setReconnect] = useState(0)
  const [follow, setFollow] = useState(true)
  const [showCookie, setShowCookie] = useState(true)
  const [rednoteDirty, setRednoteDirty] = useState(false)
  const [kuaishouDirty, setKuaishouDirty] = useState(false)
  const [instagramDirty, setInstagramDirty] = useState(false)
  const logRef = useRef(null)
  const running = job?.status === 'running'
  const dirty = credentials && !equal(credentials, saved)

  useEffect(() => { onDirtyChange(!!dirty || rednoteDirty || kuaishouDirty || instagramDirty) }, [dirty, rednoteDirty, kuaishouDirty, instagramDirty, onDirtyChange])
  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([api('acquisition/bilibili/credentials'), api('acquisition/bilibili/status')]).then(([settings, status]) => {
      if (!active) return
      setCredentials(settings.credentials); setSaved(settings.credentials); setJob(status.job)
      if (status.job?.check) setResult(status.job.check)
      setMessage(null)
    }).catch(error => { if (active) setMessage({ type: 'error', text: error.message }) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [api, reconnect])
  useEffect(() => {
    if (!running) return
    let active = true
    let timer
    const poll = async () => {
      try {
        const status = await api('acquisition/bilibili/status')
        if (!active) return
        setJob(status.job)
        if (!status.job) {
          setMessage({ type: 'error', text: '开发服务已重启，运行记录已清空。请检查已有文件后重新采集。' })
          return
        }
        setMessage(previous => previous?.poll ? null : previous)
        if (status.job.check) setResult(status.job.check)
        if (status.job.status !== 'running') return
      } catch (error) {
        if (active) setMessage({ type: 'error', text: `日志连接中断，正在重试：${error.message}`, poll: true })
      }
      if (active) timer = setTimeout(poll, 1000)
    }
    timer = setTimeout(poll, 500)
    return () => { active = false; clearTimeout(timer) }
  }, [running, api])
  useEffect(() => {
    if (follow && logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [job?.logs, follow, platform])

  const action = async kind => {
    setBusy(true); setMessage(null)
    try {
      if (kind === 'check') {
        setResult(await api('acquisition/bilibili/check'))
      } else {
        const response = await api(`acquisition/bilibili/${kind === 'start' ? 'start' : 'credentials'}`, {
          method: kind === 'start' ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ credentials }),
        })
        setSaved({ ...credentials })
        if (kind === 'start') { setJob(response.job); setResult(null) }
        else setMessage({ type: 'success', text: 'Cookie 已保存在本机，下次打开自动回填。' })
      }
    } catch (error) { setMessage({ type: 'error', text: error.message }) }
    finally { setBusy(false) }
  }
  return <>
    <nav className="acquisition-platforms" aria-label="选择数据平台">{platforms.map((name, index) => <button type="button" key={name} className={platform === name ? 'active' : ''} aria-pressed={platform === name} onClick={() => setPlatform(name)}><span>{String(index + 1).padStart(2, '0')}</span><strong>{name}</strong><small>{index === 0 && running ? '采集中' : '已接入'}</small></button>)}</nav>
    <div hidden={platform !== '小红书'}><RednoteAcquisition api={api} active={platform === '小红书'} onDirtyChange={setRednoteDirty} onGoToUpdate={onGoToUpdate}/></div>
    <div hidden={platform !== '抖音'}><DouyinAcquisition api={api} active={platform === '抖音'} onGoToUpdate={onGoToUpdate}/></div>
    <div hidden={platform !== '快手'}><KuaishouAcquisition api={api} active={platform === '快手'} onDirtyChange={setKuaishouDirty} onGoToUpdate={onGoToUpdate}/></div>
    <div hidden={platform !== 'YouTube'}><YouTubeAcquisition api={api} active={platform === 'YouTube'} onGoToUpdate={onGoToUpdate}/></div>
    <div hidden={platform !== 'TikTok'}><TikTokAcquisition api={api} active={platform === 'TikTok'} onGoToUpdate={onGoToUpdate}/></div>
    <div hidden={platform !== 'Ins'}><InstagramAcquisition api={api} active={platform === 'Ins'} onDirtyChange={setInstagramDirty} onGoToUpdate={onGoToUpdate}/></div>
    {platform === 'bilibili' && <>
      {message && <div className={`message ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</div>}
      <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 1</span><h2>打开 Bilibili 主页</h2><p>前往个人空间，在登录后获取本次需要的 Cookie 字段。</p><a className="acquisition-link" href="https://space.bilibili.com/512101041?spm_id_from=333.1007.0.0" target="_blank" rel="noreferrer">访问 Bilibili 主页 · 512101041<ArrowUpRight size={16}/></a></section>
      <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 2</span><h2>填写登录 Cookie</h2><p>自动回填上次保存的数值。修改后点击「保存 Cookie」，或在开始采集时一起保存。仅保存在本机，字段不会显示在运行日志中。</p>
        {loading ? <p>正在读取本机 Cookie…</p> : credentials ? <form onSubmit={event => { event.preventDefault(); action('save') }}>
          <fieldset disabled={busy || running} className="acquisition-credentials">{cookieFields.map(key => <label key={key}>{key}<input type={showCookie || key === 'DedeUserID' ? 'text' : 'password'} autoComplete="off" spellCheck={false} required value={credentials[key]} onChange={event => setCredentials(previous => ({ ...previous, [key]: event.target.value }))}/></label>)}</fieldset>
          <div className="acquisition-toolbar"><button type="submit" disabled={busy || running || !dirty}><Save size={15}/>保存 Cookie</button><small>{dirty ? '有未保存的 Cookie 修改' : '已读取本机保存值'} · Cookie 文件不参与网站发布</small><label className="acquisition-follow"><input type="checkbox" checked={showCookie} onChange={event => setShowCookie(event.target.checked)}/>显示 Cookie</label></div>
        </form> : <button onClick={() => setReconnect(value => value + 1)}>重新读取 Cookie</button>}
      </section>
      <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 3</span><h2>获取视频与账号数据</h2><p>在本机项目目录依次执行视频、账号采集脚本；日志每秒更新。账号脚本需在北京时间 12:00 后运行。</p>
        <pre className="acquisition-command">{`python3 scripts/bilibili_video_stats.py 'https://space.bilibili.com/512101041'\npython3 scripts/bilibili_account_stats.py`}</pre>
        <div className="acquisition-toolbar"><button type="button" className="primary" disabled={busy || running || loading || !credentials} onClick={() => action('start')}><Play size={16}/>{running ? '正在采集…' : '保存 Cookie 并开始采集'}</button><span className={`acquisition-job-status ${job?.status || ''}`} role="status">{running ? '运行中 · 可切换后台页面' : job?.status === 'success' ? '采集成功' : job?.status === 'failed' ? '采集未全部成功' : '等待执行'}</span><label className="acquisition-follow"><input type="checkbox" checked={follow} onChange={event => setFollow(event.target.checked)}/>跟随最新日志</label></div>
        <pre ref={logRef} className="acquisition-log" role="region" aria-label="Bilibili 命令行实时输出" tabIndex={0}>{job?.logs || '等待启动。开始后将在这里显示 stdout / stderr 实时输出。'}</pre>
        <small>刷新页面会恢复当前任务的日志。停止开发服务会结束采集；运行日志最多保留最近 25 万字符。</small>
      </section>
      <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 4</span><h2>检查最新日期的 CSV 文件</h2><FileCheck result={result}/><div className="acquisition-toolbar"><button type="button" disabled={busy || running} onClick={() => action('check')}><RefreshCw size={15}/>检查最新目录</button><button type="button" onClick={onGoToUpdate}><Check size={15}/>前往自媒体数据更新</button></div><small>采集完成后自动检查 account.csv 与 videos.csv 的存在性、表头、数据行和修改时间。检查通过后，到「自媒体数据更新」读取并保存网站数据。</small></section>
    </>}
  </>
}
