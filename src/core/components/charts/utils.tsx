import React from 'react'
import { toAlphaNumId } from '../../utils'

/** What `renderGradients` is given: the chart's id prefix, and the gradient's opacity and direction. */
export type GradientOptions = {
  id: string
  startOpacity?: number
  stopOpacity?: number
  x1?: string
  y1?: string
  x2?: string
  y2?: string
}

/**
 * Create Function to Render Gradient Color Definition
 *
 * @param {String} id - unique id prefix for the chart type
 * @param {Number} [startOpacity] - beginning opacity
 * @param {Number} [stopOpacity] - ending opacity
 * @param {String} [x1] - gradient start position
 * @param {String} [y1] - gradient start position
 * @param {String} [x2] - gradient end position
 * @param {String} [y2] - gradient end position
 * @returns {function({name: *, color: *}): *}
 */
export function renderGradients ({ id, startOpacity = 0.67, stopOpacity = 1, x1 = '0', y1 = '0', x2 = '1', y2 = '1' }: GradientOptions) {
  return function ({ name: n, color }: { name: string, color: string }) {
    const name = toAlphaNumId(n)
    return (
      <linearGradient key={name} id={`${id}-${name}`} x1={x1} y1={y1} x2={x2} y2={y2}>
        <stop offset='5%' stopColor={color} stopOpacity={startOpacity}/>
        <stop offset='95%' stopColor={color} stopOpacity={stopOpacity}/>
      </linearGradient>
    )
  }
}
