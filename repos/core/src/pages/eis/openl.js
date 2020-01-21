import React, { Component } from 'react'
import { logRender } from '../../common/utils'
import ScrollView from '../../components/ScrollView'
import Render, { metaToProps } from '../../components/views/Render'
import { reduxForm } from '../../modules/form'
import data from './data/_data'
import meta from './data/_meta'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
@reduxForm({form: 'TEST', enableReinitialize: true})
@logRender
export default class OpenL extends Component {
  static defaultProps = {
    data,
    meta: metaToProps(meta),
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
