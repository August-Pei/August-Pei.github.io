import React, { useEffect, useState } from 'react'
import { ArrowUpRight, Check, FolderPlus, RefreshCw, Save, Upload } from 'lucide-react'

const exports = [
  ['notes', '全部笔记', '小红书创作者全部笔记-xxxx-xx-xx'],
  ['views', '30 日观看数据', '近30日观看数据'],
  ['engagement', '30 日互动数据', '近30日互动数据'],
  ['fans', '30 日涨粉数据', '近30日涨粉数据'],
]

export default function RednoteAcquisition({ api, active, onDirtyChange, onGoToUpdate }) {
  const [state, setState] = useState(null)
  const [result, setResult] = useState(null)
  const [fans, setFans] = useState('')
  const [savedFans, setSavedFans] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [logs, setLogs] = useState('')
  const dirty = fans !== savedFans
  const validFans = /^\d+$/.test(fans) && Number.isSafeInteger(Number(fans))
  useEffect(() => { onDirtyChange(dirty) }, [dirty, onDirtyChange])
  useEffect(() => {
    if (!active) return
    let mounted = true
    setLoading(true)
    // File status remains useful even if the Python environment is unavailable.
    Promise.allSettled([api('acquisition/rednote/status'), api('acquisition/rednote/check')]).then(([status, checked]) => {
      if (!mounted) return
      if (status.status === 'fulfilled') setState(status.value)
      else setMessage({ type: 'error', text: status.reason.message })
      if (checked.status === 'fulfilled') {
        setResult(checked.value)
        const previous = checked.value.expectedFans ?? checked.value.files.find(file => file.name === 'notes.xlsx')?.fans
        if (!dirty && previous != null) { setFans(String(previous)); setSavedFans(String(previous)) }
      } else setMessage({ type: 'error', text: checked.reason.message })
    }).finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [active, api])

  const append = lines => { if (lines?.length) setLogs(previous => [previous, ...lines].filter(Boolean).join('\n')) }
  const jsonOptions = body => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const perform = async (action, file, kind) => {
    setBusy(true); setMessage(null)
    try {
      if (action === 'prepare') {
        const status = await api('acquisition/rednote/prepare', { method: 'POST' })
        setState(status); append([`目录已准备：${status.directory}`]); setResult(null)
      } else if (action === 'upload') {
        if (file.size > 20 * 1024 * 1024) throw new Error('Excel 文件最多 20 MB')
        if (!/\.xlsx$/i.test(file.name)) throw new Error('请上传 .xlsx 文件')
        const response = await api(`acquisition/rednote/upload?date=${state.date}&kind=${kind}&name=${encodeURIComponent(file.name)}`, {
          method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: file,
        })
        setState(response); setResult(null); append(response.logs)
        setMessage({ type: 'success', text: `${file.name} 已导入为 ${kind}.xlsx。` })
      } else if (action === 'check') {
        if (fans && !validFans) throw new Error('粉丝数必须是有效的非负整数')
        const checked = await api(`acquisition/rednote/check${fans ? `?fans=${fans}` : ''}`)
        setResult(checked); setState(await api('acquisition/rednote/status'))
        append([`最新目录 ${checked.date || '不存在'}：${checked.valid ? '四份文件及总计粉丝数检查通过' : '尚有缺失或格式错误，请查看检查结果'}`])
      } else {
        if (action === 'update' && !validFans) throw new Error('请填写有效的非负整数粉丝数')
        if (action === 'update') append([`$ python3 scripts/rednote_acquisition.py update --date ${state.date} --fans ${fans}`])
        const response = await api(`acquisition/rednote/${action}`, jsonOptions({ date: state.date, ...(action === 'update' ? { fans: Number(fans) } : {}) }))
        append(response.logs); setResult(response.check)
        if (action === 'update') {
          setSavedFans(fans)
          setMessage({ type: 'success', text: `已写入总计粉丝数 ${fans}，并重新打开 notes.xlsx 校验。` })
        }
        setState(await api('acquisition/rednote/status'))
      }
    } catch (error) { setMessage({ type: 'error', text: error.message }); append([`操作失败：${error.message}`]) }
    finally { setBusy(false) }
  }
  const ready = state?.exists && !busy && !loading
  return <>
    {message && <div className={`message ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</div>}
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 1</span><h2>创建当天的数据目录</h2><p>按北京时间创建日期文件夹，后续四份 Excel 文件统一存放在这里。</p><p className="acquisition-path">{state?.directory || 'data/rednote/YYYY-MM-DD/'}</p><div className="acquisition-toolbar"><button type="button" disabled={busy || loading} onClick={() => perform('prepare')}><FolderPlus size={16}/>{state?.exists ? '确认 / 刷新当天目录' : '创建当天目录'}</button><small>{loading ? '正在读取目录…' : state?.exists ? `${state.date} · 目录已存在` : '请先创建目录，再导入文件'}</small></div></section>
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 2</span><h2>下载全部笔记信息</h2><p>打开小红书笔记管理界面，登录后打开 <strong>XHS Creator Analytics 插件下载笔记信息</strong>。下载文件名通常为「小红书创作者全部笔记-xxxx-xx-xx.xlsx」。</p><a className="acquisition-link" href="https://creator.xiaohongshu.com/new/note-manager" target="_blank" rel="noreferrer">打开小红书笔记管理<ArrowUpRight size={16}/></a></section>
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 3</span><h2>下载账号概览的 30 日数据</h2><p>打开数据看板 · 账号概览，选择近 30 日，分别下载观看数据、互动数据和涨粉数据，保留下载文件中的全部工作表。</p><p>文件名分别为「近30日观看数据.xlsx」「近30日互动数据.xlsx」「近30日涨粉数据.xlsx」。</p><a className="acquisition-link" href="https://creator.xiaohongshu.com/statistics/account/v2" target="_blank" rel="noreferrer">打开小红书数据看板 · 账号概览<ArrowUpRight size={16}/></a></section>
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 4</span><h2>导入文件并统一命名</h2><p>为每一项选择对应的下载文件，系统会复制到当天目录并自动重命名，保留 .xlsx 扩展名。替换已有文件前会自动备份。</p>
      <div className="rednote-uploads">{exports.map(([kind, label, original]) => {
        const file = state?.files.find(item => item.kind === kind)
        return <div className="rednote-upload" key={kind}><div><strong>{label} → {kind}.xlsx</strong><small>{original}.xlsx</small><small>{file?.exists ? `已导入 · ${file.bytes} 字节` : '等待导入'}</small></div><label className={`rednote-file-button ${!ready ? 'disabled' : ''}`}><Upload size={15}/>{file?.exists ? '替换文件' : '选择文件'}<input type="file" hidden accept=".xlsx" disabled={!ready} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) perform('upload', file, kind) }}/></label></div>
      })}</div>
      <div className="acquisition-toolbar"><button type="button" disabled={!ready} onClick={() => perform('normalize')}><RefreshCw size={15}/>重命名目录内的原始下载文件</button></div><small>也可以自行把四份原始下载文件放入当天目录，再点击上方重命名按钮；同类文件重复时会提示处理。</small>
    </section>
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 5</span><h2>写入账号总粉丝数</h2><p>输入账号当前的总粉丝数。系统通过本机 Python 命令修改 notes.xlsx：在末列添加「粉丝数」、末行添加「总计」，将输入值写入对应单元格；已有列和总计行会直接复用。</p>
      <form className="rednote-fans-form" onSubmit={event => { event.preventDefault(); perform('update') }}><label>小红书粉丝数<input type="number" min="0" max="9007199254740991" step="1" inputMode="numeric" required value={fans} disabled={busy || loading} onChange={event => setFans(event.target.value)}/></label><button type="submit" className="primary" disabled={!ready || !validFans || !state?.files.find(file => file.kind === 'notes')?.exists}><Save size={16}/>{busy ? '处理中…' : '写入 notes.xlsx 并检查'}</button></form>
      <small>{dirty ? '粉丝数输入尚未写入表格。' : '重复执行会更新原单元格，不会重复添加列或行。'}原始笔记数据和其余工作表保持原样。</small>
      {logs && <pre className="acquisition-log rednote-log" role="region" aria-label="小红书文件处理日志" tabIndex={0}>{logs}</pre>}
    </section>
    <section className="admin-panel acquisition-step"><span className="acquisition-step-number">STEP 6</span><h2>检查最新日期的文件与笔记表格式</h2><p>检查 notes.xlsx、views.xlsx、engagement.xlsx、fans.xlsx 是否存在且能够读取；核对趋势工作表、笔记列名、末尾总计行与输入的粉丝数。</p>
      {result && <><p>最新日期：<strong>{result.date || '暂无日期目录'}</strong><br/><span className="acquisition-path">{result.directory}</span></p><div className={`message ${result.valid ? 'success' : 'warning'}`} role="status">{result.valid ? '四份文件及笔记表格式检查通过。' : '文件或笔记表尚未全部准备好，请按下方提示补充。'}</div>{result.files.map(file => <div key={file.name} className={`acquisition-file ${file.valid ? 'valid' : 'invalid'}`}><strong>{file.valid ? '✓' : '×'} {file.name}</strong><span>{file.message}</span>{file.valid && <small>{file.rows} 行数据{file.fans != null && ` · 总计粉丝数：${file.fans}`}</small>}</div>)}</>}
      <div className="acquisition-toolbar"><button type="button" disabled={busy || loading} onClick={() => perform('check')}><RefreshCw size={15}/>检查最新目录及粉丝数</button><button type="button" disabled={busy} onClick={onGoToUpdate}><Check size={15}/>前往自媒体数据更新</button></div><small>全部检查通过后，到「自媒体数据更新」读取最新脚本数据并保存，才会更新网站展示。</small>
    </section>
  </>
}
