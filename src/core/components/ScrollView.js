import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'

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
 * @param {*} [tab]
 * @param {*} props - other props
 * @returns {Object} - React component
 */
const ScrollView = ({
  className,
  classNameInner,
  style,
  styleInner,
  row,
  fill,
  reverse,
  rtl,
  center,
  // Remove tab to prevent Error
  tab,
  ...props
}) => {
  const thisRef = useRef(null)
  const [scrollYPosition, setScrollYPosition] = useState(0)

  const handleScroll = (e) => {
    if (e.target === thisRef.current) {
      setScrollYPosition(e.target.scrollLeft)
    }
  }

  return (
    <div
      ref={thisRef}
      className={classNames('overflow-scroll',
        row ? 'flex--row max-width' : 'flex--col max-height',
        scrollYPosition && 'vertical-scroll',
        {fill, rtl, center: center && !row}, className,
      )}
      style={style}
      onScroll={handleScroll}
    >
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

ScrollView.propTypes = {
  className: PropTypes.string,
  classNameInner: PropTypes.string,
  style: PropTypes.object,
  styleInner: PropTypes.object,
  children: PropTypes.any.isRequired
}

export default ScrollView
