import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { TIME_DURATION_INSTANT } from 'utils-pack'
import { SOUND } from './files'
import { STYLE } from './styles'
import Text from './Text'
import { withTimer } from './utils'
import View from './View'

/**
 * Progress Bar Component
 *
 * @param {Number|NaN|Undefined|Null} [value] - fraction from 0 to 1, renders placeholder tooltip by default
 * @param {String} [className] - optional css class names to add
 * @param {Boolean} [gradient] - whether to separate bar color into two gradients
 * @param {*} [children] - text or React component to render as progress indicator
 * @param {*} [props] - other attributes to pass to component
 * @returns {Object} - React Component
 */
@withTimer
export default class ProgressBar extends PureComponent {
  static propTypes = {
    value: PropTypes.number.isRequired, // fraction from 0 to 1
    label: PropTypes.any, // content to render inside the filled bar
    hasTooltip: PropTypes.bool, // default is false
    className: PropTypes.string,
    color: PropTypes.string, // bar color
    children: PropTypes.any,
    gradient: PropTypes.bool, // default is true
  }

  state = {
    value: 0,
  }

  get progressBar () {
    const {children, color, label, hasTooltip = false} = this.props
    const {value} = this.state
    const percentage = Math.round(value * 100)
    const width = percentage + '%'
    const tooltip = this.props.value >= 0 ? (children || width) : 'No Data'
    const style = {width}
    if (color) style.backgroundColor = color
    return (
      <View className='app__progress__bar' style={style}>
        {label && <Text>{label}</Text>}
        {hasTooltip &&
        <View className='app__progress__bar__tooltip'>
          <Text className='app__progress__bar__tooltip__inner'
                style={{transform: `translateX(${(0.5 - value) * 50}%)`}}
                children={tooltip}
          />
        </View>
        }
      </View>
    )
  }

  componentDidMount () {
    const {value} = this.props
    if (value != null) this.setTimeout(() => {
      this.setState({value})
      this.setTimeout(SOUND.PROGRESS.play, STYLE.ANIMATION_DURATION * 0.8)
    }, TIME_DURATION_INSTANT)
  }

  UNSAFE_componentWillReceiveProps ({value}) {
    if (value !== this.props.value) this.setState({value: value || 0})
  }

  render () {
    const {className, gradient = true, children: __, value: _, ...props} = this.props
    return (
      <View className={classNames('app__progress--bar', className, {gradient})} {...props}>
        <View className={'app__progress--bar__wrapper'}>
          {this.progressBar}
        </View>
      </View>
    )
  }
}
