import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowDown, ArrowUp, ArrowUpRight, Check, CloudUpload, Disc3, FileText, FileJson, Music2, Pencil, Plus, RefreshCw, Save, Trash2, Upload, X } from 'lucide-react'
import { validateContent, validateSocialData, SOCIAL_PLATFORMS } from './content-schema.js'
import SocialAcquisition from './SocialAcquisition.jsx'
import ResumeManager from './ResumeManager.jsx'
import PublishManager from './PublishManager.jsx'
import SortableContentList from './SortableContentList.jsx'
import './admin.css'

let sessionToken = ''
async function api(endpoint, options = {}) {
  const response = await fetch(`/api/admin/${endpoint}`, {
    ...options, cache: 'no-store',
    headers: { 'X-Admin-Token': sessionToken, ...options.headers },
  })
  const text = await response.text()
  let result
  try { result = JSON.parse(text) } catch { throw new Error('管理接口不可用，请通过 npm run dev 启动，并使用 localhost 打开 /admin.html。') }
  if (!response.ok) throw new Error(result.error || `请求失败（${response.status}）`)
  return result
}
const clone = value => JSON.parse(JSON.stringify(value))
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right)
const number = value => value == null ? '—' : new Intl.NumberFormat('zh-CN').format(value)
const time = value => value ? new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }) : '尚未保存'
const json = value => value ? JSON.stringify(value, null, 2) : ''
const tabs = [
  { key: 'acquisition', name: '自媒体数据获取', icon: ArrowDown },
  { key: 'social', name: '自媒体数据更新', icon: RefreshCw },
  { key: 'albumWall', name: '启发我的音乐', icon: Disc3 },
  { key: 'recentAlbums', name: '最近在听', icon: Disc3 },
  { key: 'musicWorks', name: '音乐作品', icon: Music2 },
  { key: 'resume', name: '简历更新', icon: FileText },
]
function download(value, name) {
  const url = URL.createObjectURL(new Blob([json(value)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function AssetField({ label, kind, value, onChange, assets, onUpload }) {
  const fileRef = useRef(null)
  const choices = assets.filter(asset => asset.kind === kind)
  const accept = kind === 'image' ? '.jpg,.jpeg,.png,.webp,.gif,.avif' : '.mp3,.wav,.m4a,.ogg,.flac'
  return <div className="admin-field">
    <label>{label}<input value={value || ''} onChange={event => onChange(event.target.value)} placeholder={kind === 'image' ? '/albums/… 或 https://…' : '/music/… 或 https://…'} /></label>
    <div className="asset-tools">
      <select aria-label={`选择已有${label}`} value="" onChange={event => { if (event.target.value) onChange(event.target.value) }}>
        <option value="">选择现有素材…</option>
        {choices.map(asset => <option value={asset.path} key={asset.path}>{asset.path}</option>)}
      </select>
      <button type="button" onClick={() => fileRef.current.click()}><Upload size={15}/>上传{kind === 'image' ? '封面' : '音频'}</button>
      <input ref={fileRef} type="file" accept={accept} hidden onChange={async event => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (file) await onUpload(file, kind, onChange)
      }}/>
    </div>
    <small>{kind === 'image' ? 'JPG / PNG / WebP / GIF / AVIF，最多 10 MB' : 'MP3 / WAV / M4A / OGG / FLAC，最多 80 MB'}；路径保存后在前台使用。</small>
  </div>
}

function Editor({ editor, assets, busy, onUpload, onClose, onApply }) {
  const dialogRef = useRef(null)
  const [item, setItem] = useState(() => clone(editor.item))
  const [tags, setTags] = useState((editor.item.tags || []).join(', '))
  const [error, setError] = useState('')
  const work = editor.section === 'musicWorks'
  const audience = editor.section === 'audienceProfiles'
  const [pairs, setPairs] = useState(() => Object.fromEntries(['age', 'gender', 'regions'].map(key => [key, (editor.item[key] || []).map(pair => pair.join(' | ')).join('\n')])))
  const [interests, setInterests] = useState((editor.item.interests || []).join(', '))
  useEffect(() => { dialogRef.current.showModal() }, [])
  const set = (field, value) => setItem(previous => ({ ...previous, [field]: value }))
  const uploadForEditor = async (...args) => {
    setError('')
    const uploaded = await onUpload(...args)
    if (!uploaded) setError('上传失败，请检查文件格式、大小和管理服务连接。')
  }
  const apply = event => {
    event.preventDefault()
    try {
      let next = { ...item }
      if (work) next.tags = [...new Set(tags.split(/[,，\n]/).map(tag => tag.trim()).filter(Boolean))]
      if (audience) {
        for (const key of Object.keys(pairs)) next[key] = pairs[key].split('\n').filter(line => line.trim()).map(line => {
          const parts = line.split('|').map(part => part.trim())
          if (parts.length !== 2) throw new Error('每行请按「标签 | 49.7%」填写')
          return parts
        })
        next.interests = [...new Set(interests.split(/[,，\n]/).map(tag => tag.trim()).filter(Boolean))]
      } else if (!work && !next.alt) next.alt = `${next.title} 专辑封面`
      onApply(next)
    } catch (cause) { setError(cause.message) }
  }
  return <dialog className="admin-dialog" ref={dialogRef} onCancel={event => { event.preventDefault(); if (!busy) onClose() }} aria-labelledby="editor-title">
    <form onSubmit={apply}>
      <header><div><span className="eyebrow">EDIT CONTENT</span><h2 id="editor-title">{audience ? `${item.name} · 受众画像` : `${editor.isNew ? '新增' : '编辑'}${work ? '作品' : '专辑'}`}</h2></div><button type="button" className="icon-button" disabled={busy} onClick={onClose} aria-label="关闭编辑"><X size={20}/></button></header>
      <fieldset disabled={busy} className="editor-fields">
        {audience ? <>
          <p className="muted">每行填写「标签 | 比例」，例如：18–24 | 39.7%。</p>
          <div className="field-grid">{[['age', '年龄分布'], ['gender', '性别分布'], ['regions', '地域分布']].map(([key, label]) => <label key={key}>{label}<textarea rows={6} value={pairs[key]} onChange={event => setPairs(previous => ({ ...previous, [key]: event.target.value }))} /></label>)}</div>
          <label>兴趣标签<textarea rows={2} value={interests} onChange={event => setInterests(event.target.value)} placeholder="用逗号分隔" /></label>
        </> : <>
          <div className="field-grid"><label>{work ? '作品名称' : '专辑名称'} *<input required maxLength={4000} autoFocus value={item.title} onChange={event => set('title', event.target.value)}/></label><label>{work ? '歌手 / 作品署名' : '歌手'}<input value={(work ? item.artist : item.subtitle) || ''} onChange={event => set(work ? 'artist' : 'subtitle', event.target.value)}/></label></div>
          <AssetField label="封面路径" kind="image" value={work ? item.cover : item.src} onChange={value => set(work ? 'cover' : 'src', value)} assets={assets} onUpload={uploadForEditor}/>
          {(work ? item.cover : item.src) && <img className="editor-cover" src={work ? item.cover : item.src} alt="封面预览"/>}
          {work ? <>
            <AssetField label="音频路径" kind="audio" value={item.src} onChange={value => set('src', value)} assets={assets} onUpload={uploadForEditor}/>
            {item.src && <audio controls src={item.src} preload="none"/>}
            <label>视频链接<input value={item.video || ''} onChange={event => set('video', event.target.value)} placeholder="https://…"/></label>
            <label>作品简介<input value={item.meta || ''} onChange={event => set('meta', event.target.value)}/></label>
            <label>制作标签<input value={tags} onChange={event => setTags(event.target.value)} placeholder="用逗号分隔，例如 Synth Design, Serum"/></label>
            <div className="field-grid"><label>无封面时的底色<select value={item.color || ''} onChange={event => set('color', event.target.value)}><option value="">默认</option><option value="blue">蓝色</option><option value="lime">绿色</option></select></label><label className="checkbox-label"><input type="checkbox" checked={!!item.placeholder} onChange={event => set('placeholder', event.target.checked)}/>显示为待上线作品</label></div>
            <small>未填写音频的作品仍可展示并访问视频，试听按钮会禁用。勾选待上线后显示 COMING SOON。</small>
          </> : <label>封面说明<input value={item.alt || ''} onChange={event => set('alt', event.target.value)} placeholder="留空时自动使用专辑名称"/></label>}
        </>}
      </fieldset>
      {error && <p className="message error" role="alert">{error}</p>}
      <footer><span>应用后，点击页面右上角保存。</span><button type="button" disabled={busy} onClick={onClose}>取消</button><button type="submit" className="primary" disabled={busy}><Check size={16}/>应用修改</button></footer>
    </form>
  </dialog>
}

function Admin() {
  const [tab, setTab] = useState('acquisition')
  const [acquisitionDirty, setAcquisitionDirty] = useState(false)
  const [resumeDirty, setResumeDirty] = useState(false)
  const [publishBusy, setPublishBusy] = useState(false)
  const [content, setContent] = useState(null)
  const [savedContent, setSavedContent] = useState(null)
  const [contentRevision, setContentRevision] = useState(null)
  const [social, setSocial] = useState(null)
  const [savedSocial, setSavedSocial] = useState(null)
  const [socialRevision, setSocialRevision] = useState(null)
  const [socialJson, setSocialJson] = useState('')
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionBusy, setBusy] = useState(false)
  const busy = actionBusy || publishBusy
  const [message, setMessage] = useState(null)
  const [fatal, setFatal] = useState('')
  const [search, setSearch] = useState('')
  const [editor, setEditor] = useState(null)
  const contentImportRef = useRef(null)
  const socialImportRef = useRef(null)
  const contentDirty = content && !same(content, savedContent)
  const socialDirty = socialJson !== json(savedSocial)
  const dirty = contentDirty || socialDirty || acquisitionDirty || resumeDirty || !!editor

  useEffect(() => {
    let active = true
    async function load() {
      try {
        sessionToken = (await api('session')).token
        const results = await Promise.allSettled([api('content'), api('social'), api('assets')])
        if (!active) return
        if (results[0].status === 'rejected') throw results[0].reason
        const initial = results[0].value
        setContent(initial.data); setSavedContent(clone(initial.data)); setContentRevision(initial.revision)
        if (results[1].status === 'fulfilled') {
          const initialSocial = results[1].value
          setSocial(initialSocial.data); setSavedSocial(clone(initialSocial.data)); setSocialRevision(initialSocial.revision); setSocialJson(json(initialSocial.data))
        } else setMessage({ type: 'error', text: results[1].reason.message })
        if (results[2].status === 'fulfilled') setAssets(results[2].value.assets)
        else setMessage({ type: 'error', text: results[2].reason.message })
      } catch (error) { if (active) setFatal(error.message) }
      finally { if (active) setLoading(false) }
    }
    load()
    return () => { active = false }
  }, [])
  useEffect(() => {
    const warn = event => { if (dirty || publishBusy) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty, publishBusy])

  const run = async action => {
    setBusy(true); setMessage(null)
    try { return await action() } catch (error) { setMessage({ type: 'error', text: error.message }); return false }
    finally { setBusy(false) }
  }
  const tell = text => setMessage({ type: 'success', text })
  const replaceSocial = data => { setSocial(data); setSocialJson(json(data)) }
  const saveContent = () => run(async () => {
    const result = await api('content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: validateContent(clone(content)), revision: contentRevision }) })
    setContent(result.data); setSavedContent(clone(result.data)); setContentRevision(result.revision)
    tell('内容已保存。刷新前台即可查看，线上网站需重新发布。')
  })
  const saveSocial = () => run(async () => {
    const data = validateSocialData(JSON.parse(socialJson))
    const result = await api('social', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data, revision: socialRevision }) })
    replaceSocial(result.data); setSavedSocial(clone(result.data)); setSocialRevision(result.revision)
    tell('自媒体数据已保存，相关页面会使用同一份更新数据。刷新前台查看，线上网站需重新发布。')
  })
  const refreshSocial = () => run(async () => {
    if (socialDirty && !window.confirm('读取最新脚本结果会替换当前自媒体草稿，继续吗？')) return
    const result = await api('social/refresh', { method: 'POST' })
    replaceSocial(result.data)
    tell('已读取最新汇总和趋势数据。请检查下方数据，再点击「保存数据」。')
  })
  const upload = (file, kind, onChange) => run(async () => {
    const limit = (kind === 'image' ? 10 : 80) * 1024 * 1024
    if (file.size > limit) throw new Error(`文件过大，最多 ${kind === 'image' ? 10 : 80} MB`)
    const result = await api(`upload?kind=${kind}&name=${encodeURIComponent(file.name)}`, { method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: file })
    setAssets(previous => [...previous, { path: result.path, kind }])
    onChange(result.path)
    tell(`已上传 ${file.name}。应用并保存条目后生效。`)
    return true
  })
  const applyItem = item => {
    const draft = clone(content)
    if (editor.section === 'audienceProfiles') draft.audienceProfiles[editor.key] = item
    else {
      const index = draft[editor.section].findIndex(row => row.id === item.id)
      if (index < 0) draft[editor.section].push(item)
      else draft[editor.section][index] = item
    }
    validateContent(draft)
    setContent(draft); setEditor(null); tell('修改已应用到草稿，请保存内容。')
  }
  const newItem = () => setEditor({ section: tab, isNew: true, item: tab === 'musicWorks'
    ? { id: crypto.randomUUID(), title: '', artist: '', meta: '', src: '', cover: '', video: '', tags: [], placeholder: false, color: '' }
    : { id: crypto.randomUUID(), title: '', subtitle: '', src: '', alt: '' } })
  const move = (id, direction) => {
    setContent(previous => {
      const list = [...previous[tab]]
      const index = list.findIndex(item => item.id === id)
      const target = index + direction
      if (target < 0 || target >= list.length) return previous
      ;[list[index], list[target]] = [list[target], list[index]]
      return { ...previous, [tab]: list }
    })
  }
  const remove = item => {
    if (!window.confirm(`从列表移除「${item.title}」？保存后生效，素材文件会保留。`)) return
    setContent(previous => ({ ...previous, [tab]: previous[tab].filter(row => row.id !== item.id) }))
  }
  const reorder = (id, targetId, side) => {
    setContent(previous => {
      const items = [...previous[tab]]
      const from = items.findIndex(item => item.id === id)
      if (from < 0 || id === targetId) return previous
      const [item] = items.splice(from, 1)
      const target = items.findIndex(row => row.id === targetId)
      if (target < 0) return previous
      items.splice(target + (side === 'after' ? 1 : 0), 0, item)
      return { ...previous, [tab]: items }
    })
  }
  const importFile = (file, kind) => run(async () => {
    if (file.size > 4 * 1024 * 1024) throw new Error('JSON 文件最多 4 MB')
    const data = JSON.parse(await file.text())
    if (kind === 'content') {
      if (contentDirty && !window.confirm('导入将替换全部内容草稿，继续吗？')) return
      setContent(validateContent(data))
    } else {
      if (socialDirty && !window.confirm('导入将替换自媒体草稿，继续吗？')) return
      replaceSocial(validateSocialData(data))
    }
    tell('已导入草稿，检查后点击保存。')
  })

  if (loading || fatal) return <main className="admin-loading"><span className="eyebrow">AUGUST · CONTENT MANAGER</span><h1>{loading ? '正在载入内容…' : '后台暂时无法连接'}</h1>{fatal && <><p>{fatal}</p><button onClick={() => location.reload()}>重新连接</button></>}</main>
  const title = tab === 'publish' ? '发布' : tabs.find(item => item.key === tab).name
  const list = ['social', 'acquisition', 'resume', 'publish'].includes(tab) ? [] : content[tab]
  const filtered = list.filter(item => `${item.title} ${item.artist || item.subtitle || ''}`.toLowerCase().includes(search.toLowerCase()))
  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <a className="admin-brand" href="/" target="_blank" rel="noreferrer">August<span>内容管理</span></a>
      <span className="local-badge"><i/>本地管理</span>
      <nav aria-label="内容管理导航">{tabs.map(({ key, name, icon: Icon }) => <button key={key} className={tab === key ? 'active' : ''} disabled={busy} onClick={() => { setTab(key); setSearch(''); setMessage(null) }}><Icon size={18}/>{name}{(key === 'resume' ? resumeDirty : key === 'acquisition' ? acquisitionDirty : key === 'social' ? socialDirty : contentDirty) && <i className="dirty-dot" aria-label="有未保存修改"/>}</button>)}</nav>
      <div className="sidebar-bottom">
        <button type="button" className={`sidebar-publish ${tab === 'publish' ? 'active' : ''}`} disabled={busy} onClick={() => { setTab('publish'); setSearch(''); setMessage(null) }}><CloudUpload size={18}/>发布</button>
        <p>内容保存到本地项目。<br/>通过「发布」更新公网网站。</p>
        <a href={tab === 'publish' ? 'https://augustpei.com/' : tab === 'resume' ? '/#contact' : ['social', 'acquisition'].includes(tab) ? '/#social' : tab === 'musicWorks' ? '/#works' : '/#skills'} target="_blank" rel="noreferrer">查看前台<ArrowUpRight size={16}/></a>
        <button disabled={busy} onClick={() => download(content, 'site-content.json')}><FileJson size={15}/>导出内容草稿</button>
        <button disabled={busy} onClick={() => contentImportRef.current.click()}><Upload size={15}/>导入内容备份</button>
        <input ref={contentImportRef} type="file" hidden accept=".json,application/json" onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) importFile(file, 'content') }}/>
      </div>
    </aside>
    <main className="admin-main">
      <header className="admin-page-header"><div><span className="eyebrow">CONTENT MANAGER</span><h1>{title}</h1><p>{tab === 'publish' ? '将本地网站更新提交到 GitHub，并自动构建发布。' : tab === 'resume' ? '上传新版本简历，统一更新网站中的简历下载入口。' : tab === 'acquisition' ? '按平台获取原始数据，逐步完成登录、采集与文件检查。' : tab === 'social' ? '同步平台数据，统一更新网站中的统计、趋势和作品表现。' : '维护展示内容与顺序，保存后刷新前台查看。'}</p></div>{!['acquisition', 'resume', 'publish'].includes(tab) && <button className="primary" disabled={busy || !(tab === 'social' ? socialDirty : contentDirty)} onClick={tab === 'social' ? saveSocial : saveContent}><Save size={17}/>{busy ? '处理中…' : tab === 'social' ? '保存数据' : '保存内容'}</button>}</header>
      {!['acquisition', 'resume', 'publish'].includes(tab) && <div className="save-status"><span className={(tab === 'social' ? socialDirty : contentDirty) ? 'unsaved' : ''}>{(tab === 'social' ? socialDirty : contentDirty) ? '● 有未保存的修改' : '✓ 无待保存修改'}</span><span>最近保存：{time(tab === 'social' ? savedSocial?.updatedAt : savedContent.updatedAt)}</span>{(tab === 'social' ? socialDirty : contentDirty) && <button disabled={busy} onClick={() => { if (window.confirm('放弃本页未保存的修改？内容页会恢复全部专辑与作品草稿。')) { if (tab === 'social') replaceSocial(savedSocial); else setContent(clone(savedContent)) } }}>放弃修改</button>}</div>}
      {message && <div className={`message ${message.type}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.text}</div>}
      <div hidden={tab !== 'publish'}><PublishManager api={api} hasUnsaved={!!dirty} onBusyChange={setPublishBusy}/></div>
      <div hidden={tab !== 'resume'}><ResumeManager api={api} onDirtyChange={setResumeDirty}/></div>
      <div hidden={tab !== 'acquisition'}><SocialAcquisition api={api} onDirtyChange={setAcquisitionDirty} onGoToUpdate={() => { setTab('social'); setMessage(null) }}/></div>
      {!['acquisition', 'resume', 'publish'].includes(tab) && <fieldset disabled={busy} className="admin-panel-fields">
      {tab === 'social' ? <>
        <section className="admin-panel sync-panel"><div><h2>更新自媒体数据</h2><p>先将平台最新导出表放入 data 下的对应日期目录，然后读取脚本结果。汇总数据、内容系列、爆款案例、互动构成和增长趋势会一起更新。</p><small>七个平台均可先在「自媒体数据获取」完成采集或导入，其他平台仍按原流程导出。</small></div><div className="toolbar"><button className="primary" onClick={refreshSocial} type="button"><RefreshCw size={16}/>{busy ? '读取中…' : '读取最新脚本数据'}</button><button type="button" onClick={() => socialImportRef.current.click()}><Upload size={16}/>导入 JSON</button><button type="button" disabled={!socialJson} onClick={() => { try { download(JSON.parse(socialJson), 'overall-data.json') } catch { setMessage({ type: 'error', text: '当前 JSON 格式错误，无法导出' }) } }}><FileJson size={16}/>导出数据草稿</button></div>
          <input ref={socialImportRef} type="file" hidden accept=".json,application/json" onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) importFile(file, 'social') }}/>
        </section>
        {social ? <>
          <div className="summary-grid">{[['全网浏览量', social.total.views], ['全网粉丝', social.total.fans], ['总互动', social.total.engagement], ['哔哩哔哩作品数', social.bilibili.video_count]].map(([label, value]) => <div className="admin-panel" key={label}><span>{label}</span><strong>{number(value)}</strong></div>)}</div>
          <section className="admin-panel"><h2>平台数据预览</h2><div className="table-scroll"><table><thead><tr>{['平台', '数据日期', '浏览量', '粉丝', '互动'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{Object.entries(SOCIAL_PLATFORMS).map(([key, label]) => <tr key={key}><td>{label}</td><td>{social[key]?.date || '—'}</td><td>{number(social[key]?.views)}</td><td>{number(social[key]?.fans)}</td><td>{number(social[key]?.engagement)}</td></tr>)}</tbody></table></div></section>
          {!!social.follower_growth?.warnings?.length && <div className="message warning"><strong>脚本提示</strong>{social.follower_growth.warnings.map((warning, index) => <p key={index}>{warning}</p>)}</div>}
          <section className="admin-panel"><h2>内容与趋势</h2><div className="table-scroll"><table><thead><tr><th>内容系列</th><th>浏览量</th><th>互动</th></tr></thead><tbody>{[['apple_music', 'Apple Music'], ['remake', '编曲还原']].map(([key, label]) => <tr key={key}><td>{label}</td><td>{number(social[key]?.views)}</td><td>{number(social[key]?.engagement)}</td></tr>)}</tbody></table></div><p className="muted">全网趋势：{social.follower_growth?.total?.length || 0} 个数据点 · 爆款案例：{Object.keys(social.viral_works || {}).length} 项</p></section>
        </> : <div className="admin-panel empty">尚无保存的自媒体数据。读取最新脚本数据或导入完整 JSON 后保存。</div>}
        <section className="admin-panel"><h2>受众画像</h2><p className="muted">受众画像需要手动维护，修改后使用此处的「保存受众画像」写入内容文件。</p><div className="audience-actions">{Object.entries(content.audienceProfiles).filter(([key]) => ['bilibili', 'rednote', 'tiktok'].includes(key)).map(([key, profile]) => <button type="button" key={key} onClick={() => setEditor({ section: 'audienceProfiles', key, item: profile })}><Pencil size={15}/>{profile.name}</button>)}<button className="primary" type="button" disabled={!contentDirty} onClick={saveContent}><Save size={15}/>保存受众画像{contentDirty && '及内容'}</button></div></section>
        <details className="admin-panel"><summary>完整 JSON · 高级编辑</summary><p className="muted">可修改全部统计字段。平台总计会在应用和保存时重新计算。导入需包含 overall_data.py 的完整结果及 follower_growth（growth.py 结果）。</p><textarea className="json-editor" spellCheck={false} aria-label="完整自媒体 JSON" rows={16} value={socialJson} onChange={event => setSocialJson(event.target.value)}/><button type="button" onClick={() => { try { replaceSocial(validateSocialData(JSON.parse(socialJson))); tell('JSON 已应用到预览，请保存数据。') } catch (error) { setMessage({ type: 'error', text: error.message }) } }}><Check size={15}/>校验并更新预览</button></details>
      </> : <>
        <div className="list-toolbar"><label className="search-field"><input aria-label="搜索内容" placeholder="搜索名称或歌手…" value={search} onChange={event => setSearch(event.target.value)}/></label><span>{list.length} 项</span><button type="button" className="primary" onClick={newItem}><Plus size={17}/>新增{tab === 'musicWorks' ? '作品' : '专辑'}</button></div>
        <SortableContentList key={`${tab}-${search}`} items={filtered} disabled={busy} onReorder={reorder}
          empty={search ? '没有匹配的内容。' : '列表为空，点击新增添加第一项。'}
          renderItem={item => { const index = list.findIndex(row => row.id === item.id); const cover = tab === 'musicWorks' ? item.cover : item.src; return <>
            <span className="row-number">{String(index + 1).padStart(2, '0')}</span>{cover ? <img src={cover} alt={`${item.title} 封面`} loading="lazy"/> : <div className="cover-placeholder"><Music2 size={24}/></div>}
            <div className="row-copy"><h3>{item.title}</h3><p>{item.artist || item.subtitle || '未填写歌手'}</p>{tab === 'musicWorks' && <small>{item.placeholder ? '待上线' : item.src ? '可试听' : '无音频'}{item.video && ' · 已设置视频'}{item.tags?.length > 0 && ` · ${item.tags.join(' / ')}`}</small>}</div>
            <div className="row-actions"><button className="icon-button" type="button" disabled={index === 0} aria-label={`上移 ${item.title}`} onClick={() => move(item.id, -1)}><ArrowUp size={17}/></button><button className="icon-button" type="button" disabled={index === list.length - 1} aria-label={`下移 ${item.title}`} onClick={() => move(item.id, 1)}><ArrowDown size={17}/></button><button type="button" onClick={() => setEditor({ section: tab, item })}><Pencil size={15}/>编辑</button><button type="button" className="icon-button danger" aria-label={`删除 ${item.title}`} onClick={() => remove(item)}><Trash2 size={17}/></button></div>
          </> }}/>
        <p className="muted list-note">按住条目左侧手柄拖动，松开后插入指示线位置；拖至屏幕上下边缘可自动滚动，Esc 取消。也可使用上移 / 下移按钮。{search && '搜索时将插入到目标条目旁，其他条目的相对顺序保持不变。'}调整后请点击「保存内容」。移除条目会保留素材文件。{tab === 'albumWall' && '专辑墙仍按每行 10 张排列。'}</p>
      </>}
      </fieldset>}
    </main>
    {editor && <Editor key={`${editor.section}-${editor.key || editor.item.id}`} editor={editor} assets={assets} busy={busy} onUpload={upload} onClose={() => setEditor(null)} onApply={applyItem}/>}
  </div>
}

createRoot(document.getElementById('root')).render(<Admin/> )
