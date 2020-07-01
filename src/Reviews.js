import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { toMonthYear } from 'utils-pack/time'
import Avatar from './Avatar'
import Row from './Row'
import ScrollView from './ScrollView'
import Space from './Space'
import Stars from './Stars'
import Text from './Text'
import View from './View'

/**
 * Review List - Pure Component.
 *
 * @param {Array} items - list of reviews
 * @param {Function} onClickAvatar - callback when user avatar is clicked, receives user id
 * @param {string} [className] - optional css class
 * @param {*} props - other attributes to pass to `<div></div>`
 * @returns {Object} - React Component
 */
export default function Reviews
  ({
     items,
     onClickAvatar,
     className,
     ...props
   }) {
  return (
    <ScrollView className={classNames('reviews', className)} {...props}>
      {items.map(({ id, rating, time, text, user: { id: userId, name, avatar }, }, i) => {
        return (
          <View key={id || i} className='review'>
            <Row className='review__user'>
              <Avatar small hideName name={name} src={avatar} onClick={() => onClickAvatar(userId)}/>
              <View fill className='review__meta left'>
                <Text className='review__name truncate'>{name}</Text>
                <Row className='bottom justify fill-width'>
                  <Stars rating={rating}/>
                  <Text className='review__time'>{toMonthYear(time)}</Text>
                </Row>
              </View>
            </Row>
            <Text className='review__text'>{text}</Text>
          </View>
        )
      })}
      <Space large/>
    </ScrollView>
  )
}

Reviews.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    rating: PropTypes.number.isRequired,
    time: PropTypes.number.isRequired,
    text: PropTypes.any.isRequired,
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string.isRequired,
    }).isRequired,
  })).isRequired,
  onClickAvatar: PropTypes.func.isRequired,
  className: PropTypes.string,
}
