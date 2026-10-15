export const SOCIAL_PLATFORMS = {
  bilibili: '哔哩哔哩', rednote: '小红书', douyin: '抖音', kuaishou: '快手',
  youtube: 'YouTube', tiktok: 'TikTok', instagram: 'Instagram',
}
export const ENGAGEMENT_FIELDS = ['likes', 'saves', 'coins', 'comments', 'danmakus', 'shares']
const isObject = value => value && typeof value === 'object' && !Array.isArray(value)
const fail = message => { throw new Error(message) }
const string = (value, label, required = false) => {
  if (typeof value !== 'string' || value.length > 4000 || (required && !value.trim())) fail(`${label}需要填写有效文字`)
}
const url = (value, label, required = false) => {
  string(value ?? '', label, required)
  if (!value) return
  if (/[\\\u0000-\u0020\u007f]/.test(value.replace(/ /g, ''))) fail(`${label}包含无效字符`)
  if (value.startsWith('/') && !value.startsWith('//')) return
  try {
    if (['https:', 'http:'].includes(new URL(value).protocol)) return
  } catch { /* Report the field below. */ }
  fail(`${label}请填写 / 开头的资源路径或 http(s) 地址`)
}

export function validateContent(value) {
  if (!isObject(value) || value.version !== 1) fail('内容文件格式不正确（version 应为 1）')
  for (const [key, label] of [['musicWorks', '音乐作品'], ['recentAlbums', '最近在听'], ['albumWall', '启发我的音乐']]) {
    const list = value[key]
    if (!Array.isArray(list) || list.length > 1000) fail(`${label}需要是列表，最多 1000 项`)
    const ids = new Set()
    for (const item of list) {
      if (!isObject(item)) fail(`${label}包含无效条目`)
      string(item.id, `${label} ID`, true)
      if (ids.has(item.id)) fail(`${label}中有重复 ID`)
      ids.add(item.id)
      string(item.title, `${label}标题`, true)
      if (key === 'musicWorks') {
        string(item.artist ?? '', '作品署名')
        string(item.meta ?? '', '作品简介')
        if (typeof item.placeholder !== 'undefined' && typeof item.placeholder !== 'boolean') fail('待上线状态需要是布尔值')
        url(item.src, '音频路径')
        url(item.cover, '封面路径')
        url(item.video, '视频链接')
        if (!Array.isArray(item.tags) || item.tags.length > 30) fail('制作标签需要是列表，最多 30 项')
        item.tags.forEach(tag => string(tag, '制作标签', true))
        if (item.color && !['blue', 'lime'].includes(item.color)) fail('封面底色无效')
      } else {
        string(item.subtitle ?? '', '专辑歌手')
        string(item.alt ?? '', '封面说明')
        url(item.src, '专辑封面', true)
      }
    }
  }
  if (!isObject(value.audienceProfiles)) fail('缺少受众画像')
  if (Object.keys(value.audienceProfiles).some(key => !['bilibili', 'rednote', 'tiktok'].includes(key))) fail('受众画像仅支持哔哩哔哩、小红书、TikTok')
  for (const key of ['bilibili', 'rednote', 'tiktok']) {
    const profile = value.audienceProfiles[key]
    if (!isObject(profile)) fail(`缺少 ${SOCIAL_PLATFORMS[key]} 受众画像`)
    string(profile.name, '受众平台名称', true)
    for (const field of ['age', 'gender', 'regions']) {
      if (!Array.isArray(profile[field]) || !profile[field].length || profile[field].length > 30) fail(`${profile.name} 的 ${field} 需要 1–30 行`)
      for (const pair of profile[field]) {
        if (!Array.isArray(pair) || pair.length !== 2) fail(`${profile.name} 受众数据格式错误`)
        string(pair[0], '受众标签', true)
        if (typeof pair[1] !== 'string' || !/^\d+(\.\d+)?%$/.test(pair[1]) || parseFloat(pair[1]) > 100) fail('受众比例请填写 0%–100%')
      }
    }
    if (!Array.isArray(profile.interests) || profile.interests.length > 50) fail('兴趣标签需要是列表，最多 50 项')
    profile.interests.forEach(tag => string(tag, '兴趣标签', true))
  }
  return value
}

export function validateSocialData(value) {
  if (!isObject(value)) fail('自媒体数据需要是 JSON 对象')
  const counter = (number, label) => {
    if (typeof number !== 'number' || !Number.isFinite(number) || number < 0) fail(`${label}需要是非负数字`)
  }
  for (const key of Object.keys(SOCIAL_PLATFORMS)) {
    if (!isObject(value[key])) fail(`缺少 ${SOCIAL_PLATFORMS[key]} 的数据`)
    for (const field of ['views', 'fans', ...ENGAGEMENT_FIELDS]) {
      if (['views', 'fans'].includes(field) || value[key][field] !== undefined) counter(value[key][field], `${SOCIAL_PLATFORMS[key]} ${field}`)
    }
    if (key === 'bilibili' || value[key].video_count !== undefined) counter(value[key].video_count, '作品数量')
    if (value[key].date != null && (typeof value[key].date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value[key].date))) fail('平台日期请使用 YYYY-MM-DD 格式')
  }
  for (const key of ['apple_music', 'remake']) {
    if (!isObject(value[key])) fail(`缺少 ${key} 内容系列数据，请导入完整汇总 JSON`)
    for (const field of ['views', 'engagement']) counter(value[key][field], `${key} ${field}`)
  }
  if (!isObject(value.viral_works) || !isObject(value.viral_rate)) fail('缺少 viral_works 或 viral_rate，请导入完整汇总 JSON')
  counter(value.viral_rate.rate, '爆款率')
  if (value.viral_rate.rate > 100) fail('爆款率不能超过 100%')
  for (const [key, work] of Object.entries(value.viral_works)) {
    if (!isObject(work)) fail(`${key} 爆款案例格式不正确`)
    for (const field of ['views', 'engagement']) counter(work[field], `${key} ${field}`)
    if (!isObject(work.platforms)) fail(`${key} 缺少平台明细`)
  }
  if (!isObject(value.follower_growth) || !isObject(value.follower_growth.platforms)) fail('缺少 follower_growth，请同时合并 growth.py 的结果')
  const checkHistory = (history, label) => {
    if (!Array.isArray(history) || history.length > 1000) fail(`${label}趋势需要是列表`)
    for (const point of history) {
      if (!isObject(point) || !/^\d{4}-\d{2}-\d{2}$/.test(point.date)) fail(`${label}趋势日期无效`)
      for (const field of ['fans', 'views']) {
        if (typeof point[field] !== 'number' || !Number.isFinite(point[field])) fail(`${label}趋势 ${field} 需要是数字`)
      }
    }
  }
  for (const [key, platform] of Object.entries(value.follower_growth.platforms)) {
    if (!isObject(platform)) fail('平台趋势格式不正确')
    checkHistory(platform.history, key)
  }
  if (value.follower_growth.total != null) checkHistory(value.follower_growth.total, '全网')
  if (value.follower_growth.warnings != null && (!Array.isArray(value.follower_growth.warnings) || value.follower_growth.warnings.some(warning => typeof warning !== 'string'))) fail('趋势 warnings 需要是文字列表')
  // Recompute totals so imported platform edits cannot leave stale totals on the site.
  const total = { views: 0, fans: 0, ...Object.fromEntries(ENGAGEMENT_FIELDS.map(key => [key, 0])) }
  for (const key of Object.keys(SOCIAL_PLATFORMS)) {
    for (const field of Object.keys(total)) total[field] += value[key][field] || 0
    value[key].engagement = ENGAGEMENT_FIELDS.reduce((sum, field) => sum + (value[key][field] || 0), 0)
  }
  total.engagement = ENGAGEMENT_FIELDS.reduce((sum, field) => sum + total[field], 0)
  value.total = { ...value.total, ...total }
  return value
}
