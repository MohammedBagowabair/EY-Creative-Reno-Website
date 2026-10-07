import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { asset, useI18n } from './i18n'
import { useActiveSection, useDialogFlag, useMenu } from './hooks'
import { useOpenStatus, nowInKL, type Week } from './hours'
import { Reveal } from './Reveal'
import { BIZ, type Content, type TradeId } from './content'

const PITCH_WA = 'https://wa.me/601151198497'
const wa = (t: string) => `https://wa.me/${BIZ.wa}?text=${encodeURIComponent(t)}`
const WEEK: Week = [null, [540, 1080], [540, 1080], [540, 1080], [540, 1080], [540, 1080], [540, 1080]]
const TRADES: TradeId[] = ['reno', 'electrical', 'aircon', 'interior']
/** Keep hyphenated words (air-cond) from splitting across lines. */
const nb = (t: string) => t.split(/(\S+-\S+)/).map((p, i) => (/\S+-\S+/.test(p) ? <span key={i} className="whitespace-nowrap">{p}</span> : p))

function WaIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 2.4.9 2.9.8 3.4.7.5-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
    </svg>
  )
}

function Stars({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className={className} fill="currentColor"><path d="M10 1.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.6 7.7l5.8-.8z" /></svg>
      ))}
    </span>
  )
}

function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <p className={`eyebrow ${dark ? 'text-mint' : 'text-copper-ink'}`}>
      <span className={`h-[7px] w-[7px] rounded-[2px] ${dark ? 'bg-mint' : 'bg-copper'}`} aria-hidden />
      {children}
    </p>
  )
}

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className={`grid h-9 w-9 place-items-center rounded-[9px] font-display text-[15px] font-bold tracking-tight ${dark ? 'bg-mint text-ink' : 'bg-ink text-mint'}`}>EY</span>
      <span className={`font-display text-[13.5px] font-semibold leading-[1.1] ${dark ? 'text-plaster' : 'text-ink'}`}>Creative Reno<br />&amp; Designs</span>
    </span>
  )
}

function StatusPill({ className = '' }: { className?: string }) {
  const { c } = useI18n<Content>()
  const s = useOpenStatus(WEEK)
  if (!s) return <span className={`inline-block h-8 w-36 ${className}`} aria-hidden />
  const txt = s.open
    ? `${c.status.open} · ${c.status.closes}`
    : `${c.status.closed} · ${s.nextOpenDay === s.day ? c.status.opensToday : s.nextOpenDay === (s.day + 1) % 7 ? c.status.opensTomorrow : c.status.opensMon}`
  return (
    <span className={`inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-full border border-ink/15 bg-plaster px-3 text-[12.5px] font-medium text-ink ${className}`}>
      <span className={`relative h-2 w-2 rounded-full ${s.open ? 'bg-[#1F8A5B]' : 'bg-copper'}`} aria-hidden>
        {s.open && <span className="absolute inset-0 animate-ping rounded-full bg-[#1F8A5B] opacity-60" />}
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
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 sm:px-8">
        <a href="#top" className="tap flex items-center rounded-lg"><Logo /></a>
        <nav aria-label={c.a11y.main} className="hidden items-center gap-6 lg:flex">
          {c.nav.map(([id, l]) => (
            <a key={id} href={`#${id}`} aria-current={active === id ? 'true' : undefined} className={`nav-link py-2 text-[14px] font-medium transition hover:text-copper-ink ${active === id ? 'text-copper-ink' : 'text-ink/80'}`}>{l}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <StatusPill className="hidden xl:inline-flex" />
          <button data-lang-toggle onClick={() => setLang(lang === 'en' ? 'ms' : 'en')} aria-label={c.langAria} className="tap rounded-full border border-ink/15 px-3 text-xs font-bold tracking-wider text-ink transition hover:border-ink hover:bg-ink hover:text-plaster">{c.langLabel}</button>
          <a href={wa(c.contact.waMsg)} target="_blank" rel="noopener" className="tap hidden items-center gap-2 rounded-full bg-copper-ink px-4 text-sm font-semibold text-white transition hover:bg-ink sm:inline-flex"><WaIcon className="h-4 w-4" />{c.waCta}</a>
          <button ref={btnRef} onClick={onMenu} aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? c.a11y.menuClose : c.a11y.menuOpen} className="tap grid place-items-center rounded-full border border-ink/15 lg:hidden">
            <span className="relative block h-3 w-5" aria-hidden>
              <span className={`absolute left-0 h-[2px] w-5 bg-ink transition ${menuOpen ? 'top-[5px] rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 top-[5px] h-[2px] w-5 bg-ink transition ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`absolute left-0 h-[2px] w-5 bg-ink transition ${menuOpen ? 'top-[5px] -rotate-45' : 'top-[10px]'}`} />
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
    <div id="mobile-menu" role="dialog" aria-modal="true" aria-label={c.a11y.mobile} className="fixed inset-x-0 bottom-0 top-16 z-30 overflow-y-auto bg-plaster px-5 pb-10 pt-4 lg:hidden">
      <nav aria-label={c.a11y.mobile}>
        {c.nav.map(([id, l], i) => (
          <a key={id} href={`#${id}`} onClick={close} className="flex min-h-[64px] items-center justify-between border-b border-ink/10 font-display text-[26px] font-semibold text-ink active:text-copper-ink">
            {l}<span className="font-sans text-xs font-semibold text-ink/60">0{i + 1}</span>
          </a>
        ))}
      </nav>
      <div className="mt-8 flex flex-col gap-3">
        <StatusPill className="self-start" />
        <a href={wa(c.contact.waMsg)} target="_blank" rel="noopener" className="tap inline-flex items-center justify-center gap-2 rounded-full bg-copper-ink px-5 font-semibold text-white"><WaIcon />{c.waCta}</a>
        <a href={`tel:${BIZ.tel}`} className="tap inline-flex items-center justify-center rounded-full border border-ink/20 px-5 font-semibold text-ink">{c.contact.call} {BIZ.phone}</a>
      </div>
    </div>
  )
}

/** Hero distribution board: EY main switch feeding four trade breakers. */
function Board({ onPick }: { onPick: (t: TradeId) => void }) {
  const { c } = useI18n<Content>()
  const codes: Record<TradeId, string> = { reno: 'RN', electrical: 'EL', aircon: 'AC', interior: 'ID' }
  return (
    <div className="rounded-[22px] bg-ink p-4 text-plaster shadow-[0_24px_60px_-20px_rgba(29,31,30,.55)] sm:p-5">
      <div className="flex items-center justify-between border-b border-plaster/10 pb-3">
        <span className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-mint">EY · Main</span>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-plaster/70"><span className="h-1.5 w-1.5 rounded-full bg-mint" aria-hidden />ON</span>
      </div>
      <div className="relative mt-3 grid grid-cols-4 gap-2">
        <span className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-0 h-px bg-copper-glow/70" aria-hidden />
        {TRADES.map((t) => (
          <button key={t} type="button" onClick={() => onPick(t)} className="group relative flex flex-col items-center gap-2 rounded-xl px-1 pb-2 pt-3 transition hover:bg-plaster/5">
            <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-copper-glow/70" aria-hidden />
            <span className="relative mt-1 flex h-14 w-9 flex-col items-center justify-start rounded-md border border-plaster/15 bg-ink-2 p-1" aria-hidden>
              <span className="h-6 w-full rounded-[4px] bg-mint transition group-hover:bg-copper-glow" />
              <span className="mt-auto font-display text-[9px] font-bold text-plaster/70">{codes[t]}</span>
            </span>
            <span className="text-center text-[11.5px] font-semibold leading-tight text-plaster/90">{c.hero.nodes[t]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Hero({ pick }: { pick: (t: TradeId) => void }) {
  const { c, lang } = useI18n<Content>()
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-bg" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-14 pt-8 sm:px-8 sm:pt-12 lg:grid-cols-12 lg:gap-12 lg:pb-24 lg:pt-16">
        <div className="lg:col-span-7">
          <Eyebrow>{c.hero.eyebrow}</Eyebrow>
          <h1 className={`mt-5 font-display font-bold leading-[1.02] tracking-[-0.035em] text-ink ${lang === 'ms' ? 'text-[clamp(2.15rem,6.6vw,4.3rem)]' : 'text-[clamp(2.3rem,7.2vw,4.7rem)]'}`}>
            {nb(c.hero.h1a)} <span className="text-copper">{nb(c.hero.h1b)}</span> {nb(c.hero.h1c)}
          </h1>
          <p className="mt-6 max-w-xl text-[16.5px] leading-relaxed text-ink-soft sm:text-[17.5px]">{c.hero.sub}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#ticket" className="tap inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 text-[15px] font-semibold text-plaster transition hover:bg-copper-ink">{c.hero.cta}<span aria-hidden>→</span></a>
            <a href={wa(c.contact.waMsg)} target="_blank" rel="noopener" className="tap inline-flex items-center justify-center gap-2 rounded-full border border-ink/20 px-6 text-[15px] font-semibold text-ink transition hover:border-ink"><WaIcon className="h-[18px] w-[18px]" />{c.hero.cta2}</a>
          </div>
          <a href={BIZ.maps} target="_blank" rel="noopener" className="mt-7 inline-flex items-center gap-2.5 rounded-lg text-sm text-ink">
            <span className="font-display text-lg font-bold">{BIZ.rating}</span>
            <span className="text-copper"><Stars /></span>
            <span className="text-ink-soft">{c.hero.rating} · {BIZ.reviews} {c.hero.reviewsWord}</span>
          </a>
        </div>
        <div className="relative lg:col-span-5 lg:pt-6">
          <figure className="relative overflow-hidden rounded-[22px] bg-plaster-2">
            <img src={asset('images/hero-640.webp')} srcSet={`${asset('images/hero-640.webp')} 640w, ${asset('images/hero-1000.webp')} 1000w`} sizes="(min-width:1024px) 40vw, 100vw" width={1000} height={563} alt={c.trades.alt.interior} fetchPriority="high" decoding="async" className="aspect-[4/3] w-full object-cover sm:aspect-[16/10] lg:aspect-[5/4]" />
            <figcaption className="absolute left-3 top-3 rounded-full bg-plaster/90 px-2.5 py-1 text-[11px] font-semibold text-ink">{c.hero.photo}</figcaption>
          </figure>
          <div className="relative z-10 -mt-10 px-3 sm:-mt-14 sm:px-6 lg:-ml-10 lg:mr-6 lg:px-0">
            <Board onPick={pick} />
          </div>
        </div>
      </div>
    </section>
  )
}

function Strip() {
  const { c } = useI18n<Content>()
  return (
    <div className="border-y border-ink/10 bg-plaster-2">
      <ul className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-5 py-4 text-[13px] font-semibold text-ink sm:justify-between sm:px-8">
        {c.strip.map((s, i) => <li key={s} className="flex items-center gap-2">{i < 4 && <span className="h-1.5 w-1.5 rounded-full bg-copper" aria-hidden />}{s}</li>)}
      </ul>
    </div>
  )
}

function Trades({ pick }: { pick: (t: TradeId) => void }) {
  const { c } = useI18n<Content>()
  const img: Record<TradeId, [string, number, number]> = { aircon: ['aircon', 800, 564], electrical: ['electrical', 800, 600], reno: ['reno', 800, 800], interior: ['interior', 800, 450] }
  return (
    <section id="trades" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div><Eyebrow>{c.trades.eyebrow}</Eyebrow><h2 className="h2 mt-4 max-w-2xl">{c.trades.title}</h2></div>
        <p className="max-w-sm text-[15px] leading-relaxed text-ink-soft">{c.trades.note}</p>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {c.trades.items.map((t, i) => {
          const [n, w, h] = img[t.id]
          return (
            <Reveal key={t.id} delay={i * 80} className="h-full">
              <article id={`trade-${t.id}`} className="flex h-full flex-col overflow-hidden rounded-[20px] border border-ink/10 bg-white/60">
                <div className="relative">
                  <img src={asset(`images/${n}-480.webp`)} srcSet={`${asset(`images/${n}-480.webp`)} 480w, ${asset(`images/${n}-800.webp`)} 800w`} sizes="(min-width:1280px) 22vw, (min-width:640px) 45vw, 92vw" width={w} height={h} loading="lazy" decoding="async" alt={c.trades.alt[t.id]} className="aspect-[4/3] w-full object-cover" />
                  <span className="absolute left-3 top-3 rounded-md bg-ink px-2 py-1 font-display text-[11px] font-bold tracking-wider text-mint">{t.code}</span>
                  <span className="absolute bottom-2 right-2 rounded-full bg-plaster/90 px-2 py-0.5 text-[10.5px] font-semibold text-ink">{c.hero.photo}</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-[21px] font-semibold tracking-tight text-ink">{t.name}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">{t.line}</p>
                  <ul className="mt-4 space-y-2 text-[14px] text-ink">
                    {t.jobs.map((j) => <li key={j} className="flex gap-2.5"><span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-copper" aria-hidden />{j}</li>)}
                  </ul>
                  <div className="mt-auto pt-6">
                    <button type="button" onClick={() => pick(t.id)} className="tap flex w-full items-center justify-between gap-2 rounded-full border border-ink/15 px-4 text-[14px] font-semibold text-ink transition hover:border-ink hover:bg-ink hover:text-plaster">
                      <span>+ {t.name}</span><span aria-hidden>→</span>
                    </button>
                  </div>
                </div>
              </article>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

function OneTeam() {
  const { c } = useI18n<Content>()
  return (
    <section className="bg-ink text-plaster" aria-labelledby="oneteam-h">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-5">
          <Eyebrow dark>{c.oneteam.eyebrow}</Eyebrow>
          <h2 id="oneteam-h" className="h2 mt-4 text-plaster">{c.oneteam.title}</h2>
          <figure className="mt-10">
            <img src={asset('images/site-640.webp')} srcSet={`${asset('images/site-640.webp')} 640w, ${asset('images/site-1100.webp')} 1100w`} sizes="(min-width:1024px) 36vw, 92vw" width={1100} height={733} loading="lazy" decoding="async" alt={c.oneteam.alt} className="aspect-[3/2] w-full rounded-[18px] object-cover" />
            <figcaption className="mt-3 text-[12.5px] text-plaster/70">{c.oneteam.photo}</figcaption>
          </figure>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7 lg:self-center">
          <div className="rounded-[20px] border border-plaster/15 p-6">
            <h3 className="font-display text-lg font-semibold text-plaster/80">{c.oneteam.usualTitle}</h3>
            <ul className="mt-5 space-y-4">
              {c.oneteam.usual.map((u, i) => (
                <li key={u} className="flex gap-3 text-[15px] leading-snug text-plaster/75">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-plaster/25 font-display text-[11px] font-bold" aria-hidden>{i + 1}</span>{u}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[20px] bg-mint p-6 text-ink">
            <h3 className="font-display text-lg font-semibold">{c.oneteam.eyTitle}</h3>
            <ul className="mt-5 space-y-4">
              {c.oneteam.ey.map((u) => (
                <li key={u} className="flex gap-3 text-[15px] font-medium leading-snug">
                  <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0" aria-hidden><circle cx="10" cy="10" r="9" fill="#1D1F1E" /><path d="M6 10.3l2.6 2.6L14 7.5" stroke="#A9DCCD" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>{u}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

type TicketState = { trades: TradeId[]; jobs: Record<string, string[]>; property: number; area: string; timing: number; note: string }

function Ticket({ state, setState }: { state: TicketState; setState: (f: (s: TicketState) => TicketState) => void }) {
  const { c, lang } = useI18n<Content>()
  const T = c.ticket
  const byId = Object.fromEntries(c.trades.items.map((t) => [t.id, t])) as Record<TradeId, Content['trades']['items'][number]>
  const toggleTrade = (t: TradeId) => setState((s) => ({ ...s, trades: s.trades.includes(t) ? s.trades.filter((x) => x !== t) : [...s.trades, t] }))
  const toggleJob = (t: TradeId, j: number) => setState((s) => {
    const cur = s.jobs[t] || []; const k = String(j)
    return { ...s, jobs: { ...s.jobs, [t]: cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k] } }
  })
  const lines = state.trades.map((t) => {
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
  const chip = (on: boolean) => `tap inline-flex items-center gap-2 rounded-full border px-4 text-[14px] font-medium transition ${on ? 'border-ink bg-ink text-plaster' : 'border-ink/20 bg-white/60 text-ink hover:border-ink'}`
  return (
    <section id="ticket" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
      <div className="max-w-2xl"><Eyebrow>{T.eyebrow}</Eyebrow><h2 className="h2 mt-4">{T.title}</h2><p className="mt-4 text-[16px] leading-relaxed text-ink-soft">{T.sub}</p></div>
      <div className="mt-12 grid gap-10 lg:grid-cols-12">
        <div className="space-y-9 lg:col-span-7">
          <fieldset>
            <legend className="step">{T.step1}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {c.trades.items.map((t) => {
                const on = state.trades.includes(t.id)
                return <button key={t.id} type="button" aria-pressed={on} onClick={() => toggleTrade(t.id)} className={chip(on)}><span className={`font-display text-[11px] font-bold ${on ? 'text-mint' : 'text-copper-ink'}`}>{t.code}</span>{t.name}</button>
              })}
            </div>
          </fieldset>
          <fieldset>
            <legend className="step">{T.step2}</legend>
            {state.trades.length === 0 ? <p className="mt-3 rounded-xl border border-dashed border-ink/20 px-4 py-3 text-[14px] text-ink-soft">{T.pickTrade}</p> : (
              <div className="mt-3 space-y-4">
                {state.trades.map((t) => (
                  <div key={t}>
                    <p className="text-[13px] font-semibold text-ink-soft">{byId[t].name}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {byId[t].jobs.map((j, k) => { const on = (state.jobs[t] || []).includes(String(k)); return <button key={j} type="button" aria-pressed={on} onClick={() => toggleJob(t, k)} className={chip(on)}>{j}</button> })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </fieldset>
          <div className="grid gap-9 sm:grid-cols-2">
            <fieldset>
              <legend className="step">{T.step3}</legend>
              <div className="mt-3 flex flex-col gap-2">
                {T.property.map((p, i) => (
                  <label key={p} className={`radio ${chip(state.property === i)} justify-start`}>
                    <input type="radio" name="property" className="sr-only" checked={state.property === i} onChange={() => setState((s) => ({ ...s, property: i }))} />{p}
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="step">{T.step5}</legend>
              <div className="mt-3 flex flex-col gap-2">
                {T.timing.map((p, i) => (
                  <label key={p} className={`radio ${chip(state.timing === i)} justify-start`}>
                    <input type="radio" name="timing" className="sr-only" checked={state.timing === i} onChange={() => setState((s) => ({ ...s, timing: i }))} />{p}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="step">{T.step4}</span>
              <input value={state.area} onChange={(e) => setState((s) => ({ ...s, area: e.target.value }))} placeholder={T.areaPh} maxLength={60} className="field mt-3" />
            </label>
            <label className="block">
              <span className="step">{T.step6}</span>
              <input value={state.note} onChange={(e) => setState((s) => ({ ...s, note: e.target.value }))} placeholder={T.notePh} maxLength={140} className="field mt-3" />
            </label>
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <div className="ticket relative rounded-[18px] bg-white p-6 shadow-[0_24px_60px_-28px_rgba(29,31,30,.45)]" aria-live="polite">
              <div className="flex items-start justify-between border-b border-dashed border-ink/20 pb-4">
                <div>
                  <p className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-copper-ink">{T.card.title}</p>
                  <p className="mt-1 font-display text-xl font-semibold text-ink">{BIZ.name}</p>
                </div>
                <span className="rounded-md border border-ink/20 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-soft">{T.card.draft}</span>
              </div>
              <dl className="divide-y divide-ink/10 text-[14px]">
                <div className="py-3"><dt className="text-[12px] font-semibold uppercase tracking-wider text-ink-soft">{T.card.jobs}</dt>
                  <dd className="mt-1.5 space-y-1 text-ink">{lines.length ? lines.map((l) => <p key={l}>{l}</p>) : <p className="text-ink-soft">{T.card.empty}</p>}</dd></div>
                {([[T.card.property, state.property >= 0 ? T.property[state.property] : ''], [T.card.area, state.area.trim()], [T.card.timing, state.timing >= 0 ? T.timing[state.timing] : ''], [T.card.note, state.note.trim()]] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-3"><dt className="shrink-0 text-ink-soft">{k}</dt><dd className={`text-right ${v ? 'font-medium text-ink' : 'text-ink-soft'}`}>{v || T.card.none}</dd></div>
                ))}
              </dl>
              <p className="border-t border-dashed border-ink/20 pt-3 text-[12px] text-ink-soft">{today} · {BIZ.phone}</p>
              <a href={wa(msg)} target="_blank" rel="noopener" className="tap mt-5 flex items-center justify-center gap-2 rounded-full bg-copper-ink px-5 text-[15px] font-semibold text-white transition hover:bg-ink"><WaIcon />{T.send}</a>
              <p className="mt-3 text-center text-[12px] leading-snug text-ink-soft">{T.sendHint}</p>
              <button type="button" onClick={() => setState(() => ({ trades: [], jobs: {}, property: -1, area: '', timing: -1, note: '' }))} className="tap mx-auto mt-1 block rounded-full px-4 text-[13px] font-semibold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink">{T.reset}</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Reviews() {
  const { c, lang } = useI18n<Content>()
  const fmt = (d: string) => new Intl.DateTimeFormat(lang === 'ms' ? 'ms-MY' : 'en-GB', { month: 'short', year: 'numeric' }).format(new Date(d + 'T12:00:00'))
  return (
    <section id="reviews" className="border-t border-ink/10 bg-plaster-2">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div><Eyebrow>{c.reviews.eyebrow}</Eyebrow><h2 className="h2 mt-4">{c.reviews.title}</h2><p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-ink-soft">{c.reviews.sub}</p></div>
          <a href={BIZ.maps} target="_blank" rel="noopener" className="tap inline-flex items-center gap-2 self-start rounded-full border border-ink/20 px-5 text-sm font-semibold text-ink transition hover:border-ink lg:self-auto">{c.reviews.all}<span aria-hidden>↗</span></a>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col justify-between rounded-[20px] bg-ink p-7 text-plaster">
            <p className="font-display text-[72px] font-bold leading-none tracking-tight">{BIZ.rating}</p>
            <div>
              <span className="text-copper-glow"><Stars className="h-5 w-5" /></span>
              <p className="mt-2 text-[15px] text-plaster/80">{BIZ.reviews} Google {c.hero.reviewsWord}</p>
            </div>
          </div>
          {c.reviews.items.map((r, i) => (
            <Reveal key={r.date} delay={(i % 3) * 70} className="h-full">
              <figure className="flex h-full flex-col rounded-[20px] border border-ink/10 bg-plaster p-7">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-copper"><Stars /></span>
                  <span className="rounded-full bg-mint-soft px-2.5 py-1 text-[11.5px] font-semibold text-ink">{r.tag}</span>
                </div>
                <blockquote className="mt-4 flex-1 text-[15.5px] leading-relaxed text-ink" lang="en">“{r.text}”</blockquote>
                <figcaption className="mt-5 text-[12.5px] text-ink-soft">Google · {fmt(r.date)}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        {c.reviews.origNote && <p className="mt-5 text-[12.5px] text-ink-soft">{c.reviews.origNote}</p>}
      </div>
    </section>
  )
}

function Process() {
  const { c } = useI18n<Content>()
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28" aria-labelledby="process-h">
      <Eyebrow>{c.process.eyebrow}</Eyebrow>
      <h2 id="process-h" className="h2 mt-4 max-w-2xl">{c.process.title}</h2>
      <ol className="relative mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <span className="absolute left-0 right-0 top-[22px] hidden h-[2px] bg-gradient-to-r from-copper via-copper/60 to-mint lg:block" aria-hidden />
        {c.process.steps.map(([t, d], i) => (
          <li key={t} className="relative">
            <span className="relative grid h-11 w-11 place-items-center rounded-full border-2 border-copper bg-plaster font-display text-[15px] font-bold text-ink">{i + 1}</span>
            <h3 className="mt-5 font-display text-xl font-semibold text-ink">{t}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{d}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Faq() {
  const { c } = useI18n<Content>()
  return (
    <section id="faq" className="border-t border-ink/10">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-4"><Eyebrow>{c.faq.eyebrow}</Eyebrow><h2 className="h2 mt-4">{c.faq.title}</h2></div>
        <div className="divide-y divide-ink/10 border-y border-ink/10 lg:col-span-8">
          {c.faq.items.map(([q, a]) => (
            <details key={q} className="group">
              <summary className="flex min-h-[64px] cursor-pointer items-center justify-between gap-6 py-4 font-display text-[17px] font-semibold text-ink sm:text-[18.5px]">
                {q}
                <span className="faq-i grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/20 text-lg transition" aria-hidden>+</span>
              </summary>
              <p className="max-w-2xl pb-6 text-[15.5px] leading-relaxed text-ink-soft">{a}</p>
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
    <a href={BIZ.maps} target="_blank" rel="noopener" className="group relative block overflow-hidden rounded-[22px] bg-ink-2">
      <svg viewBox="0 0 480 340" className="h-auto w-full" aria-hidden>
        <rect width="480" height="340" fill="#2A2D2B" />
        <g stroke="#3B3F3C" strokeWidth="14" fill="none" strokeLinecap="round">
          <path d="M-10 250 C120 230 200 260 300 210 S440 150 500 160" />
          <path d="M90 -10 L150 360" />
          <path d="M-10 90 L500 120" />
          <path d="M330 -10 C320 90 360 200 340 360" />
        </g>
        <g stroke="#343835" strokeWidth="6" fill="none"><path d="M200 120 L230 340" /><path d="M20 170 L470 190" /><path d="M260 0 L280 120" /></g>
        <path d="M-10 250 C120 230 200 260 300 210 S440 150 500 160" stroke="#B4532A" strokeWidth="3" fill="none" strokeDasharray="2 10" strokeLinecap="round" />
        <circle cx="246" cy="148" r="30" fill="#A9DCCD" opacity=".18" />
        <circle cx="246" cy="148" r="11" fill="#A9DCCD" />
        <circle cx="246" cy="148" r="4" fill="#1D1F1E" />
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-ink/95 to-transparent p-5 pt-16 text-plaster">
        <div><p className="font-display text-lg font-semibold">Wangsa Maju</p><p className="text-[13px] text-plaster/75">53300 Kuala Lumpur</p></div>
        <span className="rounded-full bg-mint px-3 py-1.5 text-[13px] font-semibold text-ink transition group-hover:bg-plaster">{c.contact.maps} ↗</span>
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
    <section id="contact" className="border-t border-ink/10 bg-plaster-2">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">
        <div>
          <Eyebrow>{c.contact.eyebrow}</Eyebrow>
          <h2 className="h2 mt-4">{c.contact.title}</h2>
          <p className="mt-4 max-w-md text-[16px] leading-relaxed text-ink-soft">{c.contact.sub}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={wa(c.contact.waMsg)} target="_blank" rel="noopener" className="tap inline-flex items-center justify-center gap-2 rounded-full bg-copper-ink px-6 text-[15px] font-semibold text-white transition hover:bg-ink"><WaIcon />{c.contact.whatsapp}</a>
            <a href={`tel:${BIZ.tel}`} className="tap inline-flex items-center justify-center gap-2 rounded-full border border-ink/20 px-6 text-[15px] font-semibold text-ink transition hover:border-ink">{c.contact.call} {BIZ.phone}</a>
          </div>
          <dl className="mt-10 grid gap-6 sm:grid-cols-2">
            <div><dt className="text-[12px] font-semibold uppercase tracking-wider text-ink-soft">{c.contact.address}</dt><dd className="mt-2 text-[15px] leading-relaxed text-ink">{BIZ.address}
                <a href={BIZ.directions} target="_blank" rel="noopener" className="mt-2 flex min-h-[44px] w-fit items-center text-[14px] font-semibold text-copper-ink underline decoration-copper/40 underline-offset-4 hover:decoration-copper-ink">{c.contact.directions} ↗</a></dd></div>
            <div><dt className="text-[12px] font-semibold uppercase tracking-wider text-ink-soft">{c.contact.hours}</dt>
              <dd className="mt-2 space-y-1.5 text-[15px] text-ink">
                {c.contact.days.map(([d, h], i) => (
                  <p key={d} className={`flex flex-wrap justify-between gap-x-4 rounded-lg px-2 py-1 ${todayRow === i ? 'bg-mint-soft font-semibold' : ''}`}><span className="whitespace-nowrap">{d}{todayRow === i && <span className="ml-2 text-[11px] font-bold uppercase tracking-wider text-copper-ink">{c.contact.today}</span>}</span><span className="whitespace-nowrap">{h}</span></p>
                ))}
              </dd></div>
          </dl>
        </div>
        <MapCard />
      </div>
    </section>
  )
}

function Footer() {
  const { c } = useI18n<Content>()
  return (
    <footer className="bg-ink text-plaster">
      <div className="mx-auto max-w-7xl px-5 pb-28 pt-16 sm:px-8 sm:pb-12">
        <div className="flex flex-col justify-between gap-10 lg:flex-row">
          <div className="max-w-sm">
            <Logo dark />
            <p className="mt-5 text-[14px] text-plaster/75">{c.footer.tagline}</p>
          </div>
          <ul className="grid gap-x-10 gap-y-3 text-[14.5px] sm:grid-cols-2">
            <li><a href={`tel:${BIZ.tel}`} className="inline-flex min-h-[44px] items-center hover:text-mint">{BIZ.phone}</a></li>
            <li><a href={wa(c.contact.waMsg)} target="_blank" rel="noopener" className="inline-flex min-h-[44px] items-center gap-2 hover:text-mint"><WaIcon className="h-4 w-4" />WhatsApp</a></li>
            <li className="sm:col-span-2"><a href={BIZ.maps} target="_blank" rel="noopener" className="inline-flex min-h-[44px] items-center hover:text-mint">{BIZ.address} ↗</a></li>
            <li className="text-plaster/75 sm:col-span-2">{c.contact.days.map(([d, h]) => `${d} ${h}`).join(' · ')}</li>
          </ul>
          <a href="#top" className="tap inline-flex items-center gap-2 self-start rounded-full border border-plaster/20 px-5 text-sm font-semibold transition hover:border-mint hover:text-mint">{c.footer.toTop} <span aria-hidden>↑</span></a>
        </div>
        <p className="mt-12 text-[12.5px] text-plaster/70">{c.footer.photos}</p>
        <div className="mt-6 flex flex-col gap-3 border-t border-plaster/10 pt-6 text-[13px] text-plaster/75 sm:flex-row sm:items-center sm:justify-between">
          <p>{c.footer.pitch}</p>
          <a href={PITCH_WA} target="_blank" rel="noopener" className="tap inline-flex shrink-0 items-center gap-2 font-semibold text-mint hover:text-plaster"><WaIcon className="h-4 w-4" />{c.footer.pitchLink}</a>
        </div>
        <p className="mt-4 text-[12px] text-plaster/60">© {new Date().getFullYear()} {BIZ.name}. {c.footer.rights}</p>
      </div>
    </footer>
  )
}

function Fab() {
  const { c } = useI18n<Content>()
  const [show, setShow] = useState(false)
  useEffect(() => {
    const on = () => setShow(window.scrollY > window.innerHeight * 0.9)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <a href={wa(c.contact.waMsg)} target="_blank" rel="noopener" aria-label={c.a11y.fab} aria-hidden={!show} tabIndex={show ? 0 : -1} data-fab
      className={`fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-copper-ink text-white shadow-[0_12px_30px_rgba(29,31,30,.35)] transition duration-300 sm:hidden ${show ? 'opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}>
      <WaIcon className="h-6 w-6" />
    </a>
  )
}

export default function App() {
  const { c } = useI18n<Content>()
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const closeMenu = useCallback(() => setOpen(false), [])
  useMenu(open, closeMenu, btnRef)
  const [ticket, setTicket] = useState<TicketState>({ trades: [], jobs: {}, property: -1, area: '', timing: -1, note: '' })
  const pick = useCallback((t: TradeId) => {
    setTicket((s) => (s.trades.includes(t) ? s : { ...s, trades: [...s.trades, t] }))
    document.getElementById('ticket')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }, [])
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-plaster">{c.a11y.skip}</a>
      <Header onMenu={() => setOpen((o) => !o)} menuOpen={open} btnRef={btnRef} />
      {open && <MobileMenu close={closeMenu} />}
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero pick={pick} />
        <Strip />
        <Trades pick={pick} />
        <OneTeam />
        <Ticket state={ticket} setState={setTicket} />
        <Reviews />
        <Process />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <Fab />
    </>
  )
}
