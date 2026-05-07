/**
 * Small validation helpers replacing `validator` for the few rules we use.
 */

// Pragmatic email check (aligned with common HTML5-style patterns)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isEmail (value) {
    return typeof value === 'string' && value.length > 0 && EMAIL_RE.test(value)
}

export function isLengthMax (value, max) {
    const s = value == null ? '' : String(value)
    return s.length <= max
}

// require_protocol: true — http:// or https://, non-whitespace remainder
const URL_WITH_PROTOCOL_RE = /^https?:\/\/\S+$/i

export function isURLWithProtocol (value) {
    return typeof value === 'string' && value.length > 0 && URL_WITH_PROTOCOL_RE.test(value)
}
