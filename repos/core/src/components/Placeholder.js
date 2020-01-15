import PropTypes from 'prop-types'
import React from 'react'
import View from './View'

/**
 * Placeholder - Pure Component.
 */
export default function Placeholder (props) {
  return <View fill className='full-screen middle center expand-v bg-texture' {...props}/>
}

Placeholder.propTypes = {
  children: PropTypes.any.isRequired
}
