import React, { useEffect, useRef, useState } from 'react'
import { ArrowDown, RefreshCw, Save, Upload, X } from 'lucide-react'

const size = bytes => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`
export default function ResumeManager({ api, onDirtyChange }) {
  const [current, setCurrent] = useState(null)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)
  const input = useRef(null)
  const lock = useRef(false)
  useEffect(() => { onDirtyChange(!!file || busy) }, [file, busy, onDirtyChange])
  const load = async () => {
    if (lock.current) return
    lock.current = true; setBusy(true); setMessage(null)
    try { setCurrent(await api('resume')) }
    catch (error) { setMessage({ type: 'error', text: error.message }) }
    finally { lock.current = false; setBusy(false) }
  }
  useEffect(() => { load() }, [])
  const save = async () => {
    if (!file || !current || lock.current) return
    lock.current = true; setBusy(true); setMessage(null)
    try {
      const params = new URLSearchParams({ name: file.name, revision: current.revision })
      const result = await api(`resume/upload?${params}`, { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: file })
      setCurrent(result); setFile(null)
      setMessage({ type: 'success', text: '新简历已保存。刷新前台后，首页和联系页将下载此版本；线上网站需重新发布后生效。' })
    } catch (error) { setMessage({ type: 'error', text: error.message }) }
    finally { lock.current = false; setBusy(false) }
  }
  return <>
    {message && <div className={`message ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</div>}
    <section className="admin-panel resume-panel">
      <div className="resume-heading"><h2>当前下载版本</h2><button type="button" disabled={busy} onClick={load}><RefreshCw size={15}/>刷新当前版本</button></div>
      {current ? <>
        <strong className="resume-filename">{current.data.name}</strong>
        <p>{size(current.data.size)} · {current.data.updatedAt ? `更新于 ${new Date(current.data.updatedAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false })}` : '网站初始版本'}</p>
        <a className="acquisition-link" href={current.data.path} download={current.data.downloadName}><ArrowDown size={16}/>下载当前简历</a>
      </> : <p>{busy ? '正在读取当前简历…' : '尚未读取到简历，请刷新当前版本后重试。'}</p>}
    </section>
    <section className="admin-panel resume-panel">
      <h2>上传新版本</h2>
      <p>支持 PDF 和 Word（.docx），单份最多 20 MB。选择文件后点击「保存新简历」，同时更新首页和联系页的下载入口。</p>
      <input ref={input} type="file" accept=".pdf,.docx" hidden onChange={event => {
        const selected = event.target.files?.[0]; event.target.value = ''
        if (!selected) return
        if (!/\.(pdf|docx)$/i.test(selected.name) || !selected.size || selected.size > 20 * 1024 * 1024) {
          setMessage({ type: 'error', text: '请选择非空的 PDF 或 DOCX 文件，大小不超过 20 MB。' }); return
        }
        setFile(selected); setMessage(null)
      }}/>
      <div className="acquisition-toolbar">
        <button type="button" disabled={busy} onClick={() => input.current.click()}><Upload size={16}/>{file ? '重新选择文件' : '选择简历文件'}</button>
        <button type="button" className="primary" disabled={busy || !file || !current} onClick={save}><Save size={16}/>{busy ? '处理中…' : '保存新简历'}</button>
        {file && <button type="button" disabled={busy} onClick={() => { setFile(null); setMessage(null) }}><X size={15}/>取消选择</button>}
      </div>
      {file && <div className="resume-selection"><strong>{file.name}</strong><small>{size(file.size)} · 待保存</small></div>}
      <small>保存前自动备份旧版本配置，旧简历文件保留。保存到本地后，需按现有流程重新发布网站，访客才能下载新版本。</small>
    </section>
  </>
}
