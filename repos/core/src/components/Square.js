import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { SizeMe } from 'react-sizeme'
import Row from './Row'
import View from './View'

/**
 * Square Container (using pure CSS, may not work on some flex layout) - Pure Component
 * (Render inner content as a square, resizing to fit dynamic width and height from parent)
 * @Note: alternatively use @asSquare decorator, which works cross platform, but may not resize when screen shrinks
 */
export default function Square ({
  top, right, bottom, left,
  children, className, classNameInner, styleInner,
  width = 1, height = 1, // ratio used to render rectangle (must be whole integer), default is square
  ...p
}) {
  const positioning = position({top, right, bottom, left})
  return (
    <View fill className={classNames('square', className, positioning)} {...p}>
      <View>
        <canvas width={width} height={height}/>
        <View className={classNames('square__inner position-fill', positioning)}>
          <View>
            <canvas width={width} height={height}/>
            <View className={classNames('square__inner position-fill', classNameInner)} style={styleInner}>
              {children}
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

Square.propTypes = {
  center: PropTypes.bool,
  middle: PropTypes.bool,
  right: PropTypes.bool,
  bottom: PropTypes.bool,
  className: PropTypes.string,
  classNameInner: PropTypes.string,
  styleInner: PropTypes.string,
  children: PropTypes.any
}

Square.View = asSquare(View)
Square.Row = asSquare(Row)

/**
 * React Component Decorator (HOC) to Render as Square, taking all available width and height
 * @example:
 *    @asSquare
 *    class UploadGrid extends Component {
 *       //...
 *    }
 *
 * @param {Class|Function} Component - to render as square
 */
export function asSquare (Component) {
  return function Square ({top, right, bottom, left, ...props}) {
    return <SizeMe monitorHeight children={({size: {width, height}}) => {
      const size = Math.floor(Math.min(width || 0, height || 0))
      // SizeMe will attempt to render placeholder (wrapped component) first to detect width and height.
      // The placeholder till take className and style applied to wrapped component.
      // We need two wrapper components to minimize re-renders, because React does not allow mutating this.props
      return <View fill className={classNames('square-placeholder', position({top, right, bottom, left}))}>
        <View className='square' style={{width: size, height: size}}>
          <Component {...props}/>
        </View>
      </View>
    }}/>
  }
}

function position ({top, right, bottom, left}) {
  return {middle: !bottom && !top, center: !left && !right, top, right, bottom, left}
}
