import React, { useEffect, useState } from 'react'

const fallback = { path: '/resume/制作岗个人简历Ver1.docx', downloadName: '裴宇航-个人简历.docx' }

export default function ResumeDownload({ children, ...props }) {
  const [resume, setResume] = useState(fallback)
  useEffect(() => {
    const controller = new AbortController()
    fetch('/resume.json', { cache: 'no-store', signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('简历配置读取失败'); return response.json() })
      .then(data => {
        if (/^\/resume\/[^/\\]+\.(pdf|docx)$/i.test(data.path) && !data.path.includes('..')) {
          setResume({ path: data.path, downloadName: `裴宇航-个人简历.${data.path.split('.').pop().toLowerCase()}` })
        }
      })
      .catch(() => {})
    return () => controller.abort()
  }, [])
  return <a {...props} href={resume.path} download={resume.downloadName}>{children}</a>
}
