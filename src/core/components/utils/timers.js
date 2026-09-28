import { useEffect, useRef } from 'react'

/**
 * TIMERS A FUNCTION COMPONENT OWNS, all cleared when it unmounts: what `@withTimer` gives a class
 * (§9.3 step 6). It is for timers started outside an effect, from an event handler for instance; a
 * timer an effect starts belongs in that effect's cleanup instead.
 *
 * The object it returns is the same on every render, so it is safe to use from any callback.
 *
 * @returns {{setTimeout: Function, clear: Function}} `setTimeout(callback, delay, ...args)` schedules a
 *   timer and returns its id, forwarding `args` to the callback as `setTimeout` does; `clear()` cancels
 *   every timer still pending
 */
export function useTimers () {
  const timers = useRef(null)
  if (timers.current === null) {
    const pending = new Set()
    timers.current = {
      setTimeout (callback, delay, ...args) {
        const id = setTimeout((...params) => {
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
    const own = timers.current
    return () => own.clear()
  }, [])
  return timers.current
}
