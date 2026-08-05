import classNames from '../utils/classNames'
import PropTypes from 'prop-types'
import React, { Fragment, PureComponent } from 'react'
import { get, isFunction } from '../utils'
import Button from './Button'
import Icon from './Icon'
import ProgressBar from './ProgressBar'
import Row from './Row'
import ScrollView from './ScrollView'
import Text from './Text'
import { withTimer } from './utils'
import View from './View'

const normalizeIndex = (value, items) => {
  const index = +value
  return Number.isInteger(index) && index >= 0 && index < items.length ? index : 0
}

/**
 * Progress Steps - Component
 */
@withTimer
export default class ProgressSteps extends PureComponent {
  static propTypes = {
    items: PropTypes.arrayOf(
      PropTypes.shape({
        step: PropTypes.string, // step text to display, default is incremental step number
        label: PropTypes.string, // text to display under step
        done: PropTypes.bool, // whether the step is completed
        error: PropTypes.bool, // whether the step has error
        content: PropTypes.any, // content to render under the step
      })
    ).isRequired,
    activeIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), // index of active item (starts at 0)
    defaultIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onChange: PropTypes.func, // callback when step is clicked, receives clicked step index
    hasConnector: PropTypes.bool, // whether to render the vertical line below each step
    className: PropTypes.string, // css class names to add
    style: PropTypes.object, // css styles to add
    classNameSteps: PropTypes.string, // css class names to add
    styleSteps: PropTypes.object, // css styles to add
    classNameContent: PropTypes.string, // css class names to add
    styleContent: PropTypes.object, // css styles to add
  }

  state = {
    activeIndex: normalizeIndex(
      this.props.activeIndex != null ? this.props.activeIndex : this.props.defaultIndex,
      this.props.items
    ),
    transition: false,
  }

  UNSAFE_componentWillReceiveProps (next) {
    const {activeIndex, items} = next
    const nextIndex = normalizeIndex(activeIndex != null ? activeIndex : this.state.activeIndex, items)
    if (activeIndex != null) {
      this.clearTimer()
      this.setState({activeIndex: nextIndex, transition: false})
    } else if (nextIndex !== this.state.activeIndex) {
      this.setState({activeIndex: nextIndex, transition: false})
    }
  }

  handleClickStep = (index) => {
    this.clearTimer()
    this.setState({transition: true})
    this.setTimeout(() => {
      if (index >= this.props.items.length) {
        this.setState({transition: false})
        return
      }
      this.setState({activeIndex: index, transition: false})
      if (this.props.onChange) this.props.onChange(index)
    }, 50) // 50 ms is needed to allow full rendering so css transition can take effect
  }

  render () {
    const {items, hasConnector, className, style, classNameSteps, styleSteps, classNameContent, styleContent} = this.props
    const {activeIndex, transition} = this.state
    const content = get(items[activeIndex], 'content')
    return (
      <View
        className={classNames('app__progress-steps max-size', className)}
        style={style}
      >
        <Row className={classNames('app__progress--steps top justify', classNameSteps, {connector: hasConnector})}
             style={styleSteps}>
          {items.map(({label, step, done, error}, i) => {
            const passed = i <= activeIndex
            const active = i === activeIndex
            return (
              <Fragment key={step || i}>
                {i > 0 && <ProgressBar value={passed ? 1 : 0}/>}
                <View className={classNames('app__progress__step align-center', {
                  passed, active, done, error, labeled: label != null
                })}>
                  <Button className='circle small margin-h-smallest' onClick={() => this.handleClickStep(i)}>
                    {done
                      ? <Icon className='small' name='checkmark'/>
                      : (error ? <Icon className='small' name='close'/> : (step ? step : i + 1))}
                  </Button>
                  {label != null &&
                  <Text className={classNames('position-bottom padding-top no-wrap', {bold: active})}>{label}</Text>
                  }
                </View>
              </Fragment>
            )
          })}
        </Row>
        {content != null &&
        <ScrollView fill className={classNames('tabs__content', {'fade-in': !transition}, classNameContent)}
                    style={styleContent}>
          {typeof content === 'object' ? content : (isFunction(content) ? content() : <Text>{content}</Text>)}
        </ScrollView>
        }
      </View>
    )
  }
}
