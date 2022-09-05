import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { ONE_SECOND, TIME_DURATION_INSTANT } from 'ui-utils-pack'
import { renderFloat } from './renders'
import { withTimer } from './utils'

/**
 * Animated Number Counter using Localised Render Float function
 */
@withTimer
export default class Counter extends PureComponent {
  static propTypes = {
    start: PropTypes.number, // default is 0
    end: PropTypes.number.isRequired,
    render: PropTypes.func, // number formatting function
    decimals: PropTypes.number, // default is 0
    delay: PropTypes.number, // animation delay, default is TIME_DURATION_INSTANT
    duration: PropTypes.number, // animation duration
    interval: PropTypes.number, // animation interval, default is 17 ms, which translates to ~60 frames per second
    easingFn: PropTypes.func, // animation easing function, see https://gist.github.com/gre/1650294
    className: PropTypes.string,
    style: PropTypes.object,
  }

  static defaultProps = {
    start: 0,
    decimals: 0,
    render: renderFloat,
    easingFn: (t) => t * t * t,
  }

  state = {
    value: this.props.start,
    steps: 0, // steps left to animate
  }

  animate = () => {
    const {value, steps} = this.state
    const {end} = this.props
    if (!steps) return
    this.setState({
      value: value + (end - value) / steps,
      steps: steps - 1,
    })
  }

  setup = (props = this.props) => {
    const {
      end, start, easingFn,
      duration = ONE_SECOND,
      delay = TIME_DURATION_INSTANT,
      interval = 17
    } = props
    const steps = end === start ? 0 : Math.ceil(duration / interval)
    if (steps) {
      this.clearTimer()
      this.setTimeout(() => {
        for (let i = 0; i < steps; i++) {
          this.setTimeout(this.animate, duration * easingFn((i + 1) / steps))
        }
      }, delay)
    }
    this.setState({steps, value: start})
  }

  componentDidMount () {
    this.setup()
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    if (nextProps.end !== this.props.end) this.setup(nextProps)
  }

  render () {
    const {decimals, render} = this.props
    const {value} = this.state
    return render(value, decimals)
  }
}
