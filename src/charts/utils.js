import React from 'react'
import { Area, Cell, LabelList } from 'recharts'
import { shortNumber, toAlphaNumId, } from 'utils-pack'
import { toHours } from 'utils-pack/time'
import STYLE from '../styles'

// =============================================================================
// COMMON CHART OPTIONS AND HELPERS
// =============================================================================
export const chartOffsetMargin = 20 // to the right of Y-axis

/* Area Chart Common Props */
export const chartArea = {
  type: 'monotone',
  animationEasing: 'ease-in-out',
  animationDuration: STYLE.ANIMATION_DURATION,
  fillOpacity: 1
}

export const chartCartesianGrid = {
  stroke: STYLE.BORDER,
  strokeDasharray: '3 4'
}

/* Chart Container Common Props */
export const chartContainer = {
  margin: { top: 20, right: chartOffsetMargin, left: 0, bottom: 5 }
}

export const chartTooltip = {
  animationEasing: 'ease-out',
  animationDuration: STYLE.ANIMATION_DURATION,
  wrapperStyle: {zIndex: 1}
}

/* XAxis Chart Common Props */
export const chartXaxis = {
  dataKey: 'time',
  domain: ['auto', 'auto'],
  scale: 'linear',
  type: 'number',
  tickLine: false,
  tickFormatter: toHours,
  minTickGap: 12
}

/* YAxis Chart Common Props */
export const chartYaxis = {
  tickLine: false,
  tickFormatter: shortNumber,
  minTickGap: 12
}

/**
 * Create Function to Render Chart Area
 *
 * @param {String} id - unique id prefix for the chart type
 * @returns {function({name: *, color: *}): *}
 */
export function renderAreas (id) {
  return function ({name: n, color, gradient, ...props}) {
    const name = toAlphaNumId(n)
    const value = gradient ? `url(#${id}-${name})` : color
    return (
      <Area key={name} name={name} dataKey={`${name}.value`} fill={value} stroke={color} color={color} {...props} >
        <LabelList dataKey={`${name}.label`} fill={color} position='top'/>
      </Area>
    )
  }
}

/**
 * Create Function to Render Chart Cell (for Bars, Pies, etc.)
 *
 * @param {String} id - unique id prefix for the chart type
 * @returns {function({name: *, color: *, gradient: *}): *}
 */
export function renderCells (id) {
  return function renderCell ({ name, color, gradient }) {
    const value = gradient ? `url(#${id}-${toAlphaNumId(name)})` : color
    return <Cell fill={value} stroke={value} color={color}/>
  }
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
export function renderGradients ({ id, startOpacity = 0.67, stopOpacity = 1, x1 = '0', y1 = '0', x2 = '1', y2 = '1' }) {
  return function ({name: n, color}) {
    const name = toAlphaNumId(n)
    return (
      <linearGradient key={name} id={`${id}-${name}`} x1={x1} y1={y1} x2={x2} y2={y2}>
        <stop offset='5%' stopColor={color} stopOpacity={startOpacity}/>
        <stop offset='95%' stopColor={color} stopOpacity={stopOpacity}/>
      </linearGradient>
    )
  }
}
