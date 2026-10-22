import classNames from '../utils/classNames'
import React from 'react'
import { useNumberLocale } from '../contexts'
import { debounce, round, SORT_ORDER } from '../utils'
import Icon from './Icon'
import Text from './Text'

export const noSpellCheck = {
  autoComplete: 'off',
  autoCorrect: 'off',
  autoCapitalize: 'off',
  spellCheck: false,
}

/**
 * RENDER HELPERS ==============================================================
 * =============================================================================
 */

/**
 * The formatter of a number in `locale`, the runtime's when there is none, made once for each locale and count of
 * decimals: with exactly `decimals` digits of fraction, or as `toLocaleString` without options when `decimals` is
 * not given. ECMA-402 specifies `toLocaleString` with options as a new `Intl.NumberFormat` on each call, and V8
 * pays for it: 9.65 µs a call in Node 24, against 0.24 µs for a formatter made once, with the same output (2026-10-13).
 */
const numberFormats = new Map<string, Intl.NumberFormat>()
function numberFormat (locale: string | undefined, decimals?: number): Intl.NumberFormat {
  const key = `${locale}|${decimals}`
  let format = numberFormats.get(key)
  if (!format) {
    format = new Intl.NumberFormat(locale, decimals == null ? undefined : {minimumFractionDigits: decimals, maximumFractionDigits: decimals})
    numberFormats.set(key, format)
  }
  return format
}

/** `renderFloat`'s own options. The rest are passed to the `Text` it renders. */
export type RenderFloatProps = {
  /** Trims the excess fraction instead of rounding it */
  truncated?: boolean
  /** Default is true: the fraction is shown faded */
  faded?: boolean
  [key: string]: unknown
}

/** What `renderFloat` renders: a component, so that it can read the `locale` a host configured. */
type FloatValueProps = RenderFloatProps & { value: number | string, decimals?: number }

/**
 * The number `renderFloat` shows, in the configured `locale` (`ConfigContext`), or the runtime's without one, as
 * `TextDateValue` shows a date in the configured format. Until 2026-10-22 `renderFloat` formatted the number itself,
 * in the runtime's locale only.
 */
function FloatValue ({value, decimals, truncated, faded = true, ...options}: FloatValueProps) {
  const locale = useNumberLocale()
  let fraction = String(value).split('.')[1] || '0' // extract fraction before rounding, because we need fixed length
  // Without `decimals`, to an integer: until 2026-10-06 it was trimmed there, `truncated` or not.
  const shown = truncated ? value : round(value, decimals == null ? 0 : decimals)
  // A cast, not a guard: without `decimals`, `undefined > 0` is false, and there is no fraction.
  const showFraction = (decimals as number) > 0
  if (showFraction) {
    fraction = truncated ? fraction.substr(0, decimals == null ? undefined : decimals) : fraction
    // A fixed-length fraction, its separator first. A cast, not a guard: `showFraction` holds only for `decimals` above 0.
    fraction = numberFormat(locale, decimals as number).format(Number('0.' + fraction)).substr(1)
  }
  return (
    <Text {...options}>
      {/* A cast, not a guard: a numeric string is coerced by `Math.trunc`, as `round` coerces it above. */}
      {numberFormat(locale).format(Math.trunc(shown as number))}
      {showFraction && (faded ? <Text className='fade--quarter no-margin'>{fraction}</Text> : fraction)}
    </Text>
  )
}

/**
 * Render Float Number as Localised String with Faded Fraction
 *
 * @param {String|Number} value
 * @param {Number|Undefined} [decimals] - the number of fraction digits to keep, default has no fraction (Integer)
 * @param {*} [props<truncated, faded>] - other pros to pass
 *    `truncated: true` will not apply rounding, but only trim excess fraction
 *    `faded: false` will not apply fraction part with faded CSS style
 * @return {Object} - React component
 */
export function renderFloat (value: number | string, decimals?: number, props?: RenderFloatProps) {
  return <FloatValue {...props} value={value} decimals={decimals}/>
}

/** One of `renderSort.icon`'s keys: none, ascending or descending. */
export type SortOrder = keyof typeof SORT_ORDER

/** What a sort icon is for, and the order it shows. */
export type SortState = { id?: unknown, order?: SortOrder }

/**
 * Render Sort Icon
 *
 * @param {Number|Undefined} order - sorting order, one of renderSort.icon keys
 * @param {Number|Undefined} [id] - of the column or row to sort
 * @param {Function} [onClick] - callback when sort Icon is clicked, received clicked sort object
 * @param {String} [className] - CSS class names to add
 */
export function renderSort ({id, order}: SortState, {onClick, className}: { onClick?: (sort: SortState) => void, className?: string } = {}) {
  return (
    <Icon
      className={classNames('app__sort__icon', className, {active: !order})}
      name={renderSort.icon[order || 0]}
      onClick={onClick && (() => onClick({id, order}))}
    />
  )
}

renderSort.icon = SORT_ORDER

/**
 * Resize Element Width to Match Content Length
 *
 * @param {String} value - of the element to resize
 * @param {Object} style - of the element to resize
 * @param {Boolean|Number} offset - count of characters to add to final width
 */
export function resizeToContent (value: string, style: Pick<CSSStyleDeclaration, 'width' | 'boxSizing' | 'transition'>, offset: boolean | number = 1) {
  // Add additional character to prevent truncation from uneven fonts
  // boolean `offset` evaluates to 1 by default.
  style.width = value.length + Number(offset) + 'ch'
  style.boxSizing = 'content-box'
  if (!style.transition) style.transition = '200ms'
}

/**
 * Event handler to autosize Input height to match typed in text height
 * @example:
 *  <Input type='textarea' onKeyUp={toTextHeight} />
 */
export const toTextHeight = debounce(toTextHeightFunc, 50, {leading: true})

/** An event on a text field, whose `target` is the field. */
export type TextFieldEvent = { target: HTMLElement | null }

export function toTextHeightFunc (e: TextFieldEvent) {
  if (!e.target) return

  // Reset field height
  e.target.style.height = 'inherit'

  // Get the computed styles for the element
  const computed = window.getComputedStyle(e.target)

  // Calculate the height
  const height = parseInt(computed.getPropertyValue('border-top-width'), 10)
    + e.target.scrollHeight
    + parseInt(computed.getPropertyValue('border-bottom-width'), 10)

  e.target.style.height = `${Math.min(height, Math.round(window.innerHeight / 5))}px`
}
