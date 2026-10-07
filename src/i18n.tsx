import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'ms'
type Ctx<T> = { lang: Lang; setLang: (l: Lang) => void; c: T }
type Meta = { meta?: { title: string; desc: string } }
const I18nContext = createContext<Ctx<unknown> | null>(null)

function initialLang(): Lang {
  try {
    const q = new URLSearchParams(window.location.search).get('lang')
    if (q === 'ms' || q === 'bm') return 'ms'
    if (q === 'en') return 'en'
    const s = localStorage.getItem('lang')
    return s === 'ms' || s === 'en' ? s : 'en'
  } catch {
    return 'en'
  }
}

export function I18nProvider<T>({ content, children }: { content: Record<Lang, T>; children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const setLang = (l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem('lang', l)
      // keep the address bar share-ready: ?lang=ms opens the BM version
      const u = new URL(window.location.href)
      if (l === 'ms') u.searchParams.set('lang', 'ms')
      else u.searchParams.delete('lang')
      window.history.replaceState(null, '', u.toString())
    } catch { /* ignore */ }
  }
  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = 'ltr'
    const canon = document.querySelector('link[rel="canonical"]')
    const alt = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`)
    if (canon && alt) canon.setAttribute('href', alt.getAttribute('href') || '')
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', alt?.getAttribute('href') || '')
    const m = (content[lang] as Meta).meta
    if (m) {
      document.title = m.title
      document.querySelector('meta[name="description"]')?.setAttribute('content', m.desc)
      document.querySelector('meta[property="og:title"]')?.setAttribute('content', m.title)
      document.querySelector('meta[property="og:description"]')?.setAttribute('content', m.desc)
      document.querySelector('meta[property="og:locale"]')?.setAttribute('content', lang === 'ms' ? 'ms_MY' : 'en_MY')
      document.querySelector('meta[property="og:locale:alternate"]')?.setAttribute('content', lang === 'ms' ? 'en_MY' : 'ms_MY')
    }
  }, [lang, content])
  const value = useMemo(() => ({ lang, setLang, c: content[lang] }), [lang, content])
  return <I18nContext.Provider value={value as Ctx<unknown>}>{children}</I18nContext.Provider>
}

export function useI18n<T>() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n outside provider')
  return ctx as Ctx<T>
}

export const asset = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
