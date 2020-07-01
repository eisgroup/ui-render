import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import Row from './Row'
import View from './View'

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
 * @param {*} props - other props
 * @returns {Object} - React component
 */
export default function ScrollView
  ({
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
    tab, // eslint-disable-line
    ...props
  }) {
  const Container = row ? Row : View
  return (
    <Container
      className={classNames(
        'overflow-scroll',
        row ? 'max-width' : 'max-height',
        {fill, rtl, center: center && !row},
        className,
      )}
      style={style}
    >
      <Container
        className={classNames(
          row ? 'min-width' : 'min-height',
          {fill, reverse, rtl, 'margin-auto': center},
          classNameInner,
        )}
        style={styleInner}
        {...props}
      />
    </Container>
  )
}

ScrollView.propTypes = {
  className: PropTypes.string,
  classNameInner: PropTypes.string,
  style: PropTypes.object,
  styleInner: PropTypes.object,
  children: PropTypes.any.isRequired
}
