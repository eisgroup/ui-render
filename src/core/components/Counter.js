import PropTypes from 'prop-types'
import { PureComponent } from 'react'
import { ONE_SECOND, TIME_DURATION_INSTANT } from '../utils'
import { renderFloat } from './renders'
import { withTimer } from './utils'

const DEFAULT_INTERVAL = 17
const MAX_ANIMATION_STEPS = 10000
const ANIMATION_PROPS = ['start', 'end', 'duration', 'delay', 'interval', 'easingFn']

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
    const {end} = this.props
    this.setState(({value, steps}) => {
      if (steps <= 0) return null
      const nextSteps = steps - 1
      return {
        value: nextSteps ? value + (end - value) / steps : end,
        steps: nextSteps,
      }
    })
  }

  setup = (props = this.props) => {
    const {
      end, start, easingFn,
      duration = ONE_SECOND,
      delay = TIME_DURATION_INSTANT,
      interval = DEFAULT_INTERVAL
    } = props
    const safeDuration = Number.isFinite(duration) && duration >= 0 ? duration : ONE_SECOND
    const safeDelay = Number.isFinite(delay) && delay >= 0 ? delay : TIME_DURATION_INSTANT
    const safeInterval = Number.isFinite(interval) && interval > 0 ? interval : DEFAULT_INTERVAL
    const steps = end === start || safeDuration === 0
      ? 0
      : Math.min(Math.ceil(safeDuration / safeInterval), MAX_ANIMATION_STEPS)

    this.clearTimer()
    if (steps) {
      this.setTimeout(() => {
        for (let i = 0; i < steps; i++) {
          const progress = (i + 1) / steps
          const easedProgress = easingFn(progress)
          const frameDelay = Number.isFinite(easedProgress)
            ? Math.max(0, safeDuration * easedProgress)
            : safeDuration * progress
          this.setTimeout(this.animate, frameDelay)
        }
      }, safeDelay)
    }
    this.setState({steps, value: safeDuration === 0 ? end : start})
  }

  componentDidMount () {
    this.setup()
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    if (ANIMATION_PROPS.some((prop) => nextProps[prop] !== this.props[prop])) this.setup(nextProps)
  }

  render () {
    const {decimals, render} = this.props
    const {value} = this.state
    return render(value, decimals)
  }
}
