import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import { useAuth } from '../../context/AuthContext'

export default function Callback() {
  const loc = useLocation()
  const nav = useNavigate()
  const { refresh } = useAuth()

  useEffect(() => {
    (async () => {
      try {
        await api.ssoCallback(loc.search || '')
        await refresh()              // pull /api/auth/me and normalize it
        nav('/profile', { replace: true })
      } catch (e) {
        console.error('SSO callback failed:', e)
        nav('/login', { replace: true })
      }
    })()
  }, [loc.search, nav, refresh])

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="rounded-xl border border-white/10 bg-slate-900/60 px-6 py-10 text-center">
        <div className="animate-pulse text-white/80">Completing sign-in…</div>
      </div>
    </div>
  )
}
