import React, { Component } from 'react'
import { SUCCESS } from '../../common/constants'
import fetch from '../../common/fetch'
import { logRender, warn } from '../../common/utils'
import Placeholder from '../../components/Placeholder'
import ScrollView from '../../components/ScrollView'
import Text from '../../components/Text'
import Render from '../../components/views/Render'
import data from './data/webstudio_data'
import { withUISetup } from './rules'

const DATA_URL = 'http://mnsopenl.exigengroup.com:9998/std-rating-report/ExtractRatingDetails'
const META_URL = 'http://mnsopenl.exigengroup.com:9998/ui-config/GeneratePageStructure'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
@withUISetup({form: 'WebStudio', initialValues: data})
@logRender
export default class Webstudio extends Component {
  // state = {
  //   data: {
  //     json: data,
  //   },
  //   meta: {
  //     json: transformConfig(meta),
  //   },
  // }

  fetch = async (url, callback) => {
    const data = {method: 'POST', body: {}, headers: {'Content-Type': 'application/json'}}
    const {payload, meta: {result} = {}} = await fetch(url, data)
    if (result === SUCCESS) callback(payload)
  }

  componentDidMount () {
    this.fetch(DATA_URL, this.dataUpdate.bind(this)).catch(warn)
    this.fetch(META_URL, this.metaUpdate.bind(this)).catch(warn)
  }

  render () {
    return (
      <ScrollView fill className='fade-in bg-neutral'>
        <form onSubmit={this.handleSubmit}>
          {this.hasData && this.hasMeta
            ? <Render data={this.data} {...this.meta}/>
            : <Placeholder>
              {!this.hasData && <Text className='h1 error'>Missing *_data.json</Text>}
              {!this.hasMeta && <Text className='h1 error'>Missing *_meta.json</Text>}
            </Placeholder>
          }
        </form>
      </ScrollView>
    )
  }
}
