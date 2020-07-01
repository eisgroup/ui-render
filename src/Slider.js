import classNames from 'classnames'
import PropTypes from 'prop-types'
import 'rc-slider/assets/index.css'
import Handle from 'rc-slider/lib/Handle'
import Range from 'rc-slider/lib/Range'
import RCSlider from 'rc-slider/lib/Slider' // Slider lib adds 55 KB to bundle size
import React from 'react'
import { formatNumber, last, round, toPercent } from 'utils-pack'
import { formatDuration } from 'utils-pack/src/time'
import Tooltip from './Tooltip'
// import View from './View'

// const RCSlider = View
// const Range = View

/**
 * Slider - Pure Component
 *
 * @param {Number|Array} value - slider value
 * @param {String} [className] - css class
 * @param {Array} [range] - list of min and max values, if given will use sliderRangeMarks()
 * @param {Object} [rangeOptions] - explicit list of min, max and all possible steps in between
 * @param {Object} [rangeLabels] - sliderRangeMarks() options when given along with `range`
 * @param {Number|Null} [step] - slider movement interval, if `null`, will use sliderRangeMarks() as interval
 * @param {Object} [tooltipProps] - whether to render tooltip, and its options (passed as <Tooltip> props)
 * @param {String} [unit] - unit to display in tooltip
 * @param {Function} [render] - function to render extra content, receives `value` as first argument
 * @param {Object} [props] - other props to pass
 * @return {Object} - React Component
 */
export default function Slider
  ({
    className,
    range,
    rangeLabels,
    rangeOptions,
    step,
    tooltipProps,
    unit,
    render,
    readonly,
    ...props
  }) {
  const classNameFinal = classNames('app__slider', className, {readonly})
  const SliderComponent = (typeof props.value === 'object') ? Range : RCSlider
  if (tooltipProps) props.handle = ({value, index, dragging, ...handleProps}) => {
    const {render, ...tipProps} = tooltipProps
    return <Handle key={index} value={value} {...handleProps}>
      <Tooltip show top={!props.vertical} right={props.vertical} {...tipProps}>
        {render ? render(value) : `${value}${unit || ''}`}
      </Tooltip>
    </Handle>
  }
  return (
    <SliderComponent
      className={classNameFinal}
      step={step}
      {...props}
      {...(range || rangeOptions) && sliderRangeMarks(range || rangeOptions, rangeLabels, step)}
    >
      {render && render(props.value)}
    </SliderComponent>
  )
}

Slider.propTypes = {
  min: PropTypes.number, // default is 0
  max: PropTypes.number,  // default is 100
  value: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.number),
    PropTypes.number,
  ])
}

/**
 * Create `min`, `max`, `marks` and `steps` props for Slider Component
 *
 * @example:
 *    <Slider
 *      {...sliderRangeMarks([1, 10], {isPercent: true, precision: 1})}
 *    />
 *
 * @param {Array} range - list of numbers
 * @param {Object} [options] - mark options
 * @param {Number|Null} [step] - slider movement interval, if `null`, will use computed marks as steps
 * @return {Object} - Slider's `min`, `max`, `marks` and `steps` props
 */
function sliderRangeMarks (range, options = {}, step = null) {
  if (range.length === 2 || (range.length === 3 && range[0] === 0)) options.computeSteps = true
  return {
    min: range[0],
    max: last(range),
    marks: sliderIntervals(range, options),
    step
  }
}

/**
 * Create Slider Marks for given Value Range
 *
 * @param {Array} range - list of numbers
 * @param {Object} [options] - formatting options
 * @param {Boolean} [computeSteps] - whether mark point shall be calculated dynamically from given range of inputs
 * @return {Object} - marks for Slider component
 */
function sliderIntervals (range, { formatLabel, isTime, isCurrency, currency, isPercent, precision, computeSteps = false } = {}) {
  const min = range[0] || range[1]  // allow specifying range starting with 0 (e.g. [0, 500, 5000])
  const max = last(range)
  const steps = Math.floor(max / min)
  const intervalSteps = {}

  // Default Label Formatting
  if (!formatLabel) {
    formatLabel = formatNumber
    if (isTime) formatLabel = max <= 1000 ? (val) => val + ' ms' : (val) => formatDuration(val, { round: false })
    if (isCurrency) formatLabel = (val) => ((currency || '$') + ' ' + formatNumber(val))
    if (isPercent) formatLabel = (val) => toPercent(val / 100, precision)
  }

  // Default Mark Steps Calculation
  if (computeSteps) {
    for (let step = 0; step < steps; step++) {
      const value = round(min * (step + 1), precision)
      intervalSteps[value] = { style: { whiteSpace: 'nowrap' }, label: formatLabel(value) }
    }
  }

  // Add Defined Mark Steps
  range.forEach(value => {
    intervalSteps[value] = { style: { whiteSpace: 'nowrap' }, label: formatLabel(value) }
  })

  return intervalSteps
}
