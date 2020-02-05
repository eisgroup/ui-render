import React, { Component } from 'react'
import { connect } from '../../common/redux'
import { logRender, warn } from '../../common/utils'
import { FIELD } from '../../common/variables'
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

  state = {
    reset: (FIELD.FUNC[FIELD.ACTION.RESET] = this.resetForm), // must be declared before using `metaToProps`
    data,
    active: {
      plan: 1,
    },
  }

  /**
   * Handle Redux-Form submit, which expects a promise return value
   */
  submit = (values) => {
    return warn('submit!!!', values)
  }

  handleSubmit = this.props.handleSubmit(this.submit)

  render () {
    const {data} = this.state
    const props = metaToProps(meta, data, this)
    console.warn('props', props)
    return (
      <>
        <ScrollView fill className='fade-in bg-texture'>
          <form onSubmit={this.handleSubmit}>
            <Render data={data} {...props}/>
          </form>
        </ScrollView>

        {/*<ScrollView className='padding bg-neutral inverted'>*/}
        {/*  <Json data={meta} inverted/>*/}
        {/*</ScrollView>*/}
      </>
    )
  }
}
