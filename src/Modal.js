import classNames from 'classnames'
import React from 'react'
import View from './View'

/**
 * Modal - Pure Component
 */
export default function Modal
  ({
     isOpen = false,
     canClose = true,
     onClose,
     className,
     children
   }) {
  return (
    <View className={'app__modal fade-in' + (isOpen ? ' active' : '')}>
      <View
        className='app__modal__backdrop no-outline'
        onClick={() => canClose && onClose && onClose()}
      />
      {isOpen &&
      <View className={classNames('app__modal__box', className)}>
        <View className='app__modal__box__content'>
          {children}
        </View>
      </View>
      }
    </View>
  )
}
