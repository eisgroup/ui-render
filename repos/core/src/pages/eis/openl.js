import React, { Component } from 'react'
import { connect } from '../../common/redux'
import { logRender } from '../../common/utils'
import ScrollView from '../../components/ScrollView'
import Render, { metaToProps } from '../../components/views/Render'
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
  static defaultProps = {
    data,
    meta: metaToProps(meta, data),
  }

  render () {
    const {data, meta} = this.props
    console.warn('meta', meta)
    return (
      <>
        <ScrollView fill className='fade-in'>
          <Render data={data} {...meta}/>
        </ScrollView>

        {/*<ScrollView className='padding bg-neutral inverted'>*/}
        {/*  <Json data={meta} inverted/>*/}
        {/*</ScrollView>*/}
      </>
    )
  }
}
