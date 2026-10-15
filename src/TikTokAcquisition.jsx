import React, { useEffect, useState } from 'react'
import { ArrowUpRight, Check, FolderPlus, RefreshCw, Upload } from 'lucide-react'
import videoFields from './assets/admin-guides/tiktok-video-fields.png'
import creatorFields from './assets/admin-guides/tiktok-creator-fields.png'

const exports = [
  ['videos', '插件导出的视频数据', '【社媒助手】', 'videos.xlsx'],
  ['account', 'Studio 账号分析 ZIP', 'Overview', 'account.xlsx'],
]

export default function TikTokAcquisition({ api, active, onGoToUpdate }) {
  const [state, setState] = useState(null)
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [logs, setLogs] = useState('')
  useEffect(() => {
    if (!active) return
    let mounted = true
    setLoading(true); setMessage(null)
    Promise.all([api('acquisition/tiktok/status'), api('acquisition/tiktok/check')]).then(([status, checked]) => {
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
        const status = await api('acquisition/tiktok/prepare', { method: 'POST' })
        setState(status); setResult(null); append([`目录已准备：${status.directory}`])
      } else if (action === 'check') {
        const [checked, status] = await Promise.all([api('acquisition/tiktok/check'), api('acquisition/tiktok/status')])
        setState(status); setResult(checked)
        append([`最新目录 ${checked.date || '不存在'}：${checked.valid ? '两份文件均存在且非空' : '文件尚未全部准备好，请查看检查结果'}`])
      } else {
        let response
        if (action === 'upload') {
          const prefix = exports.find(item => item[0] === kind)[2]
          if (!file.name.startsWith(prefix)) throw new Error(`请选择以「${prefix}」开头的对应下载文件`)
          if (!(kind === 'account' ? /\.(zip|xlsx)$/i : /\.xlsx$/i).test(file.name)) throw new Error(kind === 'account' ? '请选择 Studio 下载的 ZIP，或已解压的 Overview.xlsx' : '请选择 XLSX 视频下载文件')
          if (file.size > 20 * 1024 * 1024) throw new Error('单份文件最多 20 MB')
          const query = new URLSearchParams({ date: state.date, kind, name: file.name })
          response = await api(`acquisition/tiktok/upload?${query}`, { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: file })
        } else response = await api('acquisition/tiktok/normalize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ date: state.date }) })
        setState(response.state); setResult(response.check); append(response.logs)
        setMessage({ type: 'success', text: response.logs.join('；') })
      }
    } catch (error) { setMessage({ type: 'error', text: error.message }); append([`操作失败：${error.message}`]) }
    finally { setBusy(false) }
  }
  const ready = state?.exists && !busy && !loading
  return <>
    {message && <div className={`message ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</div>}
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 1</span><h2>创建当天的数据目录</h2><p>按北京时间创建当前日期文件夹，存放 TikTok 的两份导出数据。</p><p className="acquisition-path">{state?.directory || 'data/TikTok/YYYY-MM-DD/'}</p><div className="acquisition-toolbar"><button type="button" disabled={busy || loading} onClick={() => perform('prepare')}><FolderPlus size={16}/>{state?.exists ? '确认 / 刷新当天目录' : '创建当天目录'}</button><small>{loading ? '正在读取目录…' : state?.exists ? `${state.date} · 目录已存在` : '请先创建目录，再导入文件'}</small></div></section>
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 2</span><h2>使用“社媒助手”导出视频数据</h2><p>打开 TikTok 个人主页，使用<strong>“社媒助手”</strong>插件，点击<strong>“采集本页视频”</strong>并导出 Excel 数据。按下方两张图勾选导出字段，点击图片可查看原图。</p><a className="acquisition-link" href="https://www.tiktok.com/@august_hachiware?_r=1&_t=ZS-99kXrIqeHHm" target="_blank" rel="noreferrer">打开 TikTok 个人主页<ArrowUpRight size={16}/></a>
      <div className="tiktok-field-guides"><figure><figcaption>视频信息 · 勾选 8 项</figcaption><a href={videoFields} target="_blank" rel="noreferrer"><img src={videoFields} alt="视频信息勾选：视频ID、视频类型、视频描述、播放量、点赞量、收藏量、评论量、分享量" loading="lazy"/></a></figure><figure><figcaption>达人信息 · 勾选 3 项</figcaption><a href={creatorFields} target="_blank" rel="noreferrer"><img src={creatorFields} alt="达人信息勾选：达人UID、用户名、粉丝数；其他和采集信息不勾选" loading="lazy"/></a></figure></div>
      <small>视频信息：视频 ID、视频类型、视频描述、播放量、点赞量、收藏量、评论量、分享量；达人信息：达人 UID、用户名、粉丝数。其余字段按图保持未勾选。</small><p className="tiktok-download-note">下载文件名形如「【社媒助手】达人「undefined」的视频数据-20261015-1510.xlsx」，只按「【社媒助手】」前缀识别，不限制达人名和时间。</p>
    </section>
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 3</span><h2>下载 Studio 过去 365 天的分析数据</h2><p>打开 TikTok Studio 数据分析页面，选择<strong>过去 365 天</strong>，点击右上角<strong>“下载数据”</strong>。</p><a className="acquisition-link" href="https://www.tiktok.com/tiktokstudio/analytics?dateRange=%7B%22type%22%3A%22fixed%22%2C%22pastDay%22%3A365%7D" target="_blank" rel="noreferrer">打开 TikTok Studio 数据分析<ArrowUpRight size={16}/></a><p className="tiktok-download-note">下载文件名形如「Overview_2025-10-14_1791875425_august_hachiware.zip」，只按「Overview」前缀识别；压缩包中的 Overview.xlsx 将解压并命名为 account.xlsx。</p></section>
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 4</span><h2>导入文件并统一命名</h2><p>视频选择插件导出的 XLSX，账号选择 Studio 下载的 ZIP。系统将 ZIP 中的 Overview.xlsx 解压并命名为 account.xlsx，成功后删除导入的 ZIP；已有表格替换前自动备份。</p><div className="rednote-uploads">{exports.map(([kind, label, prefix, name]) => {
      const saved = state?.files.find(item => item.kind === kind)
      return <div className="rednote-upload" key={kind}><div><strong>{label} → {name}</strong><small>识别前缀：{prefix}{kind === 'account' ? ' · ZIP → Overview.xlsx → account.xlsx' : ' · XLSX'}</small><small>{saved?.exists ? `已导入 · ${saved.bytes} 字节` : '等待导入'}</small></div><label className={`rednote-file-button ${!ready ? 'disabled' : ''}`}><Upload size={15}/>{saved?.exists ? '替换文件' : '选择下载文件'}<input type="file" hidden accept={kind === 'account' ? '.zip,.xlsx' : '.xlsx'} disabled={!ready} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) perform('upload', file, kind) }}/></label></div>
    })}</div><div className="acquisition-toolbar"><button type="button" disabled={!ready} onClick={() => perform('normalize')}><RefreshCw size={15}/>解压并整理目录内的下载文件</button></div><small>也可以自行把视频 XLSX 和 Overview ZIP 放入当天目录，再点击整理；解压成功后删除该 ZIP。上传时，Downloads 中同名且内容完全一致的原 ZIP 也会删除；其他来源的原文件需自行清理。支持直接导入已解压的 Overview.xlsx。</small>{logs && <pre className="acquisition-log rednote-log" role="region" aria-label="TikTok 文件处理日志" tabIndex={0}>{logs}</pre>}</section>
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 5</span><h2>检查最新日期的两份文件</h2><p>检查最新日期文件夹中的 videos.xlsx 和 account.xlsx 是否存在且非空。</p>{result && <><p>最新日期：<strong>{result.date || '暂无日期目录'}</strong><br/><span className="acquisition-path">{result.directory}</span></p><div className={`message ${result.valid ? 'success' : 'warning'}`} role="status">{result.valid ? '两份文件均存在且非空。' : '文件尚未全部准备好，请按提示补充。'}</div>{result.files.map(file => <div key={file.name} className={`acquisition-file ${file.valid ? 'valid' : 'invalid'}`}><strong>{file.valid ? '✓' : '×'} {file.name}</strong><span>{file.message}</span>{file.exists && <small>{file.bytes} 字节</small>}</div>)}</>}<div className="acquisition-toolbar"><button type="button" disabled={busy || loading} onClick={() => perform('check')}><RefreshCw size={15}/>检查最新目录</button><button type="button" disabled={busy} onClick={onGoToUpdate}><Check size={15}/>前往自媒体数据更新</button></div><small>导入或解压整理后自动检查文件。全部准备好后，到「自媒体数据更新」读取并保存网站数据。</small></section>
  </>
}
