import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { asset, useI18n } from './i18n'
import { useActiveSection, useDialogFlag, useMenu } from './hooks'
import { useOpenStatus, nowInKL, type Week } from './hours'
import { Reveal } from './Reveal'
import { BIZ, type Content, type TradeId } from './content'

const PITCH_WA = 'https://wa.me/601151198497'
const wa = (t: string) => `https://wa.me/${BIZ.wa}?text=${encodeURIComponent(t)}`
const WEEK: Week = [null, [540, 1080], [540, 1080], [540, 1080], [540, 1080], [540, 1080], [540, 1080]]
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const pad = (n: number) => String(n).padStart(2, '0')

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
function Stars({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => <svg key={i} viewBox="0 0 20 20" className={className} fill="currentColor"><path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z" /></svg>)}
    </span>
  )
}
function Arrow({ className = 'h-4 w-4', dir = 'right' }: { className?: string; dir?: 'right' | 'left' | 'up' }) {
  const r = dir === 'left' ? 180 : dir === 'up' ? -90 : 0
  return <svg viewBox="0 0 20 20" className={className} style={{ transform: `rotate(${r}deg)` }} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 10h12M11 5l5 5-5 5" /></svg>
}

function Kicker({ n, children, dark = false }: { n: number; children: ReactNode; dark?: boolean }) {
  return (
    <p className={`kicker ${dark ? 'text-cobalt-sky' : 'text-cobalt'}`}>
      <b>{pad(n)}</b><span className={`h-px w-8 ${dark ? 'bg-cobalt-sky/60' : 'bg-cobalt/50'}`} aria-hidden />{children}
    </p>
  )
}

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-cobalt font-display text-[19px] font-bold leading-none text-white">EY</span>
      <span className={`text-[13px] font-semibold leading-[1.15] tracking-tight ${dark ? 'text-white' : 'text-ink'}`}>Creative Reno<br />&amp; Designs</span>
    </span>
  )
}

function StatusPill({ className = '', dark = false }: { className?: string; dark?: boolean }) {
  const { c } = useI18n<Content>()
  const s = useOpenStatus(WEEK)
  if (!s) return <span className={`inline-block h-8 w-36 ${className}`} aria-hidden />
  const txt = s.open
    ? `${c.status.open} · ${c.status.closes}`
    : `${c.status.closed} · ${s.nextOpenDay === s.day ? c.status.opensToday : s.nextOpenDay === (s.day + 1) % 7 ? c.status.opensTomorrow : c.status.opensMon}`
  return (
    <span className={`inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-full border px-3 text-[12.5px] font-medium ${dark ? 'border-white/25 text-white' : 'border-ink/15 text-ink'} ${className}`}>
      <span className={`relative h-2 w-2 rounded-full ${s.open ? 'bg-[#2BB673]' : 'bg-volt'}`} aria-hidden>
        {s.open && <span className="absolute inset-0 animate-ping rounded-full bg-[#2BB673] opacity-60" />}
      </span>
      {txt}
    </span>
  )
}

function Header({ onMenu, menuOpen, btnRef }: { onMenu: () => void; menuOpen: boolean; btnRef: React.RefObject<HTMLButtonElement | null> }) {
  const { c, lang, setLang } = useI18n<Content>()
  const active = useActiveSection(c.nav.map(([id]) => id))
  return (
    <header className="bar sticky top-0 z-40 border-b border-ink/10">
      <div className="mx-auto flex h-14 max-w-[1320px] items-center justify-between gap-3 px-5 sm:px-8 lg:h-[68px]">
        <a href="#top" className="tap flex items-center rounded-md"><Logo /></a>
        <nav aria-label={c.a11y.main} className="hidden items-center gap-7 lg:flex">
          {c.nav.map(([id, l]) => (
            <a key={id} href={`#${id}`} aria-current={active === id ? 'true' : undefined} className={`nav-link py-3 text-[14.5px] font-medium transition hover:text-cobalt ${active === id ? 'text-cobalt' : 'text-ink'}`}>{l}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <StatusPill className="hidden xl:inline-flex" />
          <button data-lang-toggle onClick={() => setLang(lang === 'en' ? 'ms' : 'en')} aria-label={c.langAria} className="tap rounded-full px-2 text-[13px] font-bold tracking-wider text-ink transition hover:text-cobalt">{c.langLabel}</button>
          <a href={wa(c.contact.waMsg)} target="_blank" rel="noopener" className="tap hidden items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white transition hover:bg-cobalt sm:inline-flex"><WaIcon className="h-4 w-4" />{c.waCta}</a>
          <button ref={btnRef} onClick={onMenu} aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? c.a11y.menuClose : c.a11y.menuOpen} className="tap -mr-2 grid place-items-center rounded-full lg:hidden">
            <span className="relative block h-3 w-6" aria-hidden>
              <span className={`absolute left-0 h-[2px] w-6 bg-ink transition ${menuOpen ? 'top-[5px] rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 h-[2px] bg-ink transition-all ${menuOpen ? 'top-[5px] w-6 -rotate-45' : 'top-[10px] w-4'}`} />
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
    <div id="mobile-menu" role="dialog" aria-modal="true" aria-label={c.a11y.mobile} className="fixed inset-x-0 bottom-0 top-14 z-30 flex flex-col overflow-y-auto bg-paper px-5 pb-8 pt-2 lg:hidden">
      <nav aria-label={c.a11y.mobile}>
        {c.nav.map(([id, l], i) => (
          <a key={id} href={`#${id}`} onClick={close} className="flex min-h-[64px] items-center gap-4 border-b border-ink/10 active:text-cobalt">
            <span className="w-7 font-display text-[16px] font-bold text-cobalt">{pad(i + 1)}</span>
            <span className="disp text-[34px]">{l}</span>
          </a>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-3 pt-8">
        <StatusPill className="self-start" />
        <div className="grid grid-cols-2 gap-3">
          <a href={wa(c.contact.waMsg)} target="_blank" rel="noopener" className="tap inline-flex items-center justify-center gap-2 rounded-full bg-cobalt px-4 font-semibold text-white"><WaIcon />{c.waCta}</a>
          <a href={`tel:${BIZ.tel}`} className="tap inline-flex items-center justify-center gap-2 rounded-full border border-ink/20 px-4 font-semibold text-ink"><PhoneIcon />{c.call}</a>
        </div>
      </div>
    </div>
  )
}

function Hero() {
  const { c, lang } = useI18n<Content>()
  const size = lang === 'ms' ? 'text-[clamp(2.9rem,12.6vw,4.6rem)] lg:text-[clamp(4.4rem,6.3vw,6.6rem)]' : 'text-[clamp(3.3rem,15.4vw,5.4rem)] lg:text-[clamp(5rem,7.6vw,8rem)]'
  return (
    <section id="top" className="on-dark relative bg-cobalt text-white lg:grid lg:min-h-[min(860px,calc(100svh-68px))] lg:grid-cols-2">
      <div className="relative flex flex-col px-5 pb-8 pt-7 sm:px-8 sm:pt-12 lg:justify-between lg:py-14 lg:pl-[max(2rem,calc((100vw-1320px)/2+2rem))] lg:pr-12">
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[.09]" aria-hidden><defs><pattern id="g" width="56" height="56" patternUnits="userSpaceOnUse"><path d="M56 0H0v56" fill="none" stroke="#fff" /></pattern></defs><rect width="100%" height="100%" fill="url(#g)" /></svg>
        <div className="relative">
          <p className="kicker text-cobalt-soft"><span className="h-2 w-2 rounded-full bg-volt" aria-hidden />{c.hero.eyebrow}</p>
          <h1 className={`disp mt-5 ${size}`}>
            {c.hero.h1.map((l, i) => <span key={l} className={`block whitespace-nowrap ${i === 2 ? 'text-volt' : ''}`}>{l}</span>)}
          </h1>
          <p className="mt-5 max-w-[30rem] text-[16.5px] leading-relaxed text-[#E1E6FF] sm:text-[18px] lg:mt-7">{c.hero.sub}</p>
          <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 lg:mt-9">
            <a href="#ticket" className="group tap inline-flex h-[54px] items-center justify-center gap-3 rounded-full bg-white px-7 text-[16px] font-semibold text-ink shadow-[0_10px_30px_-10px_rgba(0,0,0,.45)] transition hover:bg-volt">
              {c.hero.cta}<Arrow className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
            <a href={wa(c.contact.waMsg)} target="_blank" rel="noopener" className="tap inline-flex items-center justify-center gap-2 rounded-full px-4 text-[15px] font-semibold text-white underline decoration-white/40 underline-offset-[6px] transition hover:decoration-volt sm:justify-start"><WaIcon className="h-[18px] w-[18px]" />{c.hero.cta2}</a>
          </div>
        </div>
        <dl className="relative mt-8 grid grid-cols-3 border-t border-white/20 pt-4 text-[13px] leading-snug sm:text-[14px] lg:mt-12">
          <div className="pr-3"><dt className="sr-only">Google</dt><dd><a href={BIZ.maps} target="_blank" rel="noopener" className="inline-flex flex-col rounded-sm"><span className="flex items-center gap-1.5 font-display text-[22px] font-bold leading-none">{BIZ.rating}<span className="text-volt"><Stars className="h-3.5 w-3.5" /></span></span><span className="mt-1 text-[#E1E6FF]">{BIZ.reviews} {c.hero.reviewsWord}</span></a></dd></div>
          <div className="border-l border-white/20 px-3"><dt className="sr-only">{c.contact.hours}</dt><dd><span className="block font-display text-[22px] font-bold leading-none">9–6</span><span className="mt-1 block text-[#E1E6FF]">{c.hero.hours}</span></dd></div>
          <div className="border-l border-white/20 pl-3"><dt className="sr-only">{c.contact.address}</dt><dd><span className="block font-display text-[22px] font-bold leading-none">KL</span><span className="mt-1 block text-[#E1E6FF]">{c.hero.area}</span></dd></div>
        </dl>
      </div>
      <figure className="relative bg-ink lg:h-full">
        <picture>
          <source media="(min-width: 1024px)" srcSet={`${asset('images/hero-720.webp')} 720w, ${asset('images/hero-1100.webp')} 1100w`} sizes="50vw" />
          <img src={asset('images/hero-m-800.webp')} srcSet={`${asset('images/hero-m-560.webp')} 560w, ${asset('images/hero-m-800.webp')} 800w`} sizes="100vw" width={800} height={600} alt={c.trades.alt.interior} fetchPriority="high" decoding="async" className="aspect-[4/3] w-full object-cover sm:aspect-[16/9] lg:absolute lg:inset-0 lg:aspect-auto lg:h-full" />
        </picture>
        <figcaption className="absolute bottom-3 left-3 rounded-full bg-ink/75 px-3 py-1 text-[12px] font-medium text-white">{c.hero.photo}</figcaption>
      </figure>
    </section>
  )
}

/** Horizontal swipe rail on small screens; arrow buttons + dots. */
function Rail({ label, count, children, className = '', listClass = '', prev, next, dark = false }: { label: string; count: number; children: ReactNode; className?: string; listClass?: string; prev: string; next: string; dark?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [idx, setIdx] = useState(0)
  const step = () => { const el = ref.current; const li = el?.querySelector('li'); return li ? li.getBoundingClientRect().width + 16 : 300 }
  const [end, setEnd] = useState(false)
  const onScroll = () => { const el = ref.current; if (!el) return; setIdx(Math.min(count - 1, Math.round(el.scrollLeft / step()))); setEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) }
  useEffect(() => { onScroll() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const go = (d: number) => ref.current?.scrollBy({ left: d * step(), behavior: reduced() ? 'auto' : 'smooth' })
  const btn = `tap grid place-items-center rounded-full border transition disabled:opacity-35 ${dark ? 'border-white/25 text-white hover:bg-white hover:text-ink' : 'border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-white'}`
  return (
    <div className={className}>
      <div ref={ref} onScroll={onScroll} role="region" aria-label={label} tabIndex={0} className="rail -mx-5 scroll-px-5 overflow-x-auto px-5 sm:-mx-8 sm:scroll-px-8 sm:px-8">
        <ul className={`flex gap-4 ${listClass}`}>{children}</ul>
      </div>
      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="flex gap-1.5" aria-hidden>
          {Array.from({ length: count }, (_, i) => <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${(end ? i === count - 1 : i === idx) ? `w-6 ${dark ? 'bg-volt' : 'bg-cobalt'}` : `w-1.5 ${dark ? 'bg-white/30' : 'bg-ink/20'}`}`} />)}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => go(-1)} disabled={idx === 0} aria-label={prev} className={btn}><Arrow dir="left" /></button>
          <button type="button" onClick={() => go(1)} disabled={end} aria-label={next} className={btn}><Arrow /></button>
        </div>
      </div>
    </div>
  )
}

function Trades({ chosen, toggle }: { chosen: TradeId[]; toggle: (t: TradeId) => void }) {
  const { c } = useI18n<Content>()
  const tile = (t: Content['trades']['items'][number], i: number) => {
    const on = chosen.includes(t.id)
    return (
      <article className={`tile flex h-full flex-col overflow-hidden rounded-xl bg-white ring-1 transition ${on ? 'ring-2 ring-cobalt' : 'ring-ink/10'}`}>
        <div className="relative overflow-hidden bg-ink">
          <img src={asset(`images/${t.id}-420.webp`)} srcSet={`${asset(`images/${t.id}-420.webp`)} 420w, ${asset(`images/${t.id}-640.webp`)} 640w`} sizes="(min-width:1280px) 300px, (min-width:768px) 45vw, 80vw" width={640} height={800} loading="lazy" decoding="async" alt={c.trades.alt[t.id]} className="aspect-[4/5] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" aria-hidden />
          <span className="absolute left-4 top-3 font-display text-[44px] font-bold leading-none text-white/90">{pad(i + 1)}</span>
          <span className="absolute right-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 text-[12px] font-medium text-white">{c.hero.photo}</span>
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <h3 className="disp text-[34px]">{t.name}</h3>
            <p className="mt-2 text-[15px] leading-snug text-white/85">{t.line}</p>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="text-[14.5px] leading-relaxed text-ink-soft">{t.jobs.join(' · ')}</p>
          <button type="button" role="switch" aria-checked={on} onClick={() => toggle(t.id)} className="tap mt-auto flex w-full items-center justify-between gap-3 border-t border-ink/10 pt-4 text-left text-[15px] font-semibold text-ink">
            <span>{on ? c.trades.added : c.trades.add}</span><span className="sw" aria-hidden />
          </button>
        </div>
      </article>
    )
  }
  return (
    <section id="trades" className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 lg:py-28">
      <div className="grid gap-5 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7"><Kicker n={1}>{c.trades.kicker}</Kicker><h2 className="h2 mt-4">{c.trades.title}</h2></div>
        <p className="max-w-md text-[16px] leading-relaxed text-ink-soft lg:col-span-5 lg:justify-self-end">{c.trades.note}</p>
      </div>
      <div className="mt-10 md:hidden">
        <Rail label={c.trades.region} count={4} prev={c.trades.prev} next={c.trades.next} listClass="pb-1">
          {c.trades.items.map((t, i) => <li key={t.id} className="w-[80%] shrink-0">{tile(t, i)}</li>)}
        </Rail>
      </div>
      <ul className="mt-14 hidden gap-5 md:grid md:grid-cols-2 xl:grid-cols-4">
        {c.trades.items.map((t, i) => <li key={t.id}><Reveal delay={i * 70} className="h-full">{tile(t, i)}</Reveal></li>)}
      </ul>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <a href={wa(c.contact.waMsg)} target="_blank" rel="noopener" className="inline-flex min-h-[44px] items-center gap-2 text-[15px] font-semibold text-cobalt underline decoration-cobalt/35 underline-offset-4 hover:decoration-cobalt"><WaIcon className="h-[18px] w-[18px]" />{c.trades.unsure}</a>
        <div aria-live="polite">
          {chosen.length > 0 && (
            <a href="#ticket" className="tap inline-flex items-center gap-3 rounded-full bg-ink py-1 pl-5 pr-1.5 text-[15px] font-semibold text-white transition hover:bg-cobalt">
              <span>{chosen.length} {chosen.length === 1 ? c.trades.selOne : c.trades.selMany}</span>
              <span className="inline-flex h-9 items-center gap-2 rounded-full bg-white px-4 text-ink">{c.trades.go}<Arrow /></span>
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

function How() {
  const { c } = useI18n<Content>()
  return (
    <section id="how" className="on-dark bg-ink text-white">
      <div className="mx-auto grid max-w-[1320px] gap-14 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:gap-10 lg:py-28">
        <div className="lg:col-span-6">
          <Kicker n={2} dark>{c.how.kicker}</Kicker>
          <h2 className="h2 mt-4">{c.how.title}</h2>
          <div className="mt-10 overflow-hidden rounded-xl ring-1 ring-white/12">
            <div className="grid grid-cols-2 bg-white/[.04] text-[12.5px] font-semibold uppercase tracking-[0.14em]">
              <p className="px-4 py-3 text-white/70">{c.how.usual}</p>
              <p className="bg-cobalt px-4 py-3 text-white">{c.how.ey}</p>
            </div>
            <ul>
              {c.how.rows.map(([u, e]) => (
                <li key={u} className="grid grid-cols-2 border-t border-white/10 text-[14.5px] leading-snug sm:text-[15.5px]">
                  <span className="px-4 py-3.5 text-white/65">{u}</span>
                  <span className="flex gap-2.5 bg-cobalt/20 px-4 py-3.5 font-medium text-white">
                    <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-volt" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 10.5l4 4L16 6" /></svg>{e}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="lg:col-span-5 lg:col-start-8 lg:pt-3">
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.16em] text-cobalt-sky">{c.how.stepsTitle}</h3>
          <ol className="mt-6">
            {c.how.steps.map(([t, d], i) => (
              <li key={t} className="group grid grid-cols-[64px_1fr] gap-4 border-t border-white/12 py-6 last:border-b sm:grid-cols-[88px_1fr]">
                <span className="font-display text-[48px] font-bold leading-[.85] text-transparent transition group-hover:text-volt sm:text-[64px]" style={{ WebkitTextStroke: '1.5px #AFC0FF' }}>{pad(i + 1)}</span>
                <div><p className="disp text-[28px]">{t}</p><p className="mt-1.5 text-[15.5px] leading-relaxed text-white/75">{d}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function Reviews() {
  const { c, lang } = useI18n<Content>()
  const fmt = (d: string) => new Intl.DateTimeFormat(lang === 'ms' ? 'ms-MY' : 'en-GB', { month: 'short', year: 'numeric' }).format(new Date(d + 'T12:00:00'))
  return (
    <section id="reviews" className="overflow-hidden bg-paper-2">
      <div className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 lg:py-28">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7"><Kicker n={3}>{c.reviews.kicker}</Kicker><h2 className="h2 mt-4">{c.reviews.title}</h2></div>
          <div className="flex items-center gap-5 lg:col-span-5 lg:justify-self-end">
            <p className="font-display text-[88px] font-bold leading-[.8] text-cobalt lg:text-[120px]">{BIZ.rating}</p>
            <div>
              <span className="text-cobalt"><Stars className="h-5 w-5" /></span>
              <p className="mt-1 text-[15px] text-ink-soft">{c.reviews.sub}</p>
              <a href={BIZ.maps} target="_blank" rel="noopener" className="inline-flex min-h-[40px] items-center gap-2 text-[15px] font-semibold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-cobalt">{c.reviews.all}<span aria-hidden>↗</span></a>
            </div>
          </div>
        </div>
        <Rail label={c.reviews.region} count={c.reviews.items.length} prev={c.reviews.prev} next={c.reviews.next} className="mt-10 lg:mt-14">
          {c.reviews.items.map((r) => (
            <li key={r.date} className="w-[86%] shrink-0 sm:w-[calc((100%-16px)/2)] xl:w-[calc((100%-32px)/3)]">
              <figure className="flex h-full flex-col rounded-xl bg-paper p-6 ring-1 ring-ink/10 sm:p-8">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-[56px] font-bold leading-[.6] text-cobalt" aria-hidden>“</span>
                  <span className="rounded-full bg-cobalt-soft px-3 py-1 text-[12.5px] font-semibold text-ink">{r.tag}</span>
                </div>
                <blockquote className="mt-5 flex-1 text-[17px] leading-relaxed text-ink" lang="en">{r.text}</blockquote>
                <figcaption className="mt-6 flex items-center gap-2 border-t border-ink/10 pt-4 text-[13.5px] text-ink-soft"><span className="text-cobalt"><Stars className="h-3.5 w-3.5" /></span>Google · {fmt(r.date)}</figcaption>
              </figure>
            </li>
          ))}
        </Rail>
        {c.reviews.origNote && <p className="mt-4 text-[13px] text-ink-soft">{c.reviews.origNote}</p>}
      </div>
    </section>
  )
}

type TicketState = { trades: TradeId[]; jobs: Record<string, string[]>; property: number; area: string; timing: number; note: string }
const EMPTY: TicketState = { trades: [], jobs: {}, property: -1, area: '', timing: -1, note: '' }

function Row({ n, label, children, opt }: { n: number; label: string; children: ReactNode; opt?: string }) {
  return (
    <fieldset className="flow-root border-t border-ink/10 py-6">
      <legend className="float-left mb-3 flex w-full items-baseline gap-3 text-[15px] font-semibold text-ink sm:mb-0 sm:w-[150px]"><span className="font-display text-[20px] font-bold text-cobalt">{pad(n)}</span><span>{label}{opt && <span className="block text-[13px] font-normal text-ink-soft">({opt})</span>}</span></legend>
      <div className="clear-left sm:clear-none sm:ml-[174px]">{children}</div>
    </fieldset>
  )
}

function Ticket({ state, setState }: { state: TicketState; setState: (f: (s: TicketState) => TicketState) => void }) {
  const { c, lang } = useI18n<Content>()
  const T = c.ticket
  const byId = Object.fromEntries(c.trades.items.map((t) => [t.id, t])) as Record<TradeId, Content['trades']['items'][number]>
  const toggleTrade = (t: TradeId) => setState((s) => ({ ...s, trades: s.trades.includes(t) ? s.trades.filter((x) => x !== t) : [...s.trades, t] }))
  const toggleJob = (t: TradeId, j: number) => setState((s) => {
    const cur = s.jobs[t] || []; const k = String(j)
    return { ...s, jobs: { ...s.jobs, [t]: cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k] } }
  })
  const ordered = c.trades.items.map((t) => t.id).filter((id) => state.trades.includes(id))
  const lines = ordered.map((t) => {
    const jobs = (state.jobs[t] || []).map((k) => byId[t].jobs[Number(k)]).filter(Boolean)
    return `${byId[t].name}: ${jobs.length ? jobs.join(', ') : T.general}`
  })
  const msg = [
    T.msgHi, '',
    `${T.msgJobs}:`, ...(lines.length ? lines.map((l) => `• ${l}`) : [`• ${T.general}`]),
    state.property >= 0 ? `${T.msgProperty}: ${T.property[state.property]}` : '',
    state.area.trim() ? `${T.msgArea}: ${state.area.trim()}` : '',
    state.timing >= 0 ? `${T.msgTiming}: ${T.timing[state.timing]}` : '',
    state.note.trim() ? `${T.msgNote}: ${state.note.trim()}` : '',
    '', T.msgPhotos,
  ].filter((l, i, a) => l !== '' || (a[i - 1] !== '' && i > 0)).join('\n')
  const today = useMemo(() => new Intl.DateTimeFormat(lang === 'ms' ? 'ms-MY' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kuala_Lumpur' }).format(new Date()), [lang])
  const chip = (on: boolean) => `tap inline-flex items-center gap-2 rounded-full border px-4 text-[14.5px] font-medium transition ${on ? 'border-ink bg-ink text-white' : 'border-ink/15 bg-white text-ink hover:border-ink'}`
  return (
    <section id="ticket" className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 lg:py-28">
      <div className="grid gap-5 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7"><Kicker n={4}>{T.kicker}</Kicker><h2 className="h2 mt-4">{T.title}</h2></div>
        <p className="max-w-md text-[16px] leading-relaxed text-ink-soft lg:col-span-5 lg:justify-self-end">{T.sub}</p>
      </div>
      <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-12">
        <div className="border-b border-ink/10 lg:col-span-7">
          <Row n={1} label={T.step1}>
            <div className="flex flex-wrap gap-2">
              {c.trades.items.map((t) => { const on = state.trades.includes(t.id); return <button key={t.id} type="button" aria-pressed={on} onClick={() => toggleTrade(t.id)} className={chip(on)}>{on && <span aria-hidden>✓</span>}{t.name}</button> })}
            </div>
          </Row>
          <Row n={2} label={T.step2}>
            {ordered.length === 0 ? <p className="rounded-lg border border-dashed border-ink/25 px-4 py-3 text-[14.5px] text-ink-soft">{T.pickTrade}</p> : (
              <div className="space-y-4">
                {ordered.map((t) => (
                  <div key={t}>
                    <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-soft">{byId[t].name}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {byId[t].jobs.map((j, k) => { const on = (state.jobs[t] || []).includes(String(k)); return <button key={j} type="button" aria-pressed={on} onClick={() => toggleJob(t, k)} className={chip(on)}>{j}</button> })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Row>
          <Row n={3} label={T.step3}>
            <div className="flex flex-wrap gap-2">
              {T.property.map((p, i) => (
                <label key={p} className={`radio ${chip(state.property === i)}`}><input type="radio" name="property" className="sr-only" checked={state.property === i} onChange={() => setState((s) => ({ ...s, property: i }))} />{p}</label>
              ))}
            </div>
          </Row>
          <Row n={4} label={T.step5}>
            <div className="flex flex-wrap gap-2">
              {T.timing.map((p, i) => (
                <label key={p} className={`radio ${chip(state.timing === i)}`}><input type="radio" name="timing" className="sr-only" checked={state.timing === i} onChange={() => setState((s) => ({ ...s, timing: i }))} />{p}</label>
              ))}
            </div>
          </Row>
          <Row n={5} label={`${T.step4} · ${T.card.note}`}>
            <div className="grid gap-3 sm:grid-cols-2">
              <input aria-label={T.step4} value={state.area} onChange={(e) => setState((s) => ({ ...s, area: e.target.value }))} placeholder={T.areaPh} maxLength={60} className="field" />
              <input aria-label={`${T.step6} (${T.optional})`} value={state.note} onChange={(e) => setState((s) => ({ ...s, note: e.target.value }))} placeholder={T.notePh} maxLength={140} className="field" />
            </div>
          </Row>
        </div>
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <div className="ticket relative rounded-xl bg-white p-6 shadow-[0_30px_60px_-30px_rgba(17,20,23,.45)] ring-1 ring-ink/10 sm:p-7" aria-live="polite">
              <div className="flex items-start justify-between border-b border-dashed border-ink/25 pb-4">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-cobalt">{T.card.title}</p>
                  <p className="disp mt-1.5 text-[26px]">{BIZ.name}</p>
                </div>
                <span className="rounded border border-ink/20 px-2 py-1 text-[11.5px] font-semibold uppercase tracking-wider text-ink-soft">{T.card.draft}</span>
              </div>
              <dl className="divide-y divide-ink/10 text-[14.5px]">
                <div className="py-3"><dt className="text-[12px] font-semibold uppercase tracking-wider text-ink-soft">{T.card.jobs}</dt>
                  <dd className="mt-1.5 space-y-1 text-ink">{lines.length ? lines.map((l) => <p key={l}>{l}</p>) : <p className="text-ink-soft">{T.card.empty}</p>}</dd></div>
                {([[T.card.property, state.property >= 0 ? T.property[state.property] : ''], [T.card.area, state.area.trim()], [T.card.timing, state.timing >= 0 ? T.timing[state.timing] : ''], [T.card.note, state.note.trim()]] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2.5"><dt className="shrink-0 text-ink-soft">{k}</dt><dd className={`text-right ${v ? 'font-medium text-ink' : 'text-ink-soft'}`}>{v || T.card.none}</dd></div>
                ))}
              </dl>
              <p className="border-t border-dashed border-ink/25 pt-3 text-[12.5px] text-ink-soft">{today} · {BIZ.phone}</p>
              <a href={wa(msg)} target="_blank" rel="noopener" className="tap mt-5 flex h-[52px] items-center justify-center gap-2 rounded-full bg-cobalt px-5 text-[15.5px] font-semibold text-white transition hover:bg-ink"><WaIcon />{T.send}</a>
              <p className="mt-3 text-center text-[12.5px] leading-snug text-ink-soft">{T.sendHint}</p>
              <button type="button" onClick={() => setState(() => EMPTY)} className="tap mx-auto mt-1 block rounded-full px-4 text-[13.5px] font-semibold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink">{T.reset}</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Faq() {
  const { c } = useI18n<Content>()
  return (
    <section id="faq" className="border-t border-ink/10 bg-paper-2">
      <div className="mx-auto grid max-w-[1320px] gap-8 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:gap-10 lg:py-24">
        <div className="lg:col-span-4"><Kicker n={5}>{c.faq.kicker}</Kicker><h2 className="h2 mt-4">{c.faq.title}</h2></div>
        <div className="border-t border-ink/15 lg:col-span-8">
          {c.faq.items.map(([q, a]) => (
            <details key={q} className="group border-b border-ink/15">
              <summary className="flex min-h-[64px] cursor-pointer items-center justify-between gap-6 py-4 text-[17px] font-semibold text-ink transition hover:text-cobalt sm:text-[18.5px]">
                {q}
                <span className="faq-i grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/20 text-lg transition" aria-hidden>+</span>
              </summary>
              <p className="max-w-2xl pb-6 text-[16px] leading-relaxed text-ink-soft">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function MapCard() {
  const { c } = useI18n<Content>()
  return (
    <a href={BIZ.maps} target="_blank" rel="noopener" className="group relative block overflow-hidden rounded-xl bg-ink-2 ring-1 ring-white/10">
      <svg viewBox="0 0 480 300" className="h-auto w-full" aria-hidden>
        <rect width="480" height="300" fill="#1C2126" />
        <g stroke="#2A3138" strokeWidth="14" fill="none" strokeLinecap="round">
          <path d="M-10 220 C120 200 200 230 300 180 S440 120 500 130" /><path d="M90 -10 L150 320" /><path d="M-10 80 L500 105" /><path d="M330 -10 C320 80 360 180 340 320" />
        </g>
        <g stroke="#242B31" strokeWidth="6" fill="none"><path d="M200 105 L230 320" /><path d="M20 150 L470 168" /><path d="M260 0 L280 105" /></g>
        <path d="M-10 220 C120 200 200 230 300 180 S440 120 500 130" stroke="#2440C4" strokeWidth="3" fill="none" strokeDasharray="2 10" strokeLinecap="round" />
        <circle cx="246" cy="130" r="34" fill="#2440C4" opacity=".25" className="origin-center" />
        <circle cx="246" cy="130" r="12" fill="#FFD24A" /><circle cx="246" cy="130" r="4" fill="#111417" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-ink to-transparent p-5 pt-16 text-white">
        <div><p className="disp text-[24px]">Wangsa Maju</p><p className="text-[13.5px] text-white/75">53300 Kuala Lumpur</p></div>
        <span className="rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-ink transition group-hover:bg-volt">{c.contact.maps} ↗</span>
      </div>
    </a>
  )
}

function Contact() {
  const { c } = useI18n<Content>()
  const [day, setDay] = useState(-1)
  useEffect(() => { setDay(nowInKL().day) }, [])
  const todayRow = day === 0 ? 1 : day > 0 ? 0 : -1
  return (
    <section id="contact" className="on-dark bg-ink text-white">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:gap-10 lg:py-28">
        <div className="lg:col-span-7">
          <Kicker n={6} dark>{c.contact.kicker}</Kicker>
          <h2 className="h2 mt-4 max-w-[12ch]">{c.contact.title}</h2>
          <p className="mt-5 max-w-md text-[16.5px] leading-relaxed text-white/75">{c.contact.sub}</p>
          <a href={`tel:${BIZ.tel}`} className="mt-8 block w-fit font-display text-[clamp(2.4rem,9vw,4.2rem)] font-bold leading-none tracking-tight text-white transition hover:text-volt">{BIZ.phone}</a>
          <div className="mt-8 grid gap-3 sm:flex">
            <a href={wa(c.contact.waMsg)} target="_blank" rel="noopener" className="tap inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-cobalt px-7 text-[15.5px] font-semibold text-white transition hover:bg-white hover:text-ink"><WaIcon />{c.waCta}</a>
            <a href={`tel:${BIZ.tel}`} className="tap inline-flex h-[52px] items-center justify-center gap-2 rounded-full border border-white/25 px-7 text-[15.5px] font-semibold text-white transition hover:border-white"><PhoneIcon />{c.call}</a>
          </div>
        </div>
        <div className="space-y-8 lg:col-span-5">
          <MapCard />
          <dl className="grid gap-8 sm:grid-cols-2">
            <div><dt className="text-[12px] font-semibold uppercase tracking-[0.16em] text-cobalt-sky">{c.contact.address}</dt><dd className="mt-2 text-[15.5px] leading-relaxed text-white/85">{BIZ.address}
              <a href={BIZ.directions} target="_blank" rel="noopener" className="mt-1 flex min-h-[44px] w-fit items-center text-[14.5px] font-semibold text-white underline decoration-white/35 underline-offset-4 hover:decoration-volt">{c.contact.directions} ↗</a></dd></div>
            <div><dt className="text-[12px] font-semibold uppercase tracking-[0.16em] text-cobalt-sky">{c.contact.hours}</dt>
              <dd className="mt-2 space-y-1 text-[15.5px]">
                {c.contact.days.map(([d, h], i) => (
                  <p key={d} className={`-mx-2 flex flex-wrap justify-between gap-x-4 rounded-md px-2 py-1 ${todayRow === i ? 'bg-white/10 font-semibold text-white' : 'text-white/80'}`}><span className="whitespace-nowrap">{d}{todayRow === i && <span className="ml-2 text-[11px] font-bold uppercase tracking-wider text-volt">{c.contact.today}</span>}</span><span className="whitespace-nowrap">{h}</span></p>
                ))}
              </dd></div>
          </dl>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const { c } = useI18n<Content>()
  return (
    <footer className="on-dark border-t border-white/10 bg-ink text-white">
      <div className="mx-auto max-w-[1320px] px-5 pb-28 pt-12 sm:px-8 lg:pb-12">
        <div className="flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
          <div><Logo dark /><p className="mt-4 text-[14px] text-white/70">{c.footer.tagline}</p></div>
          <a href="#top" className="tap inline-flex items-center gap-2 self-start rounded-full border border-white/20 px-5 text-sm font-semibold transition hover:border-volt hover:text-volt sm:self-auto">{c.footer.toTop}<Arrow dir="up" /></a>
        </div>
        <p className="mt-10 text-[13px] text-white/65">{c.footer.photos}</p>
        <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 text-[13.5px] text-white/75 sm:flex-row sm:items-center sm:justify-between">
          <p>{c.footer.pitch}</p>
          <a href={PITCH_WA} target="_blank" rel="noopener" className="tap inline-flex shrink-0 items-center gap-2 font-semibold text-volt hover:text-white"><WaIcon className="h-4 w-4" />{c.footer.pitchLink}</a>
        </div>
        <p className="mt-3 text-[12.5px] text-white/60">© {new Date().getFullYear()} {BIZ.name}. {c.footer.rights}</p>
      </div>
    </footer>
  )
}

/** Mobile bottom contact bar (replaces the FAB). */
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
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-paper/95 px-3 pb-[max(.6rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur transition duration-300 lg:hidden ${show ? '' : 'pointer-events-none translate-y-full opacity-0'}`}>
      <div className="mx-auto grid max-w-md grid-cols-[1fr_auto] gap-2">
        <a href={wa(c.contact.waMsg)} target="_blank" rel="noopener" tabIndex={show ? 0 : -1} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-cobalt text-[15.5px] font-semibold text-white"><WaIcon />{c.waCta}</a>
        <a href={`tel:${BIZ.tel}`} tabIndex={show ? 0 : -1} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-5 text-[15.5px] font-semibold text-white"><PhoneIcon className="h-[18px] w-[18px]" />{c.call}</a>
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
  const [ticket, setTicket] = useState<TicketState>(EMPTY)
  const toggle = useCallback((t: TradeId) => setTicket((s) => ({ ...s, trades: s.trades.includes(t) ? s.trades.filter((x) => x !== t) : [...s.trades, t] })), [])
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">{c.a11y.skip}</a>
      <Header onMenu={() => setOpen((o) => !o)} menuOpen={open} btnRef={btnRef} />
      {open && <MobileMenu close={closeMenu} />}
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Trades chosen={ticket.trades} toggle={toggle} />
        <How />
        <Reviews />
        <Ticket state={ticket} setState={setTicket} />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <MobileBar />
    </>
  )
}
