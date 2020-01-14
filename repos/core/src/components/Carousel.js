import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { formatDuration } from '../common/utils'
import Icon from './Icon'
import { imageSrc } from './Image'
import Loading from './Loading'
import Row from './Row'
import ScrollView from './ScrollView'
import Square from './Square'
import Text from './Text'
import { withTimer } from './utils'
import View from './View'

/**
 * Carousel - Self Contained Container.
 */
@withTimer
export default class Carousel extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.shape({
        avatar: PropTypes.string, // small image url
        src: PropTypes.string, // full image url
      }),
      PropTypes.shape({ // same as Image.propTypes
        name: PropTypes.string.isRequired,
        path: PropTypes.string,
      }),
    ])).isRequired,
    activeIndex: PropTypes.number,
    hideImage: PropTypes.bool, // whether to hide background image for active item
    hideItems: PropTypes.bool, // whether to hide list of items below
    hideCount: PropTypes.bool, // whether to hide item count at the top left
    hideControls: PropTypes.bool, // whether to hide prev and next arrows
    square: PropTypes.bool, // whether to render as square
    className: PropTypes.string,
    itemClass: PropTypes.string, // css class names to add to active item
    childrenRender: PropTypes.any, // function to render content inside Carousel, receives active item props as argument
    children: PropTypes.any, // extra content to render inside Carousel
  }

  state = {
    activeIndex: 0,
    transition: false,
  }

  handleClickItem = (index) => {
    this.setState({ transition: true })
    this.setTimeout(() => {
      this.setState({ activeIndex: index, transition: false })
    }, 50)
  }

  handleClickPrev = () => {
    let { activeIndex } = this.state
    activeIndex = activeIndex ? activeIndex - 1 : this.props.items.length - 1
    this.handleClickItem(activeIndex)
  }

  handleClickNext = () => {
    let { activeIndex } = this.state
    activeIndex = (activeIndex === this.props.items.length - 1) ? 0 : activeIndex + 1
    this.handleClickItem(activeIndex)
  }

  componentDidMount () {
    const { activeIndex } = this.props
    if (activeIndex) this.handleClickItem(activeIndex)
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    if (nextProps.activeIndex !== this.props.activeIndex) this.handleClickItem(nextProps.activeIndex)
  }

  render () {
    const {
      items,
      hideImage, hideItems, hideCount, hideControls,
      itemClass, childrenRender, children, className, style, fill, square,
      loading = false,
    } = this.props
    const {activeIndex, transition} = this.state
    if (!items.length) return null
    const activeItem = items[activeIndex]
    const backgroundImage = !hideImage ? `url('${imageSrc(activeItem)}')` : ''
    const {time} = items[activeIndex]
    const dateAgo = time ? formatDuration(Date.now() - time, {shorten: true, largest: 1}) : ''
    const Canvas = square ? Square.Row : Row
    return (
      <View fill={fill} className={classNames('carousel fade-in', className, {loading})} style={style}>
        <Canvas fill className={classNames('carousel__image', {'fade-in': !transition}, itemClass)}
                style={{backgroundImage}}>
          {!hideCount && <Text className='carousel__image__count'>{activeIndex + 1}/{items.length}</Text>}
          {dateAgo && <Text className='carousel__image__date'>{dateAgo}</Text>}
          {items.length > 1 && !hideControls &&
          <>
            <Icon className='carousel__control prev' name='chevron-left' onClick={this.handleClickPrev}/>
            <Icon className='carousel__control next' name='chevron-right' onClick={this.handleClickNext}/>
          </>}
          {childrenRender ? childrenRender(activeItem, activeIndex) : children}
        </Canvas>
        {!hideItems && items.length > 1 &&
        <ScrollView row center className='carousel__items'>
          {items.map(({name, path}, index) => {
            const style = {backgroundImage: `url('${imageSrc({name, path})}')`}
            const active = index === activeIndex
            return <View
              key={name || index}
              className={classNames('carousel__item', {active})} style={style}
              onClick={!active && (() => this.handleClickItem(index))}
            />
          })}
        </ScrollView>
        }
        {loading && <Loading/>}
      </View>
    )
  }
}
