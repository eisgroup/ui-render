import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import autofill from 'react-autofill'
import Helmet from 'react-helmet'
import { logRender } from '../../common/utils'
import { APP_NAME } from '../../common/variables'
import Button from '../../components/Button'
import { withGql } from '../../components/graphql'
import Icon from '../../components/Icon'
import Row from '../../components/Row'
import ScrollView from '../../components/ScrollView'
import Text from '../../components/Text'
import View from '../../components/View'
import { reduxForm } from '../form'
import { InputField } from '../form/fields'
import { password } from '../form/validationRules'
import { tracking } from '../tracking/utils'
import { USER_LOGIN } from './constants'
import { login, signup } from './mutations'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
@logRender
export default class LoginView extends Component {
  state = {
    isLogin: true,
  }

  toggleSignin = () => {
    this.setState({isLogin: !this.state.isLogin})
  }

  render () {
    const {isLogin} = this.state
    const SinginForm = isLogin ? LoginForm : SignupForm
    return (
      <View
        className='app__page app__page--login fade-in bg-texture full-width max-width-360 margin-auto radius-large'>
        <Helmet title={`Login or Register with ${APP_NAME}`}/>
        <ScrollView fill>
          <View className='app__modal__box__header radius-top-large'>
            <Row className='app__modal__box__header__title no-padding no-margin center'>
              <Text fill className={classNames('padding padding-top-large', {'bg-white': !isLogin, primary: !isLogin})}
                    onClick={!isLogin && this.toggleSignin}>Login</Text>
              <Text fill className={classNames('padding padding-top-large', {'bg-white': isLogin, primary: isLogin})}
                    onClick={isLogin && this.toggleSignin}>Signup</Text>
            </Row>
          </View>
          <View className='app__modal__box__body' style={{zIndex: 1}}>
            <SinginForm isLogin={isLogin}/>
            <Row className='middle fill-width'>
              <View className='fill-width margin-smallest border-gradient-top-left-grey'/>
              <Text className='margin-smallest fade'>OR</Text>
              <View className='fill-width margin-smallest border-gradient-top-right-grey'/>
            </Row>
            <View className='margin-v padding-v'>
              <Button className='margin-v-smaller round instagram'>
                <Icon name='instagram' className='margin-right'/>Instagram Sign In
              </Button>
              <Button className='margin-v-smaller round facebook'>
                <Icon name='facebook' className='margin-right'/>Facebook Sign In
              </Button>
              <Button className='margin-v-smaller round vk'>
                <Icon name='vk' className='margin-right'/>VK Sign In
              </Button>
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }
}

@reduxForm({form: USER_LOGIN, enableReinitialize: false})
@autofill
class SigninForm extends Component {
  static propTypes = {
    isLogin: PropTypes.bool, // whether to render Login or Signup form
  }

  /**
   * Handle Redux-Form submit, which expects a promise return value
   */
  submit = ({...variables}) => {
    const {key, val} = tracking.getReferrer()
    if (key && val) variables.referrer = {key, val}
    return this.props.mutate({variables})
  }

  componentDidMount () {
    this.props.autofill()  // fix autofill bug not syncing with redux-form
  }

  render () {
    const {isLogin, handleSubmit, submitting, valid} = this.props
    return (
      <form onSubmit={handleSubmit(this.submit)} className='app__form margin-top-smaller'>
        <InputField
          float required
          type='email'
          name='email'
          error='Please enter a valid Email address'
          className='no-margin'
        />
        <InputField
          float required
          type='password'
          name='password'
          error='Password is too weak! Should be at least 8 characters long, with symbol, number, upper and lower case letters'
          validate={password}
        />
        {!isLogin &&
        <InputField
          float required
          type='password'
          name='confirm password'
          validate={password.confirm}
        />
        }
        <InputField name="_gotcha" style={{display: 'none'}}/>
        <View className='margin-v align-center'>
          <Button type='submit' className='margin-v basic primary bg-white' loading={submitting} disabled={!valid}>
            {isLogin ? 'Login' : 'Signup'}
          </Button>
        </View>
      </form>
    )
  }
}

const LoginForm = withGql({mutation: login})(SigninForm)
const SignupForm = withGql({mutation: signup})(SigninForm)
