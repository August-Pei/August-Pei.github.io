import React, { useEffect, useState } from 'react'
import { ArrowUpRight, Check, FolderPlus, RefreshCw, Upload } from 'lucide-react'

const exports = [
  ['videos', '作品列表', '作品列表导出', 'videos.xlsx'],
  ['metrics', '90 日播放与互动数据', '数据表现_短视频全量指标', 'views & engagement.xlsx'],
  ['fans', '90 日粉丝量数据', '数据表现_粉丝全量指标', 'fans.xlsx'],
]

export default function DouyinAcquisition({ api, active, onGoToUpdate }) {
  const [state, setState] = useState(null)
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [logs, setLogs] = useState('')
  useEffect(() => {
    if (!active) return
    let mounted = true
    setLoading(true)
    setMessage(null)
    Promise.all([api('acquisition/douyin/status'), api('acquisition/douyin/check')]).then(([status, checked]) => {
      if (mounted) { setState(status); setResult(checked) }
    }).catch(error => { if (mounted) setMessage({ type: 'error', text: error.message }) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [active, api])
  const append = lines => setLogs(previous => [previous, ...lines].filter(Boolean).join('\n'))
  const perform = async (action, file, kind) => {
    setBusy(true); setMessage(null)
    try {
      if (action === 'prepare') {
        const response = await api('acquisition/douyin/prepare', { method: 'POST' })
        setState(response); setResult(null); append([`目录已准备：${response.directory}`])
      } else if (action === 'check') {
        const [checked, status] = await Promise.all([api('acquisition/douyin/check'), api('acquisition/douyin/status')])
        setResult(checked); setState(status)
        append([`最新目录 ${checked.date || '不存在'}：${checked.valid ? '三份文件均存在且非空' : '文件尚未全部准备好，请查看检查结果'}`])
      } else {
        let response
        if (action === 'upload') {
          if (!/\.xlsx$/i.test(file.name)) throw new Error('请上传 .xlsx 文件，保留 Excel 格式')
          if (file.size > 20 * 1024 * 1024) throw new Error('单份 Excel 文件最多 20 MB')
          const params = new URLSearchParams({ date: state.date, kind, name: file.name })
          response = await api(`acquisition/douyin/upload?${params}`, { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: file })
        } else {
          response = await api('acquisition/douyin/normalize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: state.date }) })
        }
        setState(response.state); setResult(response.check); append(response.logs)
        setMessage({ type: 'success', text: response.logs.join('；') })
      }
    } catch (error) { setMessage({ type: 'error', text: error.message }); append([`操作失败：${error.message}`]) }
    finally { setBusy(false) }
  }
  const ready = state?.exists && !busy && !loading
  return <>
    {message && <div className={`message ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</div>}
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 1</span><h2>创建当天的数据目录</h2><p>按北京时间创建当前日期文件夹，三份抖音 Excel 文件统一存放在这里。</p><p className="acquisition-path">{state?.directory || 'data/douyin/YYYY-MM-DD/'}</p><div className="acquisition-toolbar"><button type="button" disabled={busy || loading} onClick={() => perform('prepare')}><FolderPlus size={16}/>{state?.exists ? '确认 / 刷新当天目录' : '创建当天目录'}</button><small>{loading ? '正在读取目录…' : state?.exists ? `${state.date} · 目录已存在` : '请先创建目录，再导入文件'}</small></div></section>
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 2</span><h2>导出作品列表</h2><p>打开抖音创作者中心 · 内容管理，登录后点击右上角的<strong>「导出数据」</strong>。下载的文件名通常为「作品列表导出.xlsx」。</p><a className="acquisition-link" href="https://creator.douyin.com/creator-micro/content/manage" target="_blank" rel="noreferrer">打开抖音内容管理<ArrowUpRight size={16}/></a></section>
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 3</span><h2>下载 90 日播放、互动与粉丝数据</h2><p>打开抖音创作者中心 · 数据中心，将时间范围设为<strong>近 90 日</strong>，下载包含<strong>播放量、点赞量、分享量、评论量</strong>的同一份文件「数据表现_短视频全量指标.xlsx」。</p><p>再下载 90 日的粉丝量数据，文件名为「数据表现_粉丝全量指标.xlsx」。</p><a className="acquisition-link" href="https://creator.douyin.com/creator-micro/data-center/operation" target="_blank" rel="noreferrer">打开抖音数据中心<ArrowUpRight size={16}/></a></section>
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 4</span><h2>导入文件并统一命名</h2><p>分别选择对应的下载文件，系统将其复制到当天目录并重命名，保留 .xlsx 扩展名。替换已有文件前会自动备份。</p><div className="rednote-uploads">{exports.map(([kind, label, original, name]) => {
      const saved = state?.files.find(item => item.kind === kind)
      return <div className="rednote-upload" key={kind}><div><strong>{label} → {name}</strong><small>{original}.xlsx</small><small>{saved?.exists ? `已导入 · ${saved.bytes} 字节` : '等待导入'}</small></div><label className={`rednote-file-button ${!ready ? 'disabled' : ''}`}><Upload size={15}/>{saved?.exists ? '替换文件' : '选择文件'}<input type="file" hidden accept=".xlsx" disabled={!ready} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) perform('upload', file, kind) }}/></label></div>
    })}</div><div className="acquisition-toolbar"><button type="button" disabled={!ready} onClick={() => perform('normalize')}><RefreshCw size={15}/>重命名目录内的原始下载文件</button></div><small>也可自行把三份原始下载文件放入当天目录，再点击重命名。重复候选或文件名冲突会提示处理。</small>{logs && <pre className="acquisition-log rednote-log" role="region" aria-label="抖音文件处理日志" tabIndex={0}>{logs}</pre>}</section>
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 5</span><h2>检查最新日期的三份文件</h2><p>检查最新日期文件夹中的 videos.xlsx、views &amp; engagement.xlsx、fans.xlsx 是否存在且非空。</p>{result && <><p>最新日期：<strong>{result.date || '暂无日期目录'}</strong><br/><span className="acquisition-path">{result.directory}</span></p><div className={`message ${result.valid ? 'success' : 'warning'}`} role="status">{result.valid ? '三份文件均存在且非空。' : '文件尚未全部准备好，请按提示补充。'}</div>{result.files.map(file => <div key={file.name} className={`acquisition-file ${file.valid ? 'valid' : 'invalid'}`}><strong>{file.valid ? '✓' : '×'} {file.name}</strong><span>{file.message}</span>{file.exists && <small>{file.bytes} 字节</small>}</div>)}</>}<div className="acquisition-toolbar"><button type="button" disabled={busy || loading} onClick={() => perform('check')}><RefreshCw size={15}/>检查最新目录</button><button type="button" disabled={busy} onClick={onGoToUpdate}><Check size={15}/>前往自媒体数据更新</button></div><small>导入或重命名后自动检查文件。准备完成后，到「自媒体数据更新」读取最新脚本数据并保存。</small></section>
  </>
}
