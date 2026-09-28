import classNames from '../utils/classNames'
import PropTypes from 'prop-types'
import React, { Fragment, useRef, useState } from 'react'
import { get, isFunction } from '../utils'
import Button from './Button'
import Icon from './Icon'
import ProgressBar from './ProgressBar'
import Row from './Row'
import ScrollView from './ScrollView'
import Text from './Text'
import { useTimers } from './utils'
import View from './View'

const normalizeIndex = (value, items) => {
  const index = +value
  return Number.isInteger(index) && index >= 0 && index < items.length ? index : 0
}

/**
 * Progress Steps - Component
 *
 * A FUNCTION COMPONENT since §9.3 step 6. It was a `@withTimer` PureComponent whose
 * `UNSAFE_componentWillReceiveProps` re-derived the active step whenever the parent rendered. That
 * lifecycle's trigger is a new props object, not a changed value, so the derivation below compares
 * the props object: a re-render for this component's own state keeps the same one.
 *  - A controlled `activeIndex` wins on every parent render, and a click still in its transition
 *    loses to it: the class cleared that timer outright; here the click is marked superseded and
 *    drops itself when it fires, which keeps render free of side effects.
 *  - Uncontrolled, only an index the items no longer have is reset, to the first step.
 *  - A click shows the new step after a 50 ms transition, and the timer reads the items and
 *    `onChange` as they are when it fires, as it read `this.props`.
 * The active step and the transition are one state object, merged the way `setState` merged them,
 * so React 16 and 17, which do not batch inside a timer, commit as often as they did.
 *
 * Not memoised, although the class was a PureComponent: `React.memo` would skip a parent render with
 * equal props, and the lifecycle ran even then. Under UI Render it never saw equal props anyway, since
 * the mapper rebuilds `items` on every render.
 */
export default function ProgressSteps (props) {
  const {
    items, activeIndex: activeIndexProp, defaultIndex, hasConnector, className, style,
    classNameSteps, styleSteps, classNameContent, styleContent,
  } = props
  const [state, setState] = useState(() => ({
    activeIndex: normalizeIndex(activeIndexProp != null ? activeIndexProp : defaultIndex, items),
    transition: false,
  }))
  const update = patch => setState(current => ({...current, ...patch}))
  const timers = useTimers()

  const [propsSeen, setPropsSeen] = useState(props)
  const [overrides, setOverrides] = useState(0)
  if (props !== propsSeen) {
    setPropsSeen(props)
    const nextIndex = normalizeIndex(activeIndexProp != null ? activeIndexProp : state.activeIndex, items)
    if (activeIndexProp != null) {
      setOverrides(overrides + 1)
      update({activeIndex: nextIndex, transition: false})
    } else if (nextIndex !== state.activeIndex) {
      update({activeIndex: nextIndex, transition: false})
    }
  }

  // What a click's timer reads when it fires: the latest props, as `this.props` was, and how many
  // times a controlled `activeIndex` has taken precedence since.
  const latest = useRef(null)
  latest.current = {props, overrides}

  const handleClickStep = (index) => {
    timers.clear()
    update({transition: true})
    const overridesAtClick = latest.current.overrides
    timers.setTimeout(() => {
      const {props: {items: currentItems, onChange}, overrides: currentOverrides} = latest.current
      if (currentOverrides !== overridesAtClick) return
      if (index >= currentItems.length) {
        update({transition: false})
        return
      }
      update({activeIndex: index, transition: false})
      if (onChange) onChange(index)
    }, 50) // 50 ms is needed to allow full rendering so css transition can take effect
  }

  const {activeIndex, transition} = state
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
                <Button className='circle small margin-h-smallest' onClick={() => handleClickStep(i)}>
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

ProgressSteps.propTypes = {
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
