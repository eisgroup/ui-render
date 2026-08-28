import classNames from '../utils/classNames'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { formatNumber, last, round, toPercent } from '../utils'
import { formatDuration } from '../utils/time'
import Tooltip from './Tooltip'
import { ENGINE_PROPS, FIELD_ONLY_PROPS, omitProps } from './domProps'

/**
 * Slider - Pure Component (no third-party slider library).
 *
 * @param {Number|Array} value - slider value (number for single, [from, to] for range)
 * @param {Number} [min=0]
 * @param {Number} [max=100]
 * @param {Number|Null} [step] - movement interval; if null, uses marks as snap points
 * @param {Object} [marks] - { [value]: { style?, label? } }
 * @param {Boolean} [vertical] - render vertically
 * @param {Boolean} [disabled]
 * @param {Boolean} [readonly]
 * @param {Function} [onChange] - (newValue) => void; newValue matches the shape of `value`
 * @param {String} [className]
 * @param {Array} [range] - list of min and max (and intermediate) values; expands into min/max/marks/step
 * @param {Object} [rangeOptions] - explicit list of min, max and all possible steps in between
 * @param {Object} [rangeLabels] - mark formatting options when paired with `range`
 * @param {Object} [tooltipProps] - if set, renders a tooltip on each handle; supports `render(value)`
 * @param {String} [unit] - unit suffix shown in the default tooltip label
 * @param {Function} [render] - extra content rendered as children; receives `value` first
 */
export function Slider ({
  className,
  range,
  rangeLabels,
  rangeOptions,
  step: stepProp,
  tooltipProps,
  unit,
  render,
  readonly,
  disabled,
  vertical,
  min: minProp = 0,
  max: maxProp = 100,
  marks: marksProp,
  value,
  onChange,
  name,
  ...rest
}) {
  const isRange = Array.isArray(value)

  // Resolve range/marks/step from helper props if provided.
  const expanded = (range || rangeOptions)
    ? sliderRangeMarks(range || rangeOptions, rangeLabels, stepProp)
    : null
  const min = expanded ? expanded.min : minProp
  const max = expanded ? expanded.max : maxProp
  const marks = expanded ? expanded.marks : marksProp
  const step = expanded ? expanded.step : stepProp
  const snapValues = step == null && marks
    ? Object.keys(marks).map(Number).sort((a, b) => a - b)
    : null

  const trackRef = useRef(null)
  const dragCleanupRef = useRef(null)
  const [activeIdx, setActiveIdx] = useState(-1)
  const interactive = !disabled && !readonly

  useEffect(() => () => {
    if (dragCleanupRef.current) dragCleanupRef.current()
  }, [])

  // When marks are the snap points (step:null) we distribute them evenly along the track
  // instead of placing them linearly by numeric value — otherwise dense low-end values
  // (e.g. [10, 50, 100, 500, 1000, 5000]) collide near the left edge.
  const isDiscrete = snapValues != null && snapValues.length > 1

  const valueToPct = useCallback((v) => {
    if (isDiscrete) {
      const idx = nearestIndex(snapValues, v)
      return (idx / (snapValues.length - 1)) * 100
    }
    if (max === min) return 0
    const pct = ((v - min) / (max - min)) * 100
    return Math.max(0, Math.min(100, pct))
  }, [min, max, isDiscrete, snapValues])

  const positionToValue = useCallback((clientX, clientY) => {
    const rect = trackRef.current && trackRef.current.getBoundingClientRect()
    if (!rect) return min
    let pct
    if (vertical) {
      const h = rect.height || 1
      pct = 1 - Math.min(1, Math.max(0, (clientY - rect.top) / h))
    } else {
      const w = rect.width || 1
      pct = Math.min(1, Math.max(0, (clientX - rect.left) / w))
    }
    if (isDiscrete) {
      const segments = snapValues.length - 1
      const idx = Math.max(0, Math.min(segments, Math.round(pct * segments)))
      return snapValues[idx]
    }
    let raw = min + pct * (max - min)
    if (step != null && step > 0) {
      raw = Math.round((raw - min) / step) * step + min
    }
    return Math.max(min, Math.min(max, raw))
  }, [min, max, step, isDiscrete, snapValues, vertical])

  const commit = (idx, next) => {
    if (!onChange) return
    if (isRange) {
      const updated = [...value]
      updated[idx] = next
      // Allow handles to swap so users can drag past each other.
      if (updated[0] > updated[1]) updated.reverse()
      onChange(updated, name)
    } else {
      onChange(next, name)
    }
  }

  const startDrag = (event, idx) => {
    if (!interactive) return
    if (dragCleanupRef.current) dragCleanupRef.current()
    // Cache pointer coordinates: React's synthetic event can be reused after
    // setActiveIdx triggers a re-render, leaving clientX/Y null.
    const startX = event.clientX
    const startY = event.clientY
    event.preventDefault()
    setActiveIdx(idx)
    const onMove = (e) => {
      const next = positionToValue(e.clientX, e.clientY)
      commit(idx, next)
    }
    const cleanup = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      if (dragCleanupRef.current === cleanup) dragCleanupRef.current = null
    }
    const onUp = () => {
      setActiveIdx(-1)
      cleanup()
    }
    dragCleanupRef.current = cleanup
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    // Also respond to the initial click position.
    commit(idx, positionToValue(startX, startY))
  }

  const onTrackPointerDown = (e) => {
    if (!interactive) return
    const target = positionToValue(e.clientX, e.clientY)
    if (isRange) {
      // Pick the closer handle to start dragging.
      const [a, b] = value
      const idx = Math.abs(target - a) <= Math.abs(target - b) ? 0 : 1
      startDrag(e, idx)
    } else {
      startDrag(e, 0)
    }
  }

  const handles = isRange
    ? value.map((v, i) => ({ value: v, index: i }))
    : [{ value: value == null ? min : value, index: 0 }]

  const trackStart = isRange ? valueToPct(Math.min(value[0], value[1])) : 0
  const trackEnd = isRange
    ? valueToPct(Math.max(value[0], value[1]))
    : valueToPct(handles[0].value)

  // CSS axis: horizontal uses left/width, vertical uses bottom/height.
  const trackStyle = vertical
    ? { bottom: trackStart + '%', height: (trackEnd - trackStart) + '%' }
    : { left: trackStart + '%', width: (trackEnd - trackStart) + '%' }

  const offset = (pct) => vertical ? { bottom: pct + '%' } : { left: pct + '%' }

  return (
    <div
      className={classNames('app__slider', className, { readonly, disabled, vertical, dragging: activeIdx >= 0 })}
      // DOM boundary (see ./domProps): the spread lands on a generic <div>, so both lists -- `label` and `name` are meaningless
  // there (the review probe caught `label` reaching this div).
      {...omitProps(rest, ENGINE_PROPS, FIELD_ONLY_PROPS)}
    >
      <div
        className='app__slider__rail'
        ref={trackRef}
        onPointerDown={onTrackPointerDown}
      />
      <div className='app__slider__track' style={trackStyle} onPointerDown={onTrackPointerDown}/>
      {marks && Object.keys(marks).map((k) => {
        const num = Number(k)
        if (num < min || num > max) return null
        return <span key={'dot' + k} className='app__slider__dot' style={offset(valueToPct(num))}/>
      })}
      {handles.map((h, i) => {
        const pct = valueToPct(h.value)
        const isActive = activeIdx === i
        return (
          <div
            key={i}
            role='slider'
            tabIndex={interactive ? 0 : -1}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={h.value}
            aria-orientation={vertical ? 'vertical' : 'horizontal'}
            aria-disabled={disabled || undefined}
            className={classNames('app__slider__handle', { active: isActive })}
            style={offset(pct)}
            onPointerDown={(e) => startDrag(e, i)}
            onKeyDown={interactive
              ? (e) => onHandleKey(e, h.value, i, { min, max, step, snapValues, commit })
              : undefined}
          >
            {tooltipProps && (
              <Tooltip
                show
                top={!vertical}
                right={vertical}
                {...omitRender(tooltipProps)}
              >
                {tooltipProps.render ? tooltipProps.render(h.value) : `${h.value}${unit || ''}`}
              </Tooltip>
            )}
          </div>
        )
      })}
      {marks && Object.keys(marks).map((k) => {
        const num = Number(k)
        if (num < min || num > max) return null
        const m = marks[k] || {}
        return (
          <span
            key={'mark' + k}
            className='app__slider__mark'
            style={{ ...offset(valueToPct(num)), ...m.style }}
          >
            {m.label}
          </span>
        )
      })}
      {render && render(value)}
    </div>
  )
}

Slider.propTypes = {
  min: PropTypes.number,
  max: PropTypes.number,
  value: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.number,
  ]),
}

export default React.memo(Slider)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function omitRender ({ render, ...rest }) {
  return rest
}

function nearestIndex (values, v) {
  let idx = 0
  let best = Math.abs(v - values[0])
  for (let i = 1; i < values.length; i++) {
    const d = Math.abs(v - values[i])
    if (d < best) { best = d; idx = i }
  }
  return idx
}

function onHandleKey (event, value, idx, { min, max, step, snapValues, commit }) {
  let delta = 0
  if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') delta = -1
  else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') delta = 1
  else if (event.key === 'Home') return commit(idx, min)
  else if (event.key === 'End') return commit(idx, max)
  if (!delta) return
  event.preventDefault()
  if (snapValues) {
    const sorted = [...snapValues].sort((a, b) => a - b)
    const exactIndex = sorted.indexOf(value)
    const i = exactIndex >= 0 ? exactIndex : nearestIndex(sorted, value)
    const next = sorted[Math.max(0, Math.min(sorted.length - 1, i + delta))]
    commit(idx, next != null ? next : value)
    return
  }
  const s = step && step > 0 ? step : 1
  commit(idx, Math.max(min, Math.min(max, value + delta * s)))
}

/**
 * Create `min`, `max`, `marks` and `step` props for Slider Component
 *
 * @param {Array} range - list of numbers
 * @param {Object} [options] - mark options
 * @param {Number|Null} [step] - slider movement interval
 * @return {Object}
 */
function sliderRangeMarks (range, options = {}, step = null) {
  const computeSteps = range.length === 2 || (range.length === 3 && range[0] === 0)
  const markOptions = computeSteps ? {...options, computeSteps: true} : options
  return {
    min: range[0],
    max: last(range),
    marks: sliderIntervals(range, markOptions),
    step,
  }
}

function sliderIntervals (range, { formatLabel, isTime, isCurrency, currency, isPercent, precision, computeSteps = false } = {}) {
  const min = range[0] || range[1]
  const max = last(range)
  const steps = Math.floor(max / min)
  const intervalSteps = {}

  if (!formatLabel) {
    formatLabel = formatNumber
    if (isTime) formatLabel = max <= 1000 ? (val) => val + ' ms' : (val) => formatDuration(val, { round: false })
    if (isCurrency) formatLabel = (val) => ((currency || '$') + ' ' + formatNumber(val))
    if (isPercent) formatLabel = (val) => toPercent(val / 100, precision)
  }

  if (computeSteps) {
    for (let step = 0; step < steps; step++) {
      const value = round(min * (step + 1), precision)
      intervalSteps[value] = { style: { whiteSpace: 'nowrap' }, label: formatLabel(value) }
    }
  }

  range.forEach((value) => {
    intervalSteps[value] = { style: { whiteSpace: 'nowrap' }, label: formatLabel(value) }
  })

  return intervalSteps
}
