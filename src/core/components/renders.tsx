import classNames from '../utils/classNames'
import React from 'react'
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

/** `renderFloat`'s own options. The rest are passed to the `Text` it renders. */
export type RenderFloatProps = {
  /** Trims the excess fraction instead of rounding it */
  truncated?: boolean
  /** Default is true: the fraction is shown faded */
  faded?: boolean
  [key: string]: unknown
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
  const {truncated, faded = true, ...options} = props || {}
  let fraction = String(value).split('.')[1] || '0' // extract fraction before rounding, because we need fixed length
  if (!truncated && decimals != null) value = round(value, decimals)
  // A cast, not a guard: without `decimals`, `undefined > 0` is false, and there is no fraction.
  const showFraction = (decimals as number) > 0
  if (showFraction) {
    fraction = truncated ? fraction.substr(0, decimals == null ? undefined : decimals) : fraction
    fraction = Number('0.' + fraction).toLocaleString(undefined, decimals == null ? undefined : {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).substr(1) // toLocalString will return fixed length fraction to given decimals number
  }
  return (
    <Text {...options}>
      {/* A cast, not a guard: a numeric string is coerced by `Math.trunc`, as `round` coerces it above. */}
      {Math.trunc(value as number).toLocaleString()}
      {showFraction && (faded ? <Text className='fade--quarter no-margin'>{fraction}</Text> : fraction)}
    </Text>
  )
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
