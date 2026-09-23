import { debounce } from '../utils'

// Where the debounced submits are parked on the UI instance. Private to this module: the mapper
// creates them and `rules.js` cancels them at unmount, and nothing else should know the name.
const CACHE = '_autoSubmit'

/**
 * The debounced `instance.submit` for a meta node that declares `autoSubmit`, created once per UI
 * instance and delay, and reused on every later render.
 *
 * The mapper runs on EVERY render pass, so building this inline gave each pass its own timer: two
 * changes with a render between them — which is the normal case, since a change re-renders — each
 * scheduled a separate submit and both landed. A debounce has to outlive the render that created
 * it to debounce anything at all, so it is cached on the instance rather than rebuilt.
 *
 * Kept per DELAY rather than one per instance: a meta may declare `autoSubmit` on several nodes
 * with different delays, and a single slot would have them evicting each other on every pass —
 * trading the original defect for a worse one.
 *
 * `instance.submit` is read once, at creation, exactly as the inline `debounce(instance.submit, …)`
 * it replaces did.
 */
export function autoSubmitter (instance, delay) {
    let byDelay = instance[CACHE]
    if (!byDelay) {
        byDelay = new Map()
        instance[CACHE] = byDelay
    }

    let submit = byDelay.get(delay)
    if (!submit) {
        submit = debounce(instance.submit, delay)
        byDelay.set(delay, submit)
    }
    return submit
}

/**
 * Drop every pending auto-submit. Called from the instance's `componentWillUnmount`, so a change
 * typed just before unmount cannot submit a form the user has navigated away from.
 */
export function cancelAutoSubmit (instance) {
    const byDelay = instance[CACHE]
    if (byDelay) byDelay.forEach(submit => submit.cancel())
}
