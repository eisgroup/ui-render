import classNames from '../utils/classNames'
import PropTypes from 'prop-types'
import React, { useRef, useState } from 'react'
import { ENGINE_PROPS, FIELD_ONLY_PROPS, omitProps } from './domProps'

/** The named props are read here; the rest is spread onto the inner `<div>` through ./domProps (see `ViewProps`). */
export type ScrollViewProps = {
  /** CSS classes to apply */
  className?: string
  /** CSS classes to apply to inner wrapper */
  classNameInner?: string
  /** CSS to apply */
  style?: React.CSSProperties
  /** CSS to apply to inner wrapper */
  styleInner?: React.CSSProperties
  /** Whether to render children as <Row /> */
  row?: boolean
  /** Whether to make the view fill up available height and width */
  fill?: boolean
  /** Whether to reverse order of rendering */
  reverse?: boolean
  /** Whether to use right to left direction */
  rtl?: boolean
  /** Whether to center align content */
  center?: boolean
  /** Dropped, never forwarded */
  tab?: unknown
  /** Forwarded to the inner `<div>`; its presence adds the `pointer` class */
  onClick?: React.MouseEventHandler<HTMLDivElement>
  children: React.ReactNode
  [key: string]: unknown
}

/**
 * View with Custom Scroll Bar - Pure Component
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
}: ScrollViewProps) => {
  const thisRef = useRef<HTMLDivElement>(null)
  const [scrollYPosition, setScrollYPosition] = useState(0)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.target === thisRef.current) {
      // The cast is what the comparison above established: the target is this component's own <div>.
      setScrollYPosition((e.target as HTMLDivElement).scrollLeft)
    }
  }

  // DOM boundary: the inner spread below lands on a <div>. This is the shell every example
  // renders through, so the engine's own props arrive here. See ./domProps.ts.
  const domProps = omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS)

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
        {...domProps}
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
