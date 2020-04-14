import React, { Component } from 'react'
import { SUCCESS } from '../../common/constants'
import fetch from '../../common/fetch'
import { logRender, warn } from '../../common/utils'
import Placeholder from '../../components/Placeholder'
import ScrollView from '../../components/ScrollView'
import Text from '../../components/Text'
import Render from '../../components/views/Render'
import data from './data/std-rate_data'
import meta from './data/std-rate_meta'
import { transformConfig, withUISetup } from './rules'

const META_URL = 'http://mnsopenl.exigengroup.com:9998/ui-config/GeneratePageStructure'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
@withUISetup({form: 'WebStudio'})
@logRender
export default class Webstudio extends Component {
  state = {
    data: {
      json: data,
    },
    meta: {
      json: transformConfig(meta),
    },
  }

  fetchMeta = async () => {
    const data = {method: 'POST', body: {}, headers: {'Content-Type': 'application/json'}}
    const {payload, meta: {result} = {}} = await fetch(META_URL, data)
    if (result === SUCCESS) this.metaUpdate(payload)
  }

  componentDidMount () {
    this.fetchMeta().catch(warn)
  }

  render () {
    const {data} = this.state
    return (
      <ScrollView fill className='fade-in bg-neutral'>
        <form onSubmit={this.handleSubmit}>
          {this.hasData && this.hasMeta
            ? <Render data={data.json} {...this.meta}/>
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
