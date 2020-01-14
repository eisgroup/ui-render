import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { SOUND } from '../common/variables'
import Button from './Button'

/**
 * Hamburger Style Button animating into Cross - Pure Component.
 *
 * @param {Boolean} [active] - whether to render the cross
 * @param {String} [className] - optional css class name
 * @param {*} [props] - other props
 * @returns {Object} - React button component
 */
export default function MenuButton
  ({
     active,
     className,
     ...props
   }) {
  return (
    <Button
      className={classNames('app__menu__button transparent', {active}, className)}
      aria-label={(active ? 'Close' : 'Open') + ' Menu'}
      sound={SOUND.TOUCH}
      {...props}
    >
      <span className='box'>
        <span className='bar'/>
      </span>
    </Button>
  )
}

MenuButton.propTypes = {
  active: PropTypes.bool,
  className: PropTypes.string,
}

MenuButton.Class = class extends Component {
  render () {
    return <MenuButton {...this.props} />
  }
}
