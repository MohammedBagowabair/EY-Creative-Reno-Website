import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { asset, useI18n } from './i18n'
import { useActiveSection, useDialogFlag, useMenu, useSwipe } from './hooks'
import { useOpenStatus, nowInKL, type Week } from './hours'
import { Reveal } from './Reveal'
import { BIZ, JOBS, PROJECTS, type Content } from './content'
import { MARK_D, MARK_VB } from './logo'

const PITCH_WA = 'https://wa.me/601151198497'
const wa = (t: string) => `https://wa.me/${BIZ.wa}?text=${encodeURIComponent(t)}`
const WEEK: Week = [null, [540, 1080], [540, 1080], [540, 1080], [540, 1080], [540, 1080], [540, 1080]]
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const img = (n: string, w: 360 | 512) => asset(`images/${n}-${w}.webp`)
const srcset = (n: string) => `${img(n, 360)} 360w, ${img(n, 512)} 512w`
function useDate() {
  const { lang } = useI18n<Content>()
  return (d: string, day = false) => new Intl.DateTimeFormat(lang === 'ms' ? 'ms-MY' : 'en-GB', { day: day ? 'numeric' : undefined, month: day ? 'short' : 'short', year: 'numeric' }).format(new Date(d + 'T12:00:00'))
}

function WaIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 2.4.9 2.9.8 3.4.7.5-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
    </svg>
  )
}
function PhoneIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>
}
function Star({ className = 'h-4 w-4' }: { className?: string }) {
  return <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden><path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z" /></svg>
}
function Stars({ className = 'h-4 w-4' }: { className?: string }) {
  return <span className="inline-flex gap-0.5" aria-hidden>{[0, 1, 2, 3, 4].map((i) => <Star key={i} className={className} />)}</span>
}
function Arrow({ className = 'h-4 w-4', dir = 'right' }: { className?: string; dir?: 'right' | 'left' | 'up' }) {
  const r = dir === 'left' ? 180 : dir === 'up' ? -90 : 0
  return <svg viewBox="0 0 20 20" className={className} style={{ transform: `rotate(${r}deg)` }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 10h12M11 5l5 5-5 5" /></svg>
}
function Ext() { return <span aria-hidden className="ml-1">↗</span> }
function Check({ className = 'h-4 w-4' }: { className?: string }) {
  return <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 10.5l4 4L16 6" /></svg>
}

function Mark({ className = 'h-9 w-auto' }: { className?: string }) {
  return <svg viewBox={MARK_VB} className={className} fill="currentColor" aria-hidden><path d={MARK_D} /></svg>
}
function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <Mark className={`h-9 w-auto lg:h-10 ${dark ? 'text-mist' : 'text-navy'}`} />
      <span className={`border-l pl-3 text-[12.5px] font-semibold leading-[1.2] tracking-tight ${dark ? 'border-white/20 text-white' : 'border-navy/20 text-navy'}`}>EY Creative Reno<br />&amp; Designs</span>
    </span>
  )
}

function Kicker({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return <p className={`kicker ${dark ? 'text-mist' : 'text-navy'}`}><span className={`h-px w-6 ${dark ? 'bg-mist/70' : 'bg-navy/50'}`} aria-hidden />{children}</p>
}

function StatusPill({ className = '' }: { className?: string }) {
  const { c } = useI18n<Content>()
  const s = useOpenStatus(WEEK)
  if (!s) return <span className={`inline-block h-8 w-36 ${className}`} aria-hidden />
  const txt = s.open
    ? `${c.status.open} · ${c.status.closes}`
    : `${c.status.closed} · ${s.nextOpenDay === s.day ? c.status.opensToday : s.nextOpenDay === (s.day + 1) % 7 ? c.status.opensTomorrow : c.status.opensMon}`
  return (
    <span className={`inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-full border border-navy/15 px-3 text-[12.5px] font-medium text-ink ${className}`}>
      <span className={`h-2 w-2 rounded-full ${s.open ? 'bg-[#2E9E62]' : 'bg-[#B9534A]'}`} aria-hidden />{txt}
    </span>
  )
}

function Header({ onMenu, menuOpen, btnRef }: { onMenu: () => void; menuOpen: boolean; btnRef: React.RefObject<HTMLButtonElement | null> }) {
  const { c, lang, setLang } = useI18n<Content>()
  const active = useActiveSection(c.nav.map(([id]) => id))
  return (
    <header className="bar sticky top-0 z-40 border-b border-navy/10">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-3 px-5 sm:px-8 lg:h-[72px]">
        <a href="#top" className="tap flex items-center rounded-md" aria-label={c.a11y.home}><Logo /></a>
        <nav aria-label={c.a11y.main} className="hidden items-center gap-7 lg:flex">
          {c.nav.map(([id, l]) => (
            <a key={id} href={`#${id}`} aria-current={active === id ? 'true' : undefined} className={`nav-link py-3 text-[14.5px] font-medium transition hover:text-navy ${active === id ? 'text-navy' : 'text-ink-soft'}`}>{l}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <StatusPill className="hidden xl:inline-flex" />
          <button data-lang-toggle onClick={() => setLang(lang === 'en' ? 'ms' : 'en')} aria-label={c.langAria} className="tap rounded-full px-2 text-[13px] font-semibold tracking-wider text-ink transition hover:text-navy">{c.langLabel}</button>
          <a href={wa(c.contact.waMsg)} target="_blank" rel="noopener" className="tap hidden items-center gap-2 rounded-full bg-navy px-4 text-sm font-semibold text-white transition hover:bg-navy-deep sm:inline-flex"><WaIcon className="h-4 w-4" />{c.waCta}</a>
          <button ref={btnRef} onClick={onMenu} aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? c.a11y.menuClose : c.a11y.menuOpen} className="tap -mr-2 grid place-items-center rounded-full lg:hidden">
            <span className="relative block h-3 w-6" aria-hidden>
              <span className={`absolute left-0 h-[2px] w-6 bg-navy transition ${menuOpen ? 'top-[5px] rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 h-[2px] bg-navy transition-all ${menuOpen ? 'top-[5px] w-6 -rotate-45' : 'top-[10px] w-4'}`} />
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}

function MobileMenu({ close }: { close: () => void }) {
  const { c } = useI18n<Content>()
  useDialogFlag()
  return (
    <div id="mobile-menu" role="dialog" aria-modal="true" aria-label={c.a11y.mobile} className="fixed inset-x-0 bottom-0 top-16 z-30 flex flex-col overflow-y-auto bg-white px-5 pb-8 pt-2 lg:hidden">
      <nav aria-label={c.a11y.mobile}>
        {c.nav.map(([id, l]) => (
          <a key={id} href={`#${id}`} onClick={close} className="flex min-h-[60px] items-center justify-between border-b border-navy/10 text-[26px] font-semibold tracking-tight text-ink active:text-navy">
            {l}<Arrow className="h-5 w-5 text-navy/50" />
          </a>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-3 pt-8">
        <StatusPill className="self-start" />
        <div className="grid grid-cols-2 gap-3">
          <a href={wa(c.contact.waMsg)} target="_blank" rel="noopener" className="tap inline-flex items-center justify-center gap-2 rounded-full bg-navy px-4 font-semibold text-white"><WaIcon />{c.waCta}</a>
          <a href={`tel:${BIZ.tel}`} className="tap inline-flex items-center justify-center gap-2 rounded-full border border-navy/25 px-4 font-semibold text-ink"><PhoneIcon />{c.call}</a>
        </div>
      </div>
    </div>
  )
}

function Hero() {
  const { c } = useI18n<Content>()
  const tiles: [string, number][] = [['p-wangsamas', 0], ['p-green', 1], ['a-service', 2]]
  return (
    <section id="top" className="bg-mist-pale">
      <div className="mx-auto grid max-w-[1280px] gap-9 px-5 pb-12 pt-8 sm:px-8 sm:pt-12 lg:grid-cols-12 lg:items-center lg:gap-12 lg:pb-20 lg:pt-16">
        <div className="lg:col-span-6">
          <Kicker>{c.hero.kicker}</Kicker>
          <h1 className="h1 mt-4">{c.hero.h1}</h1>
          <p className="mt-5 max-w-[34rem] text-[16.5px] leading-relaxed text-ink-soft sm:text-[18px]">{c.hero.sub}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a href={wa(c.contact.waQuote)} target="_blank" rel="noopener" className="tap inline-flex h-[52px] items-center justify-center gap-2.5 rounded-full bg-navy px-6 text-[15.5px] font-semibold text-white transition hover:bg-navy-deep"><WaIcon />{c.hero.cta}</a>
            <a href="#work" className="group tap inline-flex h-[52px] items-center justify-center gap-2 rounded-full border border-navy/25 bg-white px-6 text-[15.5px] font-semibold text-ink transition hover:border-navy">{c.hero.cta2}<Arrow className="h-4 w-4 transition group-hover:translate-x-0.5" /></a>
          </div>
          <dl className="mt-9 grid max-w-[34rem] grid-cols-3 border-t border-navy/15 pt-4 text-[13px] leading-snug sm:text-[14px]">
            <div className="pr-2"><dt className="sr-only">Google</dt><dd><a href={BIZ.maps} target="_blank" rel="noopener" className="inline-flex flex-col rounded-sm hover:text-navy"><span className="flex items-center gap-1.5 text-[18px] font-semibold leading-none sm:text-[21px] text-ink">{BIZ.rating}<Star className="h-4 w-4 text-[#C99A2E]" /></span><span className="mt-1.5 text-ink-soft">{BIZ.reviews} {c.hero.reviewsWord}</span></a></dd></div>
            <div className="border-l border-navy/15 px-3"><dt className="sr-only">{c.contact.hours}</dt><dd><span className="block whitespace-nowrap text-[18px] font-semibold leading-none sm:text-[21px] text-ink">{c.hero.hoursVal}</span><span className="mt-1.5 block text-ink-soft">{c.hero.hours}</span></dd></div>
            <div className="border-l border-navy/15 pl-3"><dt className="sr-only">EYCR</dt><dd><span className="block text-[18px] font-semibold leading-none sm:text-[21px] text-ink">{c.hero.teamsVal}</span><span className="mt-1.5 block text-ink-soft">{c.hero.teams}</span></dd></div>
          </dl>
        </div>
        <figure className="lg:col-span-6">
          <div className="grid aspect-[6/5] grid-cols-3 grid-rows-2 gap-2 sm:gap-3">
            {tiles.map(([n, i]) => (
              <div key={n} className={`relative overflow-hidden rounded-lg bg-navy/10 ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
                <img src={img(n, i === 0 ? 512 : 360)} srcSet={i === 0 ? srcset(n) : undefined} sizes={i === 0 ? '(min-width:1024px) 400px, 66vw' : undefined} width={i === 0 ? 512 : 360} height={i === 0 ? 640 : 450} alt={c.hero.caps[i]} fetchPriority={i === 0 ? 'high' : undefined} decoding="async" className="absolute inset-0 h-full w-full object-cover" />
                <span className={`absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded bg-ink/70 px-2 py-0.5 text-[11.5px] font-medium text-white ${i ? 'hidden sm:block' : ''}`}>{c.hero.caps[i]}</span>
              </div>
            ))}
          </div>
          <figcaption className="mt-2.5 text-[12.5px] text-ink-soft">{c.hero.credit}</figcaption>
        </figure>
      </div>
    </section>
  )
}

/** Horizontal swipe rail on small screens; arrow buttons + dots. */
function Rail({ label, count, children, className = '', listClass = '', prev, next, dark = false }: { label: string; count: number; children: ReactNode; className?: string; listClass?: string; prev: string; next: string; dark?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [idx, setIdx] = useState(0)
  const [end, setEnd] = useState(false)
  const step = () => { const li = ref.current?.querySelector('li'); return li ? li.getBoundingClientRect().width + 16 : 300 }
  const onScroll = () => { const el = ref.current; if (!el) return; setIdx(Math.min(count - 1, Math.round(el.scrollLeft / step()))); setEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) }
  useEffect(() => { onScroll() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const go = (d: number) => ref.current?.scrollBy({ left: d * step(), behavior: reduced() ? 'auto' : 'smooth' })
  const btn = `tap grid place-items-center rounded-full border transition disabled:opacity-35 ${dark ? 'border-white/25 text-white hover:bg-white hover:text-ink' : 'border-navy/20 text-ink hover:border-navy hover:bg-navy hover:text-white'}`
  return (
    <div className={className}>
      <div ref={ref} onScroll={onScroll} role="region" aria-label={label} tabIndex={0} className="rail -mx-5 scroll-px-5 overflow-x-auto px-5 sm:-mx-8 sm:scroll-px-8 sm:px-8">
        <ul className={`flex gap-4 ${listClass}`}>{children}</ul>
      </div>
      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="flex gap-1.5" aria-hidden>
          {Array.from({ length: count }, (_, i) => <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${(end ? i === count - 1 : i === idx) ? `w-6 ${dark ? 'bg-mist' : 'bg-navy'}` : `w-1.5 ${dark ? 'bg-white/30' : 'bg-navy/20'}`}`} />)}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => go(-1)} disabled={idx === 0} aria-label={prev} className={btn}><Arrow dir="left" /></button>
          <button type="button" onClick={() => go(1)} disabled={end} aria-label={next} className={btn}><Arrow /></button>
        </div>
      </div>
    </div>
  )
}

function SectionHead({ kicker, title, children, dark = false }: { kicker: string; title: string; children?: ReactNode; dark?: boolean }) {
  return (
    <div className="grid gap-4 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-7"><Kicker dark={dark}>{kicker}</Kicker><h2 className="h2 mt-3">{title}</h2></div>
      {children && <div className={`max-w-md text-[16px] leading-relaxed lg:col-span-5 lg:justify-self-end ${dark ? 'text-white/75' : 'text-ink-soft'}`}>{children}</div>}
    </div>
  )
}

function ProjectDialog({ i, setI }: { i: number; setI: (n: number | null) => void }) {
  const { c } = useI18n<Content>()
  const fmt = useDate()
  const ref = useRef<HTMLDialogElement>(null)
  useDialogFlag()
  const n = PROJECTS.length
  const go = useCallback((d: number) => setI((i + d + n) % n), [i, n, setI])
  const swipe = useSwipe(go)
  useEffect(() => { const d = ref.current; if (d && !d.open) d.showModal() }, [])
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1) }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [go])
  const p = PROJECTS[i], t = c.work.items[i]
  return (
    <dialog ref={ref} onClose={() => setI(null)} onClick={(e) => { if (e.target === ref.current) ref.current?.close() }} aria-labelledby="pd-title" className="pd">
      <button type="button" onClick={() => ref.current?.close()} aria-label={c.a11y.close} className="tap absolute right-3 top-3 z-10 grid place-items-center rounded-full bg-white/90 text-2xl leading-none text-ink shadow-sm hover:bg-white" autoFocus>×</button>
      <div className="grid max-h-[inherit] overflow-y-auto md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" {...swipe}>
        <div className="relative bg-navy/10">
          <img key={p.img} src={img(p.img, 512)} width={512} height={640} alt={t.title} className="aspect-[4/5] w-full object-cover" />
        </div>
        <div className="flex min-w-0 flex-col p-6 sm:p-8">
          <p className="pr-10 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-navy">{t.kind} · {i + 1}/{n}</p>
          <h3 id="pd-title" className="mt-2 text-[26px] font-semibold leading-tight tracking-tight text-ink sm:text-[30px]">{t.title}</h3>
          <p className="mt-4 text-[16px] leading-relaxed text-ink-soft">{t.text}</p>
          <dl className="mt-6 space-y-1 border-t border-navy/10 pt-4 text-[14px]">
            <div className="flex gap-2"><dt className="text-ink-soft">{c.work.posted}:</dt><dd className="font-medium text-ink">{fmt(p.date, true)}</dd></div>
            <div><dd className="text-ink-soft">{c.work.credit}</dd></div>
          </dl>
          <a href={p.href} target="_blank" rel="noopener" className="mt-4 inline-flex min-h-[44px] w-fit items-center text-[15px] font-semibold text-navy underline decoration-navy/30 underline-offset-4 hover:decoration-navy">{c.work.ig}<Ext /></a>
          <div className="mt-auto flex items-center justify-between gap-3 pt-6">
            <a href={wa(`${c.contact.waQuote} (${t.title})`)} target="_blank" rel="noopener" className="tap inline-flex items-center gap-2 rounded-full bg-navy px-5 text-[14.5px] font-semibold text-white hover:bg-navy-deep"><WaIcon className="h-4 w-4" />{c.waCta}</a>
            <div className="flex gap-2">
              <button type="button" onClick={() => go(-1)} aria-label={c.a11y.prev} className="tap grid place-items-center rounded-full border border-navy/20 hover:bg-navy hover:text-white"><Arrow dir="left" /></button>
              <button type="button" onClick={() => go(1)} aria-label={c.a11y.next} className="tap grid place-items-center rounded-full border border-navy/20 hover:bg-navy hover:text-white"><Arrow /></button>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  )
}

function Work() {
  const { c } = useI18n<Content>()
  const fmt = useDate()
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section id="work" className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 lg:py-24">
      <SectionHead kicker={c.work.kicker} title={c.work.title}>
        <p>{c.work.sub}</p>
        <a href={BIZ.igStudio} target="_blank" rel="noopener" className="mt-2 inline-flex min-h-[44px] items-center font-semibold text-navy underline decoration-navy/30 underline-offset-4 hover:decoration-navy">@eycrstudio<Ext /></a>
      </SectionHead>
      <ul className="mt-9 grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 lg:mt-12 lg:grid-cols-3 lg:gap-y-10">
        {PROJECTS.map((p, i) => (
          <li key={p.img} className="min-w-0">
            <Reveal delay={(i % 3) * 60}>
              <button type="button" onClick={() => setOpen(i)} className="tile group block w-full rounded-lg text-left" aria-haspopup="dialog">
                <span className="block overflow-hidden rounded-lg bg-navy/10">
                  <img src={img(p.img, 360)} srcSet={srcset(p.img)} sizes="(min-width:1280px) 400px, (min-width:1024px) 31vw, 46vw" width={360} height={450} loading="lazy" decoding="async" alt="" className="aspect-[4/5] w-full object-cover" />
                </span>
                <span className="mt-3 block text-[12px] font-semibold uppercase tracking-[0.12em] text-navy sm:text-[12.5px]">{c.work.items[i].kind} · {fmt(p.date)}</span>
                <span className="mt-1 block text-[16px] font-semibold leading-snug text-ink group-hover:underline group-hover:decoration-navy/40 group-hover:underline-offset-4 sm:text-[18px]">{c.work.items[i].title}</span>
                <span className="sr-only">, {c.work.open}</span>
              </button>
            </Reveal>
          </li>
        ))}
      </ul>
      <a href={BIZ.igStudio} target="_blank" rel="noopener" className="tap mt-10 inline-flex items-center gap-2 rounded-full border border-navy/25 px-6 text-[15px] font-semibold text-ink transition hover:border-navy">{c.work.more}<Ext /></a>
      {open !== null && <ProjectDialog i={open} setI={setOpen} />}
    </section>
  )
}

function Socials({ team, dark = false }: { team: 'studio' | 'aircond'; dark?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1">
      {BIZ.social[team].map(([n, h]) => (
        <li key={n}><a href={h} target="_blank" rel="noopener" className={`inline-flex min-h-[40px] items-center text-[14.5px] font-semibold underline underline-offset-4 ${dark ? 'text-white decoration-white/30 hover:decoration-mist' : 'text-navy decoration-navy/30 hover:decoration-navy'}`}>{n}</a></li>
      ))}
    </ul>
  )
}

function Services() {
  const { c } = useI18n<Content>()
  const S = c.services
  const fmt = useDate()
  return (
    <section id="services" className="on-dark bg-navy-deep text-white">
      <div className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 lg:py-24">
        <SectionHead kicker={S.kicker} title={S.title} dark><p>{S.free}</p></SectionHead>
        <div className="mt-10 grid gap-5 lg:mt-12 lg:grid-cols-2">
          {S.teams.map((t) => (
            <article key={t.id} className="flex flex-col rounded-xl bg-white/[.05] p-6 ring-1 ring-white/10 sm:p-8">
              <p className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-mist">{t.role}</p>
              <h3 className="mt-2 text-[26px] font-semibold tracking-tight sm:text-[30px]">{t.name}</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-white/75">{t.text}</p>
              <ul className="mb-6 mt-5 grid gap-x-6 gap-y-2 text-[15px] sm:grid-cols-2">
                {t.list.map((l) => <li key={l} className="flex gap-2.5"><Check className="mt-1 h-4 w-4 shrink-0 text-mist" />{l}</li>)}
              </ul>
              <div className="mt-auto flex flex-wrap items-center gap-x-3 border-t border-white/10 pt-4 text-[13.5px] text-white/65">
                <span>{S.follow}</span><Socials team={t.id} dark />
              </div>
            </article>
          ))}
        </div>
        <h3 className="mt-14 text-[20px] font-semibold tracking-tight sm:text-[22px]">{S.jobsTitle}</h3>
        <Rail label={S.jobsTitle} count={JOBS.length} prev={c.reviews.prev} next={c.reviews.next} dark className="mt-6 lg:hidden">
          {JOBS.map((j, i) => <li key={j.img} className="w-[72%] shrink-0 sm:w-[44%]"><JobCard j={j} text={S.jobs[i]} date={fmt(j.date, true)} /></li>)}
        </Rail>
        <ul className="mt-6 hidden gap-5 lg:grid lg:grid-cols-4">
          {JOBS.map((j, i) => <li key={j.img} className="min-w-0"><JobCard j={j} text={S.jobs[i]} date={fmt(j.date, true)} /></li>)}
        </ul>
        <div className="mt-6 flex flex-col gap-2 text-[13.5px] text-white/65 sm:flex-row sm:justify-between">
          <p>{S.jobsCredit}</p>
          <p className="max-w-xl text-white/80">{S.tip}</p>
        </div>
      </div>
    </section>
  )
}
function JobCard({ j, text, date }: { j: (typeof JOBS)[number]; text: string; date: string }) {
  return (
    <a href={j.href} target="_blank" rel="noopener" className="tile group flex h-full flex-col overflow-hidden rounded-lg bg-white/[.05] ring-1 ring-white/10 hover:ring-mist/60">
      <span className="block overflow-hidden"><img src={img(j.img, 360)} width={360} height={450} loading="lazy" decoding="async" alt="" className="aspect-[4/3] w-full object-cover" /></span>
      <span className="flex flex-1 flex-col p-4">
        <span className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-mist">{date}</span>
        <span className="mt-1.5 text-[15px] leading-snug text-white/90">{text}</span>
        <span className="mt-auto pt-3 text-[13px] font-semibold text-white/70 group-hover:text-white">Instagram<Ext /></span>
      </span>
    </a>
  )
}

function About() {
  const { c } = useI18n<Content>()
  const A = c.about
  return (
    <section id="about" className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 lg:py-24">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <Kicker>{A.kicker}</Kicker>
          <h2 className="h2 mt-3">{A.title}</h2>
          <div className="mt-6 space-y-4 text-[16.5px] leading-relaxed text-ink-soft">{A.paras.map((p) => <p key={p}>{p}</p>)}</div>
          <dl className="mt-8 divide-y divide-navy/10 border-y border-navy/10 text-[15px]">
            {A.facts.map(([k, v]) => <div key={k} className="flex flex-wrap justify-between gap-x-6 gap-y-0.5 py-3"><dt className="text-ink-soft">{k}</dt><dd className="font-medium text-ink">{v}</dd></div>)}
          </dl>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <div className="rounded-xl bg-mist-pale p-6 sm:p-8">
            <h3 className="text-[20px] font-semibold tracking-tight text-ink">{A.stepsTitle}</h3>
            <ol className="mt-5 space-y-5">
              {A.steps.map(([t, d], i) => (
                <li key={t} className="grid grid-cols-[36px_1fr] gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-navy text-[14px] font-semibold text-white">{i + 1}</span>
                  <div><p className="font-semibold text-ink">{t}</p><p className="mt-0.5 text-[15px] leading-relaxed text-ink-soft">{d}</p></div>
                </li>
              ))}
            </ol>
            <a href={wa(c.contact.waQuote)} target="_blank" rel="noopener" className="tap mt-7 flex h-[52px] items-center justify-center gap-2 rounded-full bg-navy px-5 text-[15.5px] font-semibold text-white transition hover:bg-navy-deep"><WaIcon />{c.hero.cta}</a>
          </div>
        </div>
      </div>
    </section>
  )
}

function Reviews() {
  const { c } = useI18n<Content>()
  const fmt = useDate()
  return (
    <section id="reviews" className="overflow-hidden bg-mist-pale">
      <div className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7"><Kicker>{c.reviews.kicker}</Kicker><h2 className="h2 mt-3">{c.reviews.title}</h2></div>
          <div className="flex items-center gap-4 lg:col-span-5 lg:justify-self-end">
            <p className="text-[64px] font-semibold leading-none tracking-tight text-navy">{BIZ.rating}</p>
            <div>
              <span className="text-[#C99A2E]"><Stars className="h-[18px] w-[18px]" /></span>
              <p className="mt-0.5 text-[15px] text-ink-soft">{c.reviews.sub}</p>
              <a href={BIZ.maps} target="_blank" rel="noopener" className="inline-flex min-h-[40px] items-center text-[15px] font-semibold text-navy underline decoration-navy/30 underline-offset-4 hover:decoration-navy">{c.reviews.all}<Ext /></a>
            </div>
          </div>
        </div>
        <Rail label={c.reviews.region} count={c.reviews.items.length} prev={c.reviews.prev} next={c.reviews.next} className="mt-9 lg:mt-12">
          {c.reviews.items.map((r) => (
            <li key={r.date} className="w-[86%] shrink-0 sm:w-[calc((100%-16px)/2)] xl:w-[calc((100%-32px)/3)]">
              <figure className="flex h-full flex-col rounded-xl bg-white p-6 ring-1 ring-navy/10 sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#C99A2E]"><Stars className="h-4 w-4" /></span>
                  <span className="rounded-full bg-mist-soft px-3 py-1 text-[12.5px] font-semibold text-ink">{r.tag}</span>
                </div>
                <blockquote className="mt-4 flex-1 text-[16.5px] leading-relaxed text-ink" lang="en">“{r.text}”</blockquote>
                <figcaption className="mt-5 border-t border-navy/10 pt-3 text-[13.5px] text-ink-soft">{c.reviews.source} · {fmt(r.date)}</figcaption>
              </figure>
            </li>
          ))}
        </Rail>
        {c.reviews.origNote && <p className="mt-4 text-[13px] text-ink-soft">{c.reviews.origNote}</p>}
      </div>
    </section>
  )
}

function Faq() {
  const { c } = useI18n<Content>()
  return (
    <section id="faq" className="mx-auto grid max-w-[1280px] gap-8 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:gap-10 lg:py-24">
      <div className="lg:col-span-4"><Kicker>{c.faq.kicker}</Kicker><h2 className="h2 mt-3">{c.faq.title}</h2></div>
      <div className="border-t border-navy/15 lg:col-span-8">
        {c.faq.items.map(([q, a]) => (
          <details key={q} className="group border-b border-navy/15">
            <summary className="flex min-h-[60px] cursor-pointer items-center justify-between gap-6 py-4 text-[17px] font-semibold text-ink transition hover:text-navy">
              {q}<span className="faq-i grid h-8 w-8 shrink-0 place-items-center rounded-full border border-navy/20 text-lg transition" aria-hidden>+</span>
            </summary>
            <p className="max-w-2xl pb-6 text-[16px] leading-relaxed text-ink-soft">{a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

function Contact() {
  const { c } = useI18n<Content>()
  const [day, setDay] = useState(-1)
  useEffect(() => { setDay(nowInKL().day) }, [])
  const todayRow = day === 0 ? 1 : day > 0 ? 0 : -1
  const label = 'text-[12.5px] font-semibold uppercase tracking-[0.14em] text-navy'
  return (
    <section id="contact" className="border-t border-navy/10 bg-white">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:gap-10 lg:py-24">
        <div className="lg:col-span-6">
          <Kicker>{c.contact.kicker}</Kicker>
          <h2 className="h2 mt-3">{c.contact.title}</h2>
          <p className="mt-4 max-w-md text-[16.5px] leading-relaxed text-ink-soft">{c.contact.sub}</p>
          <div className="mt-7 grid gap-3 sm:flex">
            <a href={wa(c.contact.waMsg)} target="_blank" rel="noopener" className="tap inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-navy px-7 text-[15.5px] font-semibold text-white transition hover:bg-navy-deep"><WaIcon />{c.waCta}</a>
            <a href={`tel:${BIZ.tel}`} className="tap inline-flex h-[52px] items-center justify-center gap-2 rounded-full border border-navy/25 px-7 text-[15.5px] font-semibold text-ink transition hover:border-navy"><PhoneIcon />{c.call}</a>
          </div>
          <dl className="mt-10 grid gap-7 sm:grid-cols-2">
            <div><dt className={label}>{c.contact.phone}</dt><dd className="mt-2"><a href={`tel:${BIZ.tel}`} className="text-[18px] font-semibold text-ink hover:text-navy">{BIZ.phone}</a></dd></div>
            <div><dt className={label}>{c.contact.email}</dt><dd className="mt-2"><a href={`mailto:${BIZ.email}`} className="break-all text-[16px] font-medium text-ink underline decoration-navy/25 underline-offset-4 hover:decoration-navy">{BIZ.email}</a></dd></div>
            <div><dt className={label}>{c.contact.address}</dt><dd className="mt-2 text-[15.5px] leading-relaxed text-ink">{BIZ.street},<br />{BIZ.city}
              <a href={BIZ.directions} target="_blank" rel="noopener" className="mt-1 flex min-h-[44px] w-fit items-center text-[14.5px] font-semibold text-navy underline decoration-navy/30 underline-offset-4 hover:decoration-navy">{c.contact.directions}<Ext /></a></dd></div>
            <div><dt className={label}>{c.contact.hours}</dt>
              <dd className="mt-2 space-y-1 text-[15.5px]">
                {c.contact.days.map(([d, h], i) => (
                  <p key={d} className={`-mx-2 flex flex-wrap justify-between gap-x-4 rounded-md px-2 py-1 ${todayRow === i ? 'bg-mist-pale font-semibold text-ink' : 'text-ink-soft'}`}><span className="whitespace-nowrap">{d}{todayRow === i && <span className="ml-2 text-[11px] font-semibold uppercase tracking-wider text-navy">{c.contact.today}</span>}</span><span className="whitespace-nowrap">{h}</span></p>
                ))}
              </dd></div>
          </dl>
        </div>
        <div className="space-y-8 lg:col-span-5 lg:col-start-8">
          <figure>
            <a href={BIZ.maps} target="_blank" rel="noopener" className="group relative block overflow-hidden rounded-xl ring-1 ring-navy/15">
              <img src={asset('images/map-600.webp')} srcSet={`${asset('images/map-600.webp')} 600w, ${asset('images/map-900.webp')} 900w`} sizes="(min-width:1024px) 480px, 100vw" width={900} height={560} loading="lazy" decoding="async" alt={c.contact.mapAlt} className="aspect-[900/560] w-full object-cover" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full" aria-hidden>
                <svg viewBox="0 0 32 42" className="h-11 w-auto drop-shadow-md"><path d="M16 0C7.2 0 0 7 0 15.7 0 27.5 16 42 16 42s16-14.5 16-26.3C32 7 24.8 0 16 0z" fill="#384254" /><circle cx="16" cy="15.5" r="6" fill="#BFD0DA" /></svg>
              </span>
              <span className="absolute bottom-3 right-3 rounded-full bg-white px-3.5 py-2 text-[13.5px] font-semibold text-ink shadow transition group-hover:bg-navy group-hover:text-white">{c.contact.maps}<Ext /></span>
            </a>
            <figcaption className="mt-2 text-[12px] text-ink-soft">{c.contact.mapCredit}</figcaption>
          </figure>
          <div>
            <h3 className={label}>{c.contact.follow}</h3>
            <div className="mt-3 space-y-3 text-[14.5px]">
              {(['studio', 'aircond'] as const).map((t) => (
                <div key={t} className="flex flex-wrap items-center gap-x-4 border-b border-navy/10 pb-3">
                  <span className="w-full font-semibold text-ink sm:w-48">{t === 'studio' ? 'EYCR Studio' : 'EYCR Aircond & Electrical'}</span><Socials team={t} />
                </div>
              ))}
              <a href={BIZ.linktree} target="_blank" rel="noopener" className="inline-flex min-h-[40px] items-center font-semibold text-navy underline decoration-navy/30 underline-offset-4 hover:decoration-navy">{c.contact.links}: linktr.ee/eycr<Ext /></a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const { c } = useI18n<Content>()
  const h = 'text-[12.5px] font-semibold uppercase tracking-[0.14em] text-mist'
  const a = 'inline-flex min-h-[36px] items-center text-white/80 hover:text-white'
  return (
    <footer className="on-dark bg-navy-deep text-white">
      <div className="mx-auto max-w-[1280px] px-5 pb-28 pt-14 sm:px-8 lg:pb-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-12">
          <div className="col-span-2 lg:col-span-5">
            <Logo dark />
            <p className="mt-4 max-w-sm text-[14.5px] leading-relaxed text-white/70">{c.footer.blurb}</p>
          </div>
          <nav aria-label={c.footer.explore} className="lg:order-2 lg:col-span-2">
            <h2 className={h}>{c.footer.explore}</h2>
            <ul className="mt-3 text-[14.5px]">{c.nav.map(([id, l]) => <li key={id}><a href={`#${id}`} className={a}>{l}</a></li>)}</ul>
          </nav>
          <div className="col-span-2 sm:col-span-1 lg:order-3 lg:col-span-3">
            <h2 className={h}>{c.footer.reach}</h2>
            <ul className="mt-3 text-[14.5px]">
              <li><a href={`tel:${BIZ.tel}`} className={a}>{BIZ.phone}</a></li>
              <li><a href={`mailto:${BIZ.email}`} className={`${a} break-all`}>{BIZ.email}</a></li>
              <li><a href={BIZ.maps} target="_blank" rel="noopener" className={a}>{BIZ.street}</a></li>
              <li className="py-1.5 text-white/60">{c.contact.days[0][0]}, {c.contact.days[0][1]}</li>
            </ul>
          </div>
          <div className="lg:order-4 lg:col-span-2">
            <h2 className={h}>Instagram</h2>
            <ul className="mt-3 text-[14.5px]">
              <li><a href={BIZ.igStudio} target="_blank" rel="noopener" className={a}>@eycrstudio</a></li>
              <li><a href={BIZ.igAircond} target="_blank" rel="noopener" className={a}>@eycraircond</a></li>
              <li><a href={BIZ.linktree} target="_blank" rel="noopener" className={a}>Linktree</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-[12.5px] text-white/60 sm:flex-row sm:flex-wrap sm:justify-between">
          <p>© {new Date().getFullYear()} {BIZ.name}. {c.footer.rights}</p>
          <p>{c.footer.photos}</p>
        </div>
        <p className="mt-4 text-[12px] leading-relaxed text-white/60">{c.footer.pitch} <a href={PITCH_WA} target="_blank" rel="noopener" className="inline-flex min-h-[24px] items-center font-semibold text-white/80 underline decoration-white/30 underline-offset-2 hover:text-white">{c.footer.pitchLink}</a></p>
      </div>
    </footer>
  )
}

function MobileBar() {
  const { c } = useI18n<Content>()
  const [show, setShow] = useState(false)
  useEffect(() => {
    const on = () => setShow(window.scrollY > window.innerHeight * 0.7)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <nav aria-label={c.a11y.bar} aria-hidden={!show} data-fab
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-navy/10 bg-white/95 px-3 pb-[max(.6rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur transition duration-300 lg:hidden ${show ? '' : 'pointer-events-none translate-y-full opacity-0'}`}>
      <div className="mx-auto grid max-w-md grid-cols-[1fr_auto] gap-2">
        <a href={wa(c.contact.waMsg)} target="_blank" rel="noopener" tabIndex={show ? 0 : -1} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-navy text-[15.5px] font-semibold text-white"><WaIcon />{c.waCta}</a>
        <a href={`tel:${BIZ.tel}`} tabIndex={show ? 0 : -1} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-navy/25 bg-white px-5 text-[15.5px] font-semibold text-ink"><PhoneIcon className="h-[18px] w-[18px]" />{c.call}</a>
      </div>
    </nav>
  )
}

export default function App() {
  const { c } = useI18n<Content>()
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const closeMenu = useCallback(() => setOpen(false), [])
  useMenu(open, closeMenu, btnRef)
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-navy focus:px-4 focus:py-2 focus:text-white">{c.a11y.skip}</a>
      <Header onMenu={() => setOpen((o) => !o)} menuOpen={open} btnRef={btnRef} />
      {open && <MobileMenu close={closeMenu} />}
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Work />
        <Services />
        <About />
        <Reviews />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <MobileBar />
    </>
  )
}
