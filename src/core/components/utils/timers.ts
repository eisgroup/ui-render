import { useEffect, useRef } from 'react'

/** The timers `useTimers` hands out: the same object on every render. */
export type Timers = {
  /** Schedules `callback(...args)` after `delay` ms, and returns the timer's id */
  setTimeout <Args extends unknown[]> (callback: (...args: Args) => void, delay?: number, ...args: Args): ReturnType<typeof setTimeout>
  /** Cancels every timer still pending */
  clear (): void
}

/**
 * TIMERS A FUNCTION COMPONENT OWNS, all cleared when it unmounts: what `@withTimer` gave a class,
 * until §9.3 step 6 converted the last of them and deleted it. It is for timers started outside an
 * effect, from an event handler for instance; a timer an effect starts belongs in that effect's
 * cleanup instead.
 *
 * The object it returns is the same on every render, so it is safe to use from any callback.
 *
 * @returns {{setTimeout: Function, clear: Function}} `setTimeout(callback, delay, ...args)` schedules a
 *   timer and returns its id, forwarding `args` to the callback as `setTimeout` does; `clear()` cancels
 *   every timer still pending
 */
export function useTimers (): Timers {
  const timers = useRef<Timers | null>(null)
  if (timers.current === null) {
    const pending = new Set<ReturnType<typeof setTimeout>>()
    timers.current = {
      setTimeout (callback, delay, ...args) {
        const id = setTimeout((...params: typeof args) => {
          pending.delete(id)
          callback(...params)
        }, delay, ...args)
        pending.add(id)
        return id
      },
      clear () {
        // Not `forEach(clearTimeout)`, which would pass the set's extra arguments along.
        pending.forEach(id => clearTimeout(id))
        pending.clear()
      },
    }
  }
  useEffect(() => {
    // Assigned above, during the first render, before any effect of it runs.
    const own = timers.current!
    return () => own.clear()
  }, [])
  return timers.current
}
