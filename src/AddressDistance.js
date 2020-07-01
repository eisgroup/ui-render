import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { distanceBetween } from 'utils-pack/utility'
import Icon from './Icon'
import { renderFloat } from './renders'
import Text from './Text'

/**
 * Show Distance in km away if given, or address of the place, with toggle option
 */
export default function AddressDistance
  ({
    address,
    distance, // from user location
    location, // geo location of given address
    point, // user geo location to calculate distance from given `address`, if `distance` not given
    unit = 'km',
    className,
    style,
  }) {
  if (distance == null && point && location) distance = distanceBetween(location, point, unit)
  const hasDistance = distance != null
  const [isDistance, toggleDisplay] = useState(hasDistance)
  return (
    <Text className={classNames('app__address-distance p', className)} style={style}>
      <Icon name={isDistance ? 'pin' : 'location'}/>
      {isDistance ? <>{renderFloat(distance || 0, distance < 10 ? 1 : 0)}{`${unit} away`}</> : address}
      {hasDistance &&
      <Text key={isDistance} className='a margin-left-smaller' onClick={() => toggleDisplay(!isDistance)}>
        {'- show ' + (isDistance ? 'address' : 'distance')}
      </Text>}
    </Text>
  )
}

AddressDistance.propTypes = {
  address: PropTypes.string.isRequired,
  location: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  point: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  distance: PropTypes.number,
  unit: PropTypes.oneOf(['km', 'm', 'mm']),
  className: PropTypes.string,
  style: PropTypes.string,
}

