import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import Rating from 'react-rating'
import Text from './Text'

/**
 * Star Rating - Pure Component
 * @docs - https://github.com/dreyescat/react-rating
 *
 * @param {Number} rating - star value (ex.4.5)
 * @param {String} [className] - optional css class names
 * @param {Boolean} [large] - whether to render large stars
 * @param {Boolean} [small] - whether to render small stars
 * @param {*} props - other attributes to pass to component
 * @returns {Object} - React Component
 */
export default function Stars
  ({
     rating,
     className,
     large,
     small,
     ...props
   }) {
  if (props.readonly == null) props.readonly = true
  return <Text className={classNames('stars', className, { large, small })}>
    <Rating
      emptySymbol='icon star-empty'
      fullSymbol='icon star-full'
      initialRating={rating}
      {...props}
    />
  </Text>
}

Stars.propTypes = {
  rating: PropTypes.number.isRequired,
  readonly: PropTypes.bool,
  large: PropTypes.bool,
  small: PropTypes.bool,
  className: PropTypes.string,
}
