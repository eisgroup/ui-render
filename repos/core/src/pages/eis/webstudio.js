import React, { Component } from 'react'
import { SUCCESS } from '../../common/constants'
import fetch from '../../common/fetch'
import { logRender } from '../../common/utils'
import Loading from '../../components/Loading'
import Placeholder from '../../components/Placeholder'
import ScrollView from '../../components/ScrollView'
import Text from '../../components/Text'
import View from '../../components/View'
import Render from '../../components/views/Render'
import data from './data/webstudio_data'
import meta from './data/webstudio_meta'
import { transformConfig, withUISetup } from './rules'

const DATA_URL = 'http://mnsopenl.exigengroup.com:9998/std-rating-report/ExtractRatingDetails'
const META_URL = 'http://mnsopenl.exigengroup.com:9998/ui-config/GeneratePageStructure'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
@withUISetup({form: 'WebStudio', initialValues: data})
@logRender
export default class Webstudio extends Component {
  state = {
    loading: {
      data: true,
      meta: true,
    },
    data: {
      json: data,
    },
    meta: {
      json: transformConfig(meta),
    },
  }

  fetch = async (url, callback) => {
    const data = {method: 'POST', body: {}, headers: {'Content-Type': 'application/json'}}
    const {payload, meta: {result} = {}} = await fetch(url, data)
    if (result === SUCCESS) callback(payload)
  }

  componentDidMount () {
    // this.fetch(DATA_URL, this.dataUpdate.bind(this)).catch(warn)
    // this.fetch(META_URL, this.metaUpdate.bind(this)).catch(warn)
  }

  render () {
    const {loading} = this.state
    console.warn('this.state', this.state)
    return (
      <ScrollView fill className='fade-in bg-neutral'>
        <form onSubmit={this.handleSubmit}>
          {this.hasData && this.hasMeta
            ? <Render data={this.data} {...this.meta}/>
            : <Placeholder>
              {!this.hasData && (
                <View fill className='align-center'>
                  {loading.data
                    ? <Loading fill isLoading>Loading *_data.json</Loading>
                    : <Text className='h1 error'>Missing *_data.json</Text>
                  }
                </View>
              )}
              {!this.hasMeta && (
                <View fill className='align-center'>
                  {loading.meta
                    ? <Loading fill isLoading>Loading *_meta.json</Loading>
                    : <Text className='h1 error'>Missing *_meta.json</Text>
                  }
                </View>
              )}
            </Placeholder>
          }
        </form>
      </ScrollView>
    )
  }
}
