import classNames from 'classnames'
import React, { Fragment, PureComponent } from 'react'
import { type } from 'ui-react-pack'
import Button from 'ui-react-pack/Button'
import ErrorContent from 'ui-react-pack/ErrorContent'
import Row from 'ui-react-pack/Row'
import Text from 'ui-react-pack/Text'
import View from 'ui-react-pack/View'
import { CLOSE, hasListValue, isInList, l, localiseTranslation } from 'ui-utils-pack'
import { _ } from 'ui-utils-pack/translations'
import { connect } from '../../redux'
import { stateAction } from '../../redux/actions'
import { POPUP, POPUP_ALERT, POPUP_CONFIRM, POPUP_ERROR } from '../constants'
import select from '../selectors'

localiseTranslation({
  CANCEL: {
    [l.ENGLISH]: 'Cancel',
  },
  CONFIRM: {
    [l.ENGLISH]: 'Confirm',
  },
  CONFIRM_ACTION: {
    [l.ENGLISH]: 'Confirm Action',
    // [l.RUSSIAN]: 'Подтвердите Действие',
  },
  ERROR_excMark: {
    [l.ENGLISH]: 'Error!',
    // [l.RUSSIAN]: 'Ошибка!',
  },
})
/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapStateToProps = (state) => ({
  activePopups: state ? select.activePopups(state) : [],
  alert: state && select.alert(state),
  confirm: state && select.confirm(state),
  error: state && select.error(state),
  ui: state && select.ui(state),
})
const mapDispatchToProps = (dispatch) => ({
  actions: {
    close: (activePopup) => dispatch(stateAction(POPUP, CLOSE, {activePopup}))
  }
})

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
@connect(mapStateToProps, mapDispatchToProps)
export default class Popup extends PureComponent {
  static propTypes = {
    actions: type.Object,
    // Whether Popup can be closed by clicking outside around greyed out background area
    canClose: type.Boolean,
    // Callback(this) class instance when close action is fired
    onClose: type.Method,
    // Callback(this) class instance for rendering close Button, for example
    renderClose: type.Method,
  }

  closeAlert = () => this.props.actions.close(POPUP_ALERT) || this.onClose()
  closeConfirm = () => this.props.actions.close(POPUP_CONFIRM) || this.onClose()
  closeError = () => this.props.actions.close(POPUP_ERROR) || this.onClose()
  closePopup = () => {
    if (this.hasAlert) return this.closeAlert()
    if (this.hasConfirm) return this.closeConfirm()
    if (this.hasError) return this.closeError()
  }
  onClose = () => {
    const {onClose} = this.props
    if (onClose) onClose(this)
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
      renderClose,
      ...props
    } = this.props
    const activeClass = hasListValue(activePopups) ? ' active' : ''
    this.hasAlert = isInList(activePopups, POPUP_ALERT)
    this.hasConfirm = isInList(activePopups, POPUP_CONFIRM)
    this.hasError = isInList(activePopups, POPUP_ERROR)
    return (
      <View className={'app__popup' + activeClass}>
        <View
          className="app__popup__backdrop no-outline"
          onClick={canClose ? this.closePopup : void 0}
        />
        <View className={classNames('app__popup__box zoomin', className)}>
          <View className="app__popup__box__content">
            {renderClose && renderClose(this)}
            {this.hasAlert && alert.items.map(({id, title, content, closeLabel}, index) => (
              <Fragment key={id || index}>
                <View className="app__popup__box__header">
                  <Text className="app__popup__box__header__title">{title}</Text>
                </View>
                <View className="app__popup__box__body">
                  {typeof content === 'string' ? <Text className="p center">{content}</Text> : content}
                </View>
                {!renderClose &&
                <View className="app__popup__box__footer center">
                  <Button onClick={this.closeAlert} className="primary">{closeLabel || _.OK}</Button>
                </View>}
              </Fragment>
            ))}
            {this.hasConfirm && confirm.items.map(({
              id,
              title,
              content,
              cancelLabel,
              confirmLabel,
              confirmClass = 'basic primary',
              action
            }, index) => (
              <Fragment key={id || index}>
                <View className="app__popup__box__header">
                  <Text className="app__popup__box__header__title">{title || _.CONFIRM_ACTION}</Text>
                </View>
                <View className="app__popup__box__body">
                  {typeof content === 'string' ? <Text className="p center">{content}</Text> : content}
                </View>
                <Row className="app__popup__box__footer center">
                  <Button onClick={this.closeConfirm}
                          className="basic grey margin-smaller">{cancelLabel || _.CANCEL}</Button>
                  <Button onClick={() => {
                    this.closeConfirm()
                    action(id)
                  }} className={'margin-smaller ' + confirmClass}>{confirmLabel || _.CONFIRM}</Button>
                </Row>
              </Fragment>
              ))}
            {this.hasError &&
            <Fragment>
              <View className="app__popup__box__header">
                <Text className="app__popup__box__header__title">{error.title || _.ERROR_excMark}</Text>
              </View>
              <View className="app__popup__box__body">
                <ErrorContent items={error.items} {...props}/>
              </View>
              <View className="app__popup__box__footer center">
                <Button onClick={this.closeError} className="primary">{_.OK}</Button>
              </View>
            </Fragment>}
          </View>
        </View>
      </View>
    )
  }
}
