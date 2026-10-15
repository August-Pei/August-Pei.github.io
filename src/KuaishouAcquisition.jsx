import React, { useEffect, useState } from 'react'
import { ArrowUpRight, Check, Copy, FolderPlus, RefreshCw, Save, Upload } from 'lucide-react'
import scraper from '../scripts/kuaishou_scraper.js?raw'

const keys = ['收藏量', '转发量', '粉丝量']
const empty = { 收藏量: '', 转发量: '', 粉丝量: '' }
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

function UploadButton({ kind, ready, onUpload }) {
  return <label className={`rednote-file-button ${!ready ? 'disabled' : ''}`}><Upload size={15}/>{kind === 'videos' ? '选择并导入 videos.csv' : '选择下载文件并命名为 account'}<input type="file" hidden accept={kind === 'videos' ? '.csv' : '.xlsx'} disabled={!ready} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) onUpload(file, kind) }}/></label>
}

export default function KuaishouAcquisition({ api, active, onDirtyChange, onGoToUpdate }) {
  const [state, setState] = useState(null)
  const [result, setResult] = useState(null)
  const [values, setValues] = useState(empty)
  const [saved, setSaved] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)
  const [logs, setLogs] = useState('')
  const dirty = !same(values, saved)
  const valid = keys.every(key => /^\d+$/.test(values[key]) && Number.isSafeInteger(Number(values[key])))
  useEffect(() => { onDirtyChange(dirty) }, [dirty, onDirtyChange])
  useEffect(() => {
    if (!active) return
    let mounted = true
    setLoading(true)
    setMessage(null)
    Promise.allSettled([api('acquisition/kuaishou/status'), api('acquisition/kuaishou/check')]).then(([status, checked]) => {
      if (!mounted) return
      if (status.status === 'fulfilled') setState(status.value)
      else setMessage({ type: 'error', text: status.reason.message })
      if (checked.status === 'fulfilled') {
        setResult(checked.value)
        const previous = checked.value.expected ?? checked.value.files.find(file => file.name === 'videos.csv')?.totals
        if (!dirty && previous) {
          const strings = Object.fromEntries(keys.map(key => [key, String(previous[key])]))
          setValues(strings); setSaved(strings)
        }
      } else setMessage({ type: 'error', text: checked.reason.message })
    }).finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [active, api])

  const append = lines => setLogs(previous => [previous, ...lines].filter(Boolean).join('\n'))
  const options = body => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const totals = () => Object.fromEntries(keys.map(key => [key, Number(values[key])]))
  const perform = async (action, file, kind) => {
    setBusy(true); setMessage(null)
    try {
      if (action === 'prepare') {
        const status = await api('acquisition/kuaishou/prepare', { method: 'POST' })
        setState(status); setResult(null); append([`目录已准备：${status.directory}`])
        return
      }
      if (action === 'check') {
        if (keys.some(key => values[key] !== '') && !valid) throw new Error('请将收藏量、转发量、粉丝量全部填写为非负整数，再核对输入值')
        const checked = await api('acquisition/kuaishou/check', valid ? options({ totals: totals() }) : {})
        setResult(checked); setState(await api('acquisition/kuaishou/status'))
        append([`最新目录 ${checked.date || '不存在'}：${checked.valid ? '两份文件及三项总量检查通过' : '尚有缺失或格式错误，请查看检查结果'}`])
        return
      }
      let response
      if (action === 'upload') {
        const extension = kind === 'videos' ? '.csv' : '.xlsx'
        if (!file.name.toLowerCase().endsWith(extension)) throw new Error(`请上传 ${extension} 文件`)
        if (file.size > 20 * 1024 * 1024) throw new Error('单份文件最多 20 MB')
        const query = new URLSearchParams({ date: state.date, kind, name: file.name })
        response = await api(`acquisition/kuaishou/upload?${query}`, { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: file })
      } else {
        if (action === 'update' && !valid) throw new Error('收藏量、转发量、粉丝量均须为有效的非负整数')
        if (action === 'update') append([`$ python3 scripts/kuaishou_acquisition.py update --date ${state.date} --totals '${JSON.stringify(totals())}'`])
        response = await api(`acquisition/kuaishou/${action}`, options({ date: state.date, ...(action === 'update' ? { totals: totals() } : {}) }))
      }
      setState(response.state); setResult(response.check); append(response.logs)
      if (action === 'update') setSaved({ ...values })
      setMessage({ type: 'success', text: action === 'update' ? '三项总量已写入 videos.csv，保存后的 CSV 已重新读取校验。' : response.logs.join('；') })
    } catch (error) { setMessage({ type: 'error', text: error.message }); append([`操作失败：${error.message}`]) }
    finally { setBusy(false) }
  }
  const copyScript = async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(scraper)
      else {
        const input = document.createElement('textarea')
        input.value = scraper
        input.style.position = 'fixed'; input.style.left = '-9999px'
        document.body.appendChild(input)
        try { input.select(); if (!document.execCommand('copy')) throw new Error('复制失败，请使用 localhost 打开后台后重试') }
        finally { input.remove() }
      }
      setMessage({ type: 'success', text: '数据下载脚本已复制。请在快手视频管理页面打开控制台，粘贴并运行。' })
    } catch { setMessage({ type: 'error', text: '脚本未能复制，请检查浏览器剪贴板权限并重试。' }) }
  }
  const ready = state?.exists && !busy && !loading
  const uploaded = kind => state?.files.find(file => file.kind === kind)
  return <>
    {message && <div className={`message ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</div>}
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 1</span><h2>创建当天的数据目录</h2><p>按北京时间创建当前日期文件夹，存放 videos.csv 与 account.xlsx。</p><p className="acquisition-path">{state?.directory || 'data/kuaishou/YYYY-MM-DD/'}</p><div className="acquisition-toolbar"><button type="button" disabled={busy || loading} onClick={() => perform('prepare')}><FolderPlus size={16}/>{state?.exists ? '确认 / 刷新当天目录' : '创建当天目录'}</button><small>{loading ? '正在读取目录…' : state?.exists ? `${state.date} · 目录已存在` : '请先创建目录，再导入文件'}</small></div></section>
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 2</span><h2>复制脚本并下载视频数据</h2><p>先复制数据下载脚本，再打开快手创作者服务中心的视频管理界面。等待作品列表加载，打开浏览器开发者工具的<strong>控制台（Console）</strong>，粘贴脚本并运行，将下载 videos.csv。</p><small>脚本只读取当前已加载的作品。请先滚动加载需要统计的全部作品，再执行脚本。</small><div className="acquisition-toolbar"><button type="button" onClick={copyScript}><Copy size={16}/>复制数据下载脚本</button><a className="acquisition-link" href="https://cp.kuaishou.com/article/manage/video" target="_blank" rel="noreferrer">打开快手视频管理<ArrowUpRight size={16}/></a></div><div className="acquisition-toolbar"><UploadButton kind="videos" ready={ready} onUpload={(file, kind) => perform('upload', file, kind)}/><small>{uploaded('videos')?.exists ? `videos.csv 已存在 · ${uploaded('videos').bytes} 字节` : '下载后选择文件，导入当天目录；也可自行放入该目录。'}</small></div></section>
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 3</span><h2>导出 90 天账号数据并重命名</h2><p>打开快手创作者服务中心 · 数据概览，选择<strong>近 90 天</strong>并导出，文件名通常为「帐号数据分析明细表xxxxxxxx.xlsx」。</p><a className="acquisition-link" href="https://cp.kuaishou.com/statistics/works" target="_blank" rel="noreferrer">打开快手数据概览<ArrowUpRight size={16}/></a><div className="acquisition-toolbar"><UploadButton kind="account" ready={ready} onUpload={(file, kind) => perform('upload', file, kind)}/><button type="button" disabled={!ready} onClick={() => perform('normalize')}><RefreshCw size={15}/>将目录内下载文件重命名为 account</button></div><small>{uploaded('account')?.exists ? `account.xlsx 已存在 · ${uploaded('account').bytes} 字节。` : '等待导入 account.xlsx。'}可直接选择下载文件保存为 account.xlsx，或先放入当天目录后点击重命名；保留 .xlsx 扩展名。</small></section>
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 4</span><h2>写入收藏量、转发量与粉丝量</h2><p>填写账号的三项总量。在原 videos.csv 的末尾添加三列「收藏量、转发量、粉丝量」和一行「总计」，将输入值填入总计行。已有列与总计行会复用，原有视频字段保持原样。</p><form onSubmit={event => { event.preventDefault(); perform('update') }}><fieldset disabled={busy || loading} className="kuaishou-total-grid">{keys.map(key => <label key={key}>{key}<input required type="number" min="0" max="9007199254740991" step="1" inputMode="numeric" value={values[key]} onChange={event => setValues(previous => ({ ...previous, [key]: event.target.value }))}/></label>)}</fieldset><div className="acquisition-toolbar"><button className="primary" type="submit" disabled={!ready || !valid || !uploaded('videos')?.exists}><Save size={16}/>{busy ? '处理中…' : '写入 videos.csv 并检查'}</button><small>{dirty ? '三项输入尚未写入 CSV。' : '重复执行会更新总计数值。'}修改前自动备份。</small></div></form>{logs && <pre className="acquisition-log rednote-log" role="region" aria-label="快手文件处理日志" tabIndex={0}>{logs}</pre>}</section>
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 5</span><h2>检查最新日期的文件和三项总量</h2><p>检查 videos.csv 与 account.xlsx 是否存在且可读取，核对 CSV 表头、三项末列、唯一末尾总计行，以及收藏量、转发量、粉丝量是否与输入一致。</p>{result && <><p>最新日期：<strong>{result.date || '暂无日期目录'}</strong><br/><span className="acquisition-path">{result.directory}</span></p><div className={`message ${result.valid ? 'success' : 'warning'}`} role="status">{result.valid ? '文件、CSV 格式及三项总量全部检查通过。' : '尚有文件或数据未准备好，请按下方提示补充。'}</div>{result.files.map(file => <div className={`acquisition-file ${file.valid ? 'valid' : 'invalid'}`} key={file.name}><strong>{file.valid ? '✓' : '×'} {file.name}</strong><span>{file.message}</span>{file.rows != null && <small>{file.rows} 行数据{file.totals && ` · ${keys.map(key => `${key}：${file.totals[key]}`).join(' · ')}`}</small>}</div>)}</>}<div className="acquisition-toolbar"><button type="button" disabled={busy || loading} onClick={() => perform('check')}><RefreshCw size={15}/>检查最新目录与三项总量</button><button type="button" disabled={busy} onClick={onGoToUpdate}><Check size={15}/>前往自媒体数据更新</button></div><small>全部通过后，到「自媒体数据更新」读取最新脚本数据并保存。</small></section>
  </>
}
