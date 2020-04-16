import classNames from 'classnames'
import React, { Component } from 'react'
import { ALERT, stateAction } from '../../common/actions'
import { SUCCESS } from '../../common/constants'
import fetch from '../../common/fetch'
import { isEmpty, logRender } from '../../common/utils'
import { ACTIVE } from '../../common/variables'
import Placeholder from '../../components/Placeholder'
import ScrollView from '../../components/ScrollView'
import Spinner from '../../components/Spinner'
import Text from '../../components/Text'
import View from '../../components/View'
import Render from '../../components/views/Render'
import { POPUP } from '../../modules/exports'
import { withUISetup } from './rules'

const DATA_URL = 'http://mnsopenl.exigengroup.com:9998/std-rating-report/ExtractRatingDetails'
const META_URL = 'http://mnsopenl.exigengroup.com:9998/ui-config/GeneratePageStructure'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export default class WebStudioPage extends Component {
  state = {
    loadingData: true,
    loadingMeta: true,
  }

  componentDidMount () {
    this.fetch(DATA_URL)
      .then(data => this.setState({loadingData: false, data}))
      .catch(this.popup)
    this.fetch(META_URL)
      .then(meta => this.setState({loadingMeta: false, meta}))
      .catch(this.popup)
  }

  fetch = async (url) => {
    const data = {method: 'POST', body: {}, headers: {'Content-Type': 'application/json'}}
    const {payload, meta: {result} = {}} = await fetch(url, data)
    if (result === SUCCESS) return payload
    if (result != null) throw Error(result)
  }

  popup = (error) => ACTIVE.store.dispatch(stateAction(POPUP, ALERT, {
    items: [{
      title: 'Fetch Error',
      content: <Text>{String(error)}</Text>
    }]
  }))

  render () {
    const {loadingData, loadingMeta, data, meta} = this.state
    this.hasData = !isEmpty(data)
    this.hasMeta = !isEmpty(meta)
    return (
      <View fill>
        {this.hasData && this.hasMeta
          ? <WebStudio data={data} meta={meta} initialValues={data}/>
          : <Placeholder>
            {!this.hasData &&
            <Text className={classNames('h1', {error: !loadingData, blink: loadingData})}>
              {loadingData ? <Text><Spinner size='large'/> Loading...</Text> : 'Missing'} *_data.json
            </Text>
            }
            {!this.hasMeta &&
            <Text className={classNames('h1', {error: !loadingMeta, blink: loadingMeta})}>
              {loadingMeta ? <Text><Spinner size='large'/> Loading...</Text> : 'Missing'} *_meta.json
            </Text>
            }
          </Placeholder>
        }
      </View>
    )
  }
}

@withUISetup({form: 'WebStudio'})
@logRender
export class WebStudio extends Component {
  state = {
    data: {
      json: this.props.data
    },
    meta: {
      json: this.props.meta
    }
  }

  render () {
    return (
      <ScrollView fill className='fade-in bg-neutral'>
        <form onSubmit={this.handleSubmit}>
          {this.hasData && this.hasMeta && <Render data={this.data} {...this.meta}/>}
        </form>
      </ScrollView>
    )
  }
}
