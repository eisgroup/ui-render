import React, { useContext } from 'react'
import { createPortal } from 'react-dom'
import Button from 'ui-react-pack/Button'
import Text from 'ui-react-pack/Text'
import View from 'ui-react-pack/View'
import { l, localiseTranslation } from 'ui-utils-pack'
import { _ } from 'ui-utils-pack/translations'
import { AppContext } from '../../../contexts'

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
    const popup = useContext(AppContext)
    const { isOpen, title, content, togglePopupState } = popup
    const activeClass = isOpen ? ' active' : ''

    if (!isOpen) return null

    return createPortal(
            <View 
                className={'app__popup' + activeClass}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}
            >
                <View
                    className="app__popup__backdrop no-outline"
                    onClick={togglePopupState}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)'
                    }}
                />
                <View 
                    className={'app__popup__box zoomin'}
                    style={{
                        position: 'relative',
                        zIndex: 1001,
                        maxWidth: '90%',
                        maxHeight: '90%',
                        overflow: 'auto',
                        marginTop: 0
                    }}
                >
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