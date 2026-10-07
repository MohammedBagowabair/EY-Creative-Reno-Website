import { useEffect, useState } from 'react'

/** Weekly schedule: index 0 = Sunday … 6 = Saturday. [openMin, closeMin] in minutes from midnight;
 *  closeMin may exceed 1440 for hours that run past midnight (e.g. 11 AM–2 AM = [660, 1560]). null = closed. */
export type Week = ([number, number] | null)[]

export type Status = { open: boolean; day: number; mins: number; nextOpenDay: number | null }

const TZ = 'Asia/Kuala_Lumpur'
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function nowInKL(d = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(d)
  const get = (t: string) => parts.find((p) => p.type === t)?.value || '0'
  return { day: DAYS.indexOf(get('weekday')), mins: Number(get('hour')) * 60 + Number(get('minute')) }
}

export function statusAt(week: Week, day: number, mins: number): Status {
  const today = week[day]
  const prev = week[(day + 6) % 7]
  // spill-over from yesterday's late session
  if (prev && prev[1] > 1440 && mins < prev[1] - 1440) return { open: true, day, mins, nextOpenDay: null }
  if (today && mins >= today[0] && mins < today[1]) return { open: true, day, mins, nextOpenDay: null }
  if (today && mins < today[0]) return { open: false, day, mins, nextOpenDay: day }
  for (let k = 1; k <= 7; k++) { const d = (day + k) % 7; if (week[d]) return { open: false, day, mins, nextOpenDay: d } }
  return { open: false, day, mins, nextOpenDay: null }
}

/** Live open/closed status in Kuala Lumpur time; re-checks every minute. null until mounted. */
export function useOpenStatus(week: Week) {
  const [s, setS] = useState<Status | null>(null)
  useEffect(() => {
    const tick = () => { const n = nowInKL(); setS(statusAt(week, n.day, n.mins)) }
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [week])
  return s
}
