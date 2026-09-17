/**
 * TIME FUNCTIONS ==============================================================
 * =============================================================================
 */

interface UnitDefinition {
  unit: string
  /** [singular, plural] */
  long: [string, string]
  ms: number
}

const UNITS: UnitDefinition[] = [
  { unit: 'y', long: ['year', 'years'], ms: 31557600000 },
  { unit: 'mo', long: ['month', 'months'], ms: 2629800000 },
  { unit: 'w', long: ['week', 'weeks'], ms: 604800000 },
  { unit: 'd', long: ['day', 'days'], ms: 86400000 },
  { unit: 'h', long: ['hour', 'hours'], ms: 3600000 },
  { unit: 'm', long: ['minute', 'minutes'], ms: 60000 },
  { unit: 's', long: ['second', 'seconds'], ms: 1000 },
  { unit: 'ms', long: ['millisecond', 'milliseconds'], ms: 1 },
]

export interface FormatDurationOptions {
  /** whether to use short unit forms (y/mo/w/d/h/m/s/ms) */
  shorten?: boolean
  /** whether to round the smallest unit (default true) */
  round?: boolean
  /** render at most N largest non-zero units */
  largest?: number | null
  /** separator between units (default ', ') */
  delimiter?: string
  /** separator between value and unit (default ' ') */
  spacer?: string
  /** decimal separator for fractional values (default '.') */
  decimal?: string
}

/**
 * Convert Time Duration to User Friendly and Readable Format
 *
 * `milliseconds` is passed through `Number()`, so the public API also accepts
 * numeric strings, `null` and `undefined` — anything non-finite formats as zero.
 *
 * @param milliseconds - duration in milliseconds to convert
 * @param options
 * @returns formatted time
 */
export function formatDuration (milliseconds: unknown, {
  shorten = false,
  round = true,
  largest,
  delimiter = ', ',
  spacer = ' ',
  decimal = '.',
}: FormatDurationOptions = {}): string {
  const duration = Number(milliseconds)
  if (!Number.isFinite(duration) || duration === 0) {
    return shorten ? `0${spacer}s` : `0${spacer}seconds`
  }
  let remaining = Math.abs(duration)
  const parts: string[] = []
  for (let i = 0; i < UNITS.length; i++) {
    const def = UNITS[i]
    const isLast = i === UNITS.length - 1
    let value = remaining / def.ms
    if (isLast || (largest != null && parts.length === largest - 1)) {
      if (round) value = Math.round(value)
      else if (!isLast && value < 1) value = 0
    } else {
      value = Math.floor(value)
    }
    if (value > 0) {
      remaining -= value * def.ms
      const valueStr = String(value).replace('.', decimal)
      const label = shorten ? def.unit : def.long[value === 1 ? 0 : 1]
      parts.push(`${valueStr}${spacer}${label}`)
      if (largest != null && parts.length === largest) break
    }
    if (remaining <= 0) break
  }
  if (!parts.length) return shorten ? `0${spacer}s` : `0${spacer}seconds`
  const sign = duration < 0 ? '-' : ''
  return sign + parts.join(delimiter)
}

formatDuration.shortEnglish = function (
  milliseconds: unknown,
  options: FormatDurationOptions | null | undefined = {},
): string {
  return formatDuration(milliseconds, { ...options, shorten: true })
}
