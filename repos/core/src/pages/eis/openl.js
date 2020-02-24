import React, { Component } from 'react'
import fetch from '../../common/fetch'
import { connect } from '../../common/redux'
import { cloneDeep, logRender, set, warn } from '../../common/utils'
import { FIELD } from '../../common/variables'
import Json from '../../components/Json'
import ScrollView from '../../components/ScrollView'
import Render, { metaToProps } from '../../components/views/Render'
import { reset } from '../../modules/form'
import { withForm } from '../../modules/form/utils'
import router from '../../modules/router'
import data from './data/_data'
import meta from './data/_meta'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapStateToProps = (state) => ({
  activeRoute: router.select.activeRoute(state),
  initialValues: data,
})

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
@connect(mapStateToProps)
@withForm({form: 'TEST', enableReinitialize: true})
@logRender
export default class OpenL extends Component {
  resetForm = () => {
    const {dispatch, form} = this.props
    dispatch(reset(form))
  }

  // @Note: functions should have consistent pattern of receiving important arguments first,
  // followed by optional arguments.
  // Positional arguments was chosen instead of keyword arguments because
  // it provides more flexibility and separation of concerns between different configs.
  setStates = (value, keyPath) => {
    this.setState(set(this.state, keyPath, value))
  }

  fetch = async (url, data, callback) => {
    const action = await fetch(url, data)
    if (callback) callback(action)
  }

  state = {
    reset: (FIELD.FUNC[FIELD.ACTION.RESET] = this.resetForm), // must be declared before using `metaToProps`
    setState: (FIELD.FUNC[FIELD.ACTION.SET_STATE] = this.setStates), // must be declared before using `metaToProps`
    fetch: (FIELD.FUNC[FIELD.ACTION.FETCH] = this.fetch), // must be declared before using `metaToProps`
    data,
    active: {
      // plan: 1,
    },
    showMeta: false,
  }

  /**
   * Handle Redux-Form submit, which expects a promise return value
   */
  submit = (values) => {
    return warn('submit!!!', values)
  }

  handleSubmit = this.props.handleSubmit(this.submit)

  render () {
    const {data, showMeta} = this.state
    const props = metaToProps(cloneDeep(meta), data, this)
    console.warn('props', props)
    return (
      <>
        <ScrollView fill className='fade-in bg-texture'>
          <form onSubmit={this.handleSubmit}>
            <Render data={data} {...props}/>
          </form>
        </ScrollView>

        {showMeta &&
        <ScrollView className='padding bg-neutral inverted'>
          <Json data={meta} inverted/>
        </ScrollView>
        }
      </>
    )
  }
}
