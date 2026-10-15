import React, { useEffect, useState } from 'react'
import { ArrowUpRight, Check, FolderPlus, RefreshCw, Save, Upload } from 'lucide-react'

const keys = ['shares', 'fans']
const empty = { shares: '', fans: '' }
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

export default function InstagramAcquisition({ api, active, onDirtyChange, onGoToUpdate }) {
  const [state, setState] = useState(null)
  const [result, setResult] = useState(null)
  const [values, setValues] = useState(empty)
  const [saved, setSaved] = useState(empty)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [logs, setLogs] = useState('')
  const dirty = !same(values, saved)
  const valid = keys.every(key => /^\d+$/.test(values[key]) && Number.isSafeInteger(Number(values[key])))
  useEffect(() => { onDirtyChange(dirty) }, [dirty, onDirtyChange])
  useEffect(() => {
    if (!active) return
    let mounted = true
    setLoading(true); setMessage(null)
    Promise.allSettled([api('acquisition/instagram/status'), api('acquisition/instagram/check')]).then(([status, checked]) => {
      if (!mounted) return
      if (status.status === 'fulfilled') setState(status.value)
      else setMessage({ type: 'error', text: status.reason.message })
      if (checked.status === 'fulfilled') {
        setResult(checked.value)
        const previous = checked.value.expected ?? checked.value.files[0]?.totals
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
  const perform = async (action, file) => {
    setBusy(true); setMessage(null)
    try {
      if (action === 'prepare') {
        const status = await api('acquisition/instagram/prepare', { method: 'POST' })
        setState(status); setResult(null); append([`目录已准备：${status.directory}`])
        return
      }
      if (action === 'check') {
        if (keys.some(key => values[key] !== '') && !valid) throw new Error('请将 shares 和 fans 全部填写为非负整数，再核对输入值')
        const checked = await api('acquisition/instagram/check', valid ? options({ totals: totals() }) : {})
        setResult(checked); setState(await api('acquisition/instagram/status'))
        append([`最新目录 ${checked.date || '不存在'}：${checked.valid ? '文件、格式与两项总量检查通过' : '尚有缺失或格式错误，请查看检查结果'}`])
        return
      }
      let response
      if (action === 'upload') {
        if (!file.name.startsWith('SuperIns_') || !/\.(xlsx|csv)$/i.test(file.name)) throw new Error('请选择 SuperIns_ 开头的 XLSX 或 CSV 导出文件')
        if (file.size > 20 * 1024 * 1024) throw new Error('单份文件最多 20 MB')
        const query = new URLSearchParams({ date: state.date, name: file.name })
        response = await api(`acquisition/instagram/upload?${query}`, { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: file })
      } else {
        if (action === 'update' && !valid) throw new Error('shares 和 fans 均须为有效的非负整数')
        if (action === 'update') append([`$ python3 scripts/instagram_acquisition.py update --date ${state.date} --totals '${JSON.stringify(totals())}'`])
        response = await api(`acquisition/instagram/${action}`, options({ date: state.date, ...(action === 'update' ? { totals: totals() } : {}) }))
      }
      setState(response.state); setResult(response.check); append(response.logs)
      if (action === 'update') setSaved({ ...values })
      setMessage({ type: 'success', text: action === 'update' ? 'shares 和 fans 已写入 videos.xlsx 的 All 行，并重新读取校验。' : response.logs.join('；') })
    } catch (error) { setMessage({ type: 'error', text: error.message }); append([`操作失败：${error.message}`]) }
    finally { setBusy(false) }
  }
  const ready = state?.exists && !busy && !loading
  return <>
    {message && <div className={`message ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</div>}
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 1</span><h2>创建当天的数据目录</h2><p>按北京时间创建当前日期文件夹，存放 Instagram 的 videos.xlsx。</p><p className="acquisition-path">{state?.directory || 'data/Instagram/YYYY-MM-DD/'}</p><div className="acquisition-toolbar"><button type="button" disabled={busy || loading} onClick={() => perform('prepare')}><FolderPlus size={16}/>{state?.exists ? '确认 / 刷新当天目录' : '创建当天目录'}</button><small>{loading ? '正在读取目录…' : state?.exists ? `${state.date} · 目录已存在` : '请先创建目录，再导入文件'}</small></div></section>
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 2</span><h2>使用 SuperIns 扫描并导出</h2><p>打开 Instagram 个人主页，使用<strong>SuperIns</strong>插件：先在<strong>“概览”</strong>中点击<strong>扫描</strong>，再到<strong>“内容”</strong>中<strong>排序并导出</strong>。</p><a className="acquisition-link" href="https://www.instagram.com/august_hachiware/" target="_blank" rel="noreferrer">打开 Instagram 个人主页<ArrowUpRight size={16}/></a><p className="instagram-download-note">下载文件名形如「SuperIns_august_hachiware_2026-10-15_43」，按「SuperIns_」前缀识别。</p><div className="acquisition-toolbar"><label className={`rednote-file-button ${!ready ? 'disabled' : ''}`}><Upload size={15}/>选择导出文件并命名为 videos<input type="file" hidden accept=".xlsx,.csv" disabled={!ready} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) perform('upload', file) }}/></label><button type="button" disabled={!ready} onClick={() => perform('normalize')}><RefreshCw size={15}/>整理目录内的 SuperIns 文件</button></div><small>{state?.file.exists ? `videos.xlsx 已存在 · ${state.file.bytes} 字节。` : '等待导入 videos.xlsx。'}支持 XLSX；若插件导出 CSV，将转换为真正的 XLSX。也可把原始文件放入当天目录，再点击整理。覆盖旧文件前自动备份。</small></section>
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 3</span><h2>写入 shares 和 fans</h2><p>输入账号总分享量 shares 和总粉丝数 fans。系统在 videos.xlsx 的最后添加 shares、fans 两列，在最后添加“All”行，将两项输入写入对应单元格；已有列和 All 行会直接复用。</p><form onSubmit={event => { event.preventDefault(); perform('update') }}><fieldset disabled={busy || loading} className="field-grid instagram-total-grid">{keys.map(key => <label key={key}>{key === 'shares' ? 'shares · 总分享量' : 'fans · 总粉丝数'}<input required type="number" min="0" max="9007199254740991" step="1" inputMode="numeric" value={values[key]} onChange={event => setValues(previous => ({ ...previous, [key]: event.target.value }))}/></label>)}</fieldset><div className="acquisition-toolbar"><button type="submit" className="primary" disabled={!ready || !valid || !state?.file.exists}><Save size={16}/>{busy ? '处理中…' : '写入 videos.xlsx 并检查'}</button><small>{dirty ? '输入尚未写入表格。' : '重复执行会更新 All 行的原单元格。'}修改前自动备份。</small></div></form>{logs && <pre className="acquisition-log rednote-log" role="region" aria-label="Instagram 文件处理日志" tabIndex={0}>{logs}</pre>}</section>
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 4</span><h2>检查最新文件、格式与两项总量</h2><p>检查最新日期目录下 videos.xlsx 是否存在且可读取，核对视频必需字段、末尾 shares / fans 两列、唯一的 All 末行及两项值与输入是否一致。</p>{result && <><p>最新日期：<strong>{result.date || '暂无日期目录'}</strong><br/><span className="acquisition-path">{result.directory}</span></p><div className={`message ${result.valid ? 'success' : 'warning'}`} role="status">{result.valid ? '文件、格式及两项总量全部检查通过。' : '文件或数据尚未准备好，请按下方提示处理。'}</div>{result.files.map(file => <div key={file.name} className={`acquisition-file ${file.valid ? 'valid' : 'invalid'}`}><strong>{file.valid ? '✓' : '×'} {file.name}</strong><span>{file.message}</span>{file.rows != null && <small>{file.rows} 行视频数据{file.totals && ` · shares：${file.totals.shares} · fans：${file.totals.fans}`}</small>}</div>)}</>}<div className="acquisition-toolbar"><button type="button" disabled={busy || loading} onClick={() => perform('check')}><RefreshCw size={15}/>检查最新目录与 shares / fans</button><button type="button" disabled={busy} onClick={onGoToUpdate}><Check size={15}/>前往自媒体数据更新</button></div><small>检查通过后，到「自媒体数据更新」读取最新脚本数据并保存。</small></section>
  </>
}
