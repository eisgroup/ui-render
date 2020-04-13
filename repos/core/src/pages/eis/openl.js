import React, { Component } from 'react'
import { ALERT, stateAction } from '../../common/actions'
import fetch from '../../common/fetch'
import { connect } from '../../common/redux'
import { cloneDeep, logRender, set } from '../../common/utils'
import { FIELD } from '../../common/variables'
import Json from '../../components/Json'
import ScrollView from '../../components/ScrollView'
import Render, { metaToProps } from '../../components/views/Render'
import { settings } from '../../modules'
import { POPUP } from '../../modules/exports'
import { reset } from '../../modules/form'
import { withForm } from '../../modules/form/utils'
import data from './data/_data'
import meta from './data/_meta'
import { transformConfig } from './rules'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapStateToProps = (state) => ({
  lang: settings.select.language(state), // to trigger re-render
  meta: transformConfig(meta),
})
const mapDispatchToProps = (dispatch) => ({
  actions: {
    popup: ({content, title}) => dispatch(stateAction(POPUP, ALERT, {items: [{title, content}]})),
  }
})

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
@connect(mapStateToProps, mapDispatchToProps)
@withForm({form: 'TEST', enableReinitialize: true, initialValues: data})
@logRender
export default class OpenL extends Component {
  state = {
    showMeta: false,
    data,
    active: {
      // plan: 1,
    },
  }

  // @Note: functions should have consistent pattern of receiving important arguments first,
  // followed by optional arguments.
  // Positional arguments was chosen instead of keyword arguments because

  resetForm = () => {
    const {dispatch, form} = this.props
    dispatch(reset(form))
  }

  // it provides more flexibility and separation of concerns between different configs.
  setStates = (value, keyPath) => {
    return this.setState(set(this.state, keyPath, value))
  }

  setup = {
    reset: (FIELD.FUNC[FIELD.ACTION.RESET] = this.resetForm), // must be declared before using `metaToProps`
    setState: (FIELD.FUNC[FIELD.ACTION.SET_STATE] = this.setStates), // must be declared before using `metaToProps`
    fetch: (FIELD.FUNC[FIELD.ACTION.FETCH] = fetch), // must be declared before using `metaToProps`
  }

  /**
   * Handle Redux-Form submit, which expects a promise return value
   */
  submit = (values) => {
    return this.props.actions.popup({title: 'Submitted Form with these values', content: <Json data={values}/>})
  }

  handleSubmit = this.props.handleSubmit(this.submit)

  render () {
    const {meta} = this.props
    const {data, showMeta} = this.state
    const props = metaToProps(cloneDeep(meta), data, this)
    console.warn('RENDER!!!')
    return (
      <>
        <ScrollView fill className='fade-in bg-neutral'>
          <form onSubmit={this.handleSubmit}>
            <Render data={data} {...props}/>
          </form>
        </ScrollView>

        {showMeta &&
        <ScrollView className='padding bg-neutral inverted json-tree'>
          <Json data={meta} inverted/>
        </ScrollView>
        }
      </>
    )
  }
}
