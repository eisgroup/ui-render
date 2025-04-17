import React, { useContext } from 'react'
import { createPortal } from 'react-dom'
import Button from 'ui-react-pack/Button'
import Text from 'ui-react-pack/Text'
import View from 'ui-react-pack/View'
import { l, localiseTranslation } from 'ui-utils-pack'
import { _ } from 'ui-utils-pack/translations'
import { PopupContext } from '../../../contexts/PopupContext'

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

const Popup = () => {
    const popup = useContext(PopupContext)
    const { isOpen, title, content, togglePopupState } = popup
    const activeClass = isOpen ? ' active' : ''

    if (!isOpen) return null

    return createPortal(
            <View className={'app__popup' + activeClass}>
                <View
                    className="app__popup__backdrop no-outline"
                    onClick={togglePopupState}
                />
                <View className={'app__popup__box zoomin'}>
                    <View className="app__popup__box__content">
                        {isOpen && (
                            <>
                                <View className="app__popup__box__header">
                                    <Text className="app__popup__box__header__title">{title}</Text>
                                </View>
                                <View className="app__popup__box__body">
                                    {typeof content === 'string' ? <Text
                                        className="p center">{content}</Text> : content}
                                </View>
                                <View className="app__popup__box__footer center">
                                    <Button onClick={togglePopupState} className="primary">{_.OK}</Button>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </View>,
            document.getElementById('render-popup-root')
        )
}

    export default Popup