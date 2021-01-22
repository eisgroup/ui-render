import classNames from 'classnames'
import { withForm } from 'modules-pack/form'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import autofill from 'react-autofill'
import Helmet from 'react-helmet'
import Button from 'react-ui-pack/Button'
import { withGql } from 'react-ui-pack/graphql'
import Icon from 'react-ui-pack/Icon'
import Row from 'react-ui-pack/Row'
import ScrollView from 'react-ui-pack/ScrollView'
import Text from 'react-ui-pack/Text'
import View from 'react-ui-pack/View'
import { LOGIN, stateAction, SUCCESS } from '../../../common/actions'
import { connect } from '../../../common/redux'
import { get, isEmpty, logRender, toUpperCase, warn } from '../../../common/utils'
import { _, APP_NAME, ROUTE } from '../../../common/variables'
import { ReferralStatus } from '../../../containers/Referral'
import { InputField } from '../../form/inputs'
import { email, isRequired, password } from '../../form/validationRules'
import history from '../../router/history'
import { tracking } from '../../tracking/utils'
import { resetUser } from '../actions'
import { login, signup } from '../mutations'
import select from '../selectors'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapStateToProps = (state) => ({
  isLogin: !!select.id(state),
})

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * Login or Signup with Social Plugins
 * -----------------------------------------------------------------------------
 */
@connect(mapStateToProps)
@logRender
export default class LoginPage extends Component {
  state = {
    isLogin: this.props.isLogin,
    hasSocial: false,
  }

  // Signup success has different flow defined in mutation
  handleLoginSuccess = (user) => {
    this.props.dispatch(stateAction(LOGIN, SUCCESS, user))
  }

  toggleSignin = () => {
    this.setState({isLogin: !this.state.isLogin})
  }

  render () {
    const {isLogin, hasSocial} = this.state
    const SinginForm = isLogin ? LoginForm : SignupForm
    return (
      <View
        className='app__page app__page--login fade-in bg-grey bg-texture full-width max-width-360 margin-auto radius-large'>
        <Helmet title={`${_.LOGIN} ${_.OR} ${_.SIGNUP} - ${APP_NAME}`}/>
        <ScrollView fill>
          <View className='app__modal__box__header radius-top-large'>
            <Row className='app__modal__box__header__title no-padding no-margin center'>
              <Text fill className={classNames('padding padding-top-large', {'bg-white': !isLogin, primary: !isLogin})}
                    onClick={!isLogin && this.toggleSignin}>{_.LOGIN_noun}</Text>
              <Text fill className={classNames('padding padding-top-large', {'bg-white': isLogin, primary: isLogin})}
                    onClick={isLogin && this.toggleSignin}>{_.SIGNUP_noun}</Text>
            </Row>
          </View>
          <View className='app__modal__box__body' style={{zIndex: 1}}>
            <SinginForm isLogin={isLogin} onSuccess={this.handleLoginSuccess}/>
            {hasSocial &&
            <Row className='middle fill-width'>
              <View className='fill-width margin-smallest border-gradient-top-left-grey'/>
              <Text className='margin-smallest fade'>{toUpperCase(_.OR)}</Text>
              <View className='fill-width margin-smallest border-gradient-top-right-grey'/>
            </Row>
            }
            {hasSocial &&
            <View className='margin-v padding-v'>
              <Button className='margin-v-smaller round instagram'>
                <Icon name='instagram' className='margin-right'/>{_.INSTAGRAM} {_.LOGIN_noun}
              </Button>
              <Button className='margin-v-smaller round facebook'>
                <Icon name='facebook' className='margin-right'/>{_.FACEBOOK} {_.LOGIN_noun}
              </Button>
              <Button className='margin-v-smaller round vk'>
                <Icon name='vk' className='margin-right'/>{_.VK} {_.LOGIN_noun}
              </Button>
            </View>
            }
          </View>
        </ScrollView>
      </View>
    )
  }
}

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * Generic Sign In Form (as Login or Signup)
 * -----------------------------------------------------------------------------
 */
@withForm()
@autofill
class SigninForm extends Component {
  static propTypes = {
    isLogin: PropTypes.bool, // whether to render Login or Signup form
    onSuccess: PropTypes.func, // callback on login/signup success
  }
  state = {
    referrer: tracking.getReferrer() || {},
  }

  componentDidMount () {
    this.props.autofill()  // fix autofill bug not syncing with redux-form
  }

  /**
   * Handle Redux-Form submit, which expects a promise return value
   */
  submit = ({...variables}) => {
    const {key, val} = tracking.getReferrer()
    if (key && val) variables.referrer = {key, val}
    return this.props.mutate({variables})
      .then(result => {
        // Mutation can come from `login` or `signup`
        // Invalid credentials will trigger GraphQL error popup, and this does not get called
        const user = get(result, 'data.login', {}) // if signup, `data.login` will be undefined

        // Only handle signup case, because `login` flow is handled by `loginSuccessFlow` saga
        if (isEmpty(user)) {
          resetUser(get(result, 'data.signup', {}))
          history.push(ROUTE.REGISTER)
        } else {
          this.props.onSuccess && this.props.onSuccess(user)
        }

        return user
      })
      .catch(warn)
  }

  handleSubmit = this.props.handleSubmit(this.submit)

  handleResetReferrer = () => {
    tracking.resetReferrer()
    this.setState({referrer: tracking.getReferrer() || {}})
  }

  render () {
    const {isLogin, submitting, valid} = this.props
    const {referrer} = this.state
    return (
      <form onSubmit={this.handleSubmit} className='app__form margin-top-smaller'>
        <InputField
          float required
          type='email'
          name='email'
          label={_.EMAIL}
          validate={[isRequired, email]}
          className='no-margin'
        />
        <InputField
          float required
          type='password'
          name='password'
          label={_.PASSWORD}
          error={_.PASSWORD_IS_TOO_WEAK_SHOULD_BE_AT_LEAST_8_CHARACTERS_LONG_WITH_SYMBOL_NUMBER_UPPER_AND_LOWER_CASE_LETTERS}
          validate={[isRequired, password]}
        />
        {!isLogin &&
        <InputField
          float required
          type='password'
          name='confirm password'
          label={_.CONFIRM_PASSWORD}
          validate={[isRequired, password.confirm]}
        />
        }
        <InputField name="_gotcha" style={{display: 'none'}}/>
        {!isLogin && referrer.val && <ReferralStatus className='margin-v' onReset={this.handleResetReferrer}/>}
        <View className='margin-v align-center'>
          <Button type='submit' className='margin-v basic primary bg-white' loading={submitting} disabled={!valid}>
            {isLogin ? _.LOGIN : _.SIGNUP}
          </Button>
        </View>
      </form>
    )
  }
}

const LoginForm = withGql({mutation: login})(SigninForm)
const SignupForm = withGql({mutation: signup})(SigninForm)
