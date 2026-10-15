import React, { useEffect, useState } from 'react'
import { Check, Copy, Download, FolderPlus, RefreshCw } from 'lucide-react'

const analyticsUrl = 'https://studio.youtube.com/channel/UCgkFWzLNPy-_LwbxhJzJXgg/analytics/tab-overview/period-default'
const displayTime = value => new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })

export default function YouTubeAcquisition({ api, active, onGoToUpdate }) {
  const [state, setState] = useState(null)
  const [selected, setSelected] = useState('')
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [logs, setLogs] = useState('')
  const adopt = status => {
    setState(status)
    setSelected(previous => status.candidates.some(file => file.name === previous) ? previous : status.candidates[0]?.name || '')
  }
  useEffect(() => {
    if (!active) return
    let mounted = true
    setLoading(true); setMessage(null)
    Promise.allSettled([api('acquisition/youtube/status'), api('acquisition/youtube/check')]).then(([status, checked]) => {
      if (!mounted) return
      if (status.status === 'fulfilled') adopt(status.value)
      else setMessage({ type: 'error', text: status.reason.message })
      if (checked.status === 'fulfilled') setResult(checked.value)
      else setMessage({ type: 'error', text: checked.reason.message })
    }).finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [active, api])
  const append = lines => setLogs(previous => [previous, ...lines].filter(Boolean).join('\n'))
  const perform = async action => {
    setBusy(true); setMessage(null)
    try {
      if (action === 'refresh') adopt(await api('acquisition/youtube/status'))
      else if (action === 'prepare') {
        const status = await api('acquisition/youtube/prepare', { method: 'POST' })
        adopt(status); setResult(null); append([`目录已准备：${status.directory}`])
      } else if (action === 'check') {
        const checked = await api('acquisition/youtube/check')
        setResult(checked); adopt(await api('acquisition/youtube/status'))
        append([`最新目录 ${checked.date || '不存在'}：${checked.valid ? '两份 CSV 文件检查通过' : '尚有缺失或格式错误，请查看检查结果'}`])
      } else {
        if (!selected) throw new Error('请先下载 ZIP 并刷新列表，选择需要导入的文件')
        const response = await api('acquisition/youtube/import', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: state.date, name: selected }) })
        adopt(response.state); setResult(response.check); append(response.logs)
        setMessage({ type: 'success', text: 'YouTube 数据已导入为 videos.csv 和 account.csv，ZIP 与本次解压文件夹已清理。' })
      }
    } catch (error) { setMessage({ type: 'error', text: error.message }); append([`操作失败：${error.message}`]) }
    finally { setBusy(false) }
  }
  const copyLink = async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(analyticsUrl)
      else {
        const input = document.createElement('textarea')
        input.value = analyticsUrl; input.style.position = 'fixed'; input.style.left = '-9999px'
        document.body.appendChild(input)
        try { input.select(); if (!document.execCommand('copy')) throw new Error('复制失败') }
        finally { input.remove() }
      }
      setMessage({ type: 'success', text: '分析页链接已复制，请在浏览器中粘贴打开，然后进入高级模式。' })
    } catch { setMessage({ type: 'error', text: '链接未能复制，请检查浏览器剪贴板权限后重试。' }) }
  }
  const ready = !busy && !loading
  return <>
    {message && <div className={`message ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</div>}
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 1</span><h2>创建当天的数据目录</h2><p>按北京时间创建日期文件夹，存放 YouTube 的 videos.csv 与 account.csv。</p><p className="acquisition-path">{state?.directory || 'data/YouTube/YYYY-MM-DD/'}</p><div className="acquisition-toolbar"><button type="button" disabled={!ready} onClick={() => perform('prepare')}><FolderPlus size={16}/>{state?.exists ? '确认 / 刷新当天目录' : '创建当天目录'}</button><small>{loading ? '正在读取目录…' : state?.exists ? `${state.date} · 目录已存在` : '请先创建当天目录'}</small></div></section>
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 2</span><h2>复制 YouTube 工作室分析页链接</h2><p>点击按钮复制链接，在浏览器中粘贴打开 YouTube 工作室数据分析页面，登录后进入<strong>高级模式</strong>。</p><button type="button" onClick={copyLink}><Copy size={16}/>复制 YouTube 分析页链接</button></section>
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 3</span><h2>选择指标并下载 365 天数据</h2><p>在高级模式的<strong>「指标」</strong>中勾选：<strong>观看次数、订阅人数、赞、分享数、添加的评论数</strong>。</p><p>左上角选择<strong>「获得的订阅人数」</strong>和<strong>「观看次数」</strong>，时间范围选择<strong>365 天</strong>，然后下载数据文件。</p><small>选择 CSV 导出，ZIP 下载到 /Users/pyh/Downloads/。文件名形如「内容 2025-10-14_2026-10-14 August.zip」。</small></section>
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 4</span><h2>导入下载 ZIP 并整理文件</h2><p>从 Downloads 中选择本次下载的压缩包。系统将其移入当天目录、解压，将「表格数据.csv」命名为 videos.csv、「总计.csv」命名为 account.csv，并放入日期目录。</p><p>两份 CSV 检查通过后，删除导入的 ZIP 和本次解压文件夹。已有 CSV 在替换前会自动备份。</p>
      {state?.downloadsError && <div className="message error" role="alert">{state.downloadsError}</div>}
      <label className="youtube-archive-select">选择下载的 YouTube ZIP<select value={selected} disabled={!ready} onChange={event => setSelected(event.target.value)}><option value="">{state?.candidates.length ? '请选择压缩包…' : '暂未找到匹配的下载文件'}</option>{state?.candidates.map(file => <option key={file.name} value={file.name}>{file.name} · {Math.ceil(file.bytes / 1024)} KB · {displayTime(file.modifiedAt)}</option>)}</select></label>
      <div className="acquisition-toolbar"><button type="button" disabled={!ready} onClick={() => perform('refresh')}><RefreshCw size={15}/>刷新 Downloads 列表</button><button type="button" className="primary" disabled={!ready || !state?.exists || !selected} onClick={() => perform('import')}><Download size={16}/>{busy ? '处理中…' : '移动 ZIP、解压并整理'}</button></div><small>列表按修改时间由新到旧排列，默认选中最新下载。请确认所选频道与时间范围后导入。</small>{logs && <pre className="acquisition-log rednote-log" role="region" aria-label="YouTube 导入处理日志" tabIndex={0}>{logs}</pre>}</section>
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 5</span><h2>检查最新日期的文件</h2><p>检查最新日期目录中的 videos.csv、account.csv 是否存在且能够读取，同时核对导出的所需指标与数据行。</p>{result && <><p>最新日期：<strong>{result.date || '暂无日期目录'}</strong><br/><span className="acquisition-path">{result.directory}</span></p><div className={`message ${result.valid ? 'success' : 'warning'}`} role="status">{result.valid ? '两份 CSV 文件检查通过。' : '文件或指标尚未准备好，请按下方提示处理。'}</div>{result.files.map(file => <div key={file.name} className={`acquisition-file ${file.valid ? 'valid' : 'invalid'}`}><strong>{file.valid ? '✓' : '×'} {file.name}</strong><span>{file.message}</span>{file.valid && <small>{file.rows} 行数据 · {file.bytes} 字节</small>}</div>)}</>}<div className="acquisition-toolbar"><button type="button" disabled={!ready} onClick={() => perform('check')}><RefreshCw size={15}/>检查最新目录</button><button type="button" disabled={busy} onClick={onGoToUpdate}><Check size={15}/>前往自媒体数据更新</button></div><small>全部通过后，到「自媒体数据更新」读取最新脚本数据并保存。</small></section>
  </>
}
