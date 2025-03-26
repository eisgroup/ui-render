import React from 'react'
import { SizeMe } from 'react-sizeme'

/**
 * React Component Responsive Size Decorator that provides available `width` and `height` props
 * @example:
 *    @withResponsiveSize
 *    class Container extends Component {
 *      render () {
 *        const { width, height } = this.props
 *        return (
 *          <canvas width={width} height={height}/>
 *        )
 *      }
 *    }
 */
export function withResponsiveSize (Component) {
  // SizeMe will attempt to render placeholder (wrapped component) first to detect width and height.
  // The placeholder till take className and style applied to wrapped component.
  return function ResponsiveWrapper (props) {
    return (
      <SizeMe monitorWidth monitorHeight children={({size: {width, height}}) => (
        // <View fill className='responsive-size'>
        //   <View className='position-fill'>
        <Component {...{width, height, ...props}} />
        // </View>
        // </View>
      )}/>
    )
  }
}
