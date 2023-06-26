import classNames from 'classnames'
import React, { Component } from 'react'
import { type } from 'ui-react-pack'
import Button from 'ui-react-pack/Button'
import Text from 'ui-react-pack/Text'
import View from 'ui-react-pack/View'
import { l, localiseTranslation } from 'ui-utils-pack'
import { _ } from 'ui-utils-pack/translations'
import { PopupContext } from '../rules'

localiseTranslation({
  CANCEL: {
    [l.ENGLISH]: 'Cancel',
  },
  CONFIRM: {
    [l.ENGLISH]: 'Confirm',
  },
  CONFIRM_ACTION: {
    [l.ENGLISH]: 'Confirm Action',
  },
  ERROR_excMark: {
    [l.ENGLISH]: 'Error!',
  },
})


export default class Popup extends Component {
  static contextType = PopupContext
  static propTypes = {
    // Whether Popup can be closed by clicking outside around greyed out background area
    canClose: type.Boolean,
    // Callback(this) class instance when close action is fired
    onClose: type.Method,
    // Callback(this) class instance for rendering close Button, for example
    renderClose: type.Method,
  }


  render () {
    const {
      activePopups,
      alert,
      error,
      confirm,
      actions,
      ui: {className} = {},
      canClose,
      onClose,
      ...props
    } = this.props

    return (
      <PopupContext.Consumer>
        {(context) => {
          const { isOpen, togglePopupState, title, content} = context

          const activeClass = isOpen ? ' active' : ''

          return (
            <View className={'app__popup' + activeClass}>
              <View
                className="app__popup__backdrop no-outline"
                onClick={togglePopupState}
              />
              <View className={classNames('app__popup__box zoomin', className)}>
                <View className="app__popup__box__content">
                  {isOpen && (
                    <>
                      <View className="app__popup__box__header">
                        <Text className="app__popup__box__header__title">{title}</Text>
                      </View>
                      <View className="app__popup__box__body">
                        {typeof content === 'string' ? <Text className="p center">{content}</Text> : content}
                      </View>
                      <View className="app__popup__box__footer center">
                        <Button onClick={togglePopupState} className="primary">{_.OK}</Button>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </View>
          )
        }}
      </PopupContext.Consumer>
    )
  }
}
