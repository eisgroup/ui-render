import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { isFunction } from 'utils-pack'
import { accessibilitySupport } from './utils'

/**
 * View with Custom Scroll Bar - Pure Component
 *
 * @param {String} [className] - CSS classes to apply
 * @param {String} [classNameInner] - CSS classes to apply to inner wrapper
 * @param {Object} [style] - CSS to apply
 * @param {Object} [styleInner] - CSS to apply to inner wrapper
 * @param {Boolean} [row] - whether to render children as <Row />
 * @param {Boolean} [fill] - whether to make the view fill up available height and width
 * @param {Boolean} [reverse] - whether to reverse order of rendering
 * @param {Boolean} [rtl] - whether to use right to left direction
 * @param {Boolean} [center] - whether to center align content
 * @param {Object} [sound] - new Audio(URL) sound file
 * @param {*} [tab]
 * @param {*} [ref] - callback(element) when component mounts, or from React.createRef()
 * @param {*} props - other props
 * @returns {Object} - React component
 */
export function ScrollView ({
  className,
  classNameInner,
  style,
  styleInner,
  row,
  fill,
  reverse,
  rtl,
  center,
  sound,
  // Remove tab to prevent Error
  tab,
  ...props
}, ref) {
  props = accessibilitySupport(props, sound)
  return (
    <div
      className={classNames('overflow-scroll',
        row ? 'flex--row max-width' : 'flex--col max-height',
        {fill, rtl, center: center && !row}, className,
      )}
      style={style}
      {...isFunction(ref) && {ref}}>
      <div
        className={classNames(row ? 'flex--row min-width' : 'flex--col min-height',
          {fill, reverse, rtl, pointer: props.onClick, 'margin-auto': center}, classNameInner,
        )}
        style={styleInner}
        {...props}
      />
    </div>
  )
}

export const ScrollViewRef = React.forwardRef(ScrollView)

ScrollView.propTypes = {
  className: PropTypes.string,
  classNameInner: PropTypes.string,
  style: PropTypes.object,
  styleInner: PropTypes.object,
  children: PropTypes.any.isRequired
}

export default React.memo(ScrollView)
