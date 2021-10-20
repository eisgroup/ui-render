import { fetch } from 'modules-pack/api'
import { popupAlert } from 'modules-pack/popup'
import { FIELD } from 'modules-pack/variables'
import React, { Component } from 'react'
import { cn, type } from 'react-ui-pack'
import Placeholder from 'react-ui-pack/Placeholder'
import Spinner from 'react-ui-pack/Spinner'
import Text from 'react-ui-pack/Text'
import { ENV, fromJSON, get, isEmpty, isFunction, isString, SUCCESS } from 'utils-pack'
import UIRender from './rules'

FIELD.ACTION = {
  UPDATE: 'update',
}

// noinspection JSConstantReassignment
/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * todo:
 *  - readonly for classic to disable all inputs (defined in data.json root)
 * -----------------------------------------------------------------------------
 */
export default class WebStudioPage extends Component {
  static propTypes = {
    dataUrl: type.Url,
    metaUrl: type.Url,
  }

  state = {
    loadingData: true,
    loadingMeta: true,
  }

  get id () {
    return get(this.props, 'match.params.id') || ((typeof document !== 'undefined' && document.id) || '')
  }

  get urlPrefix () {
    if (this._urlPrefix != null) return this._urlPrefix
    this._urlPrefix = document.getElementById('ui-render').getAttribute('data-prefix-url') || ''
    if (typeof window !== 'undefined') {
      if (this._urlPrefix) this._urlPrefix = window.location.origin + this._urlPrefix
    }
    return this._urlPrefix
  }

  componentDidMount () {
    /* Use local variables, if set */
    if (typeof window !== 'undefined') {
      const {dataJson, metaJson} = window
      if (dataJson && metaJson) {
        return this.update(dataJson, metaJson)
      } else if (isFunction(window.POST)) {
        FIELD.FUNC[FIELD.ACTION.UPDATE] = this.POST = window.POST
        if (!window.UPDATE) window.UPDATE = this.update
        return window.POST().then(({data, meta}) => this.update(data, meta)).catch(this.popup)
      }
    }

    /* Fetch JSON from external API */
    const {
      dataUrl = this.urlPrefix + ENV.REACT_APP_DATA_URL,
      metaUrl = this.urlPrefix + ENV.REACT_APP_META_URL
    } = this.props
    // todo: remove temporary mock for Policy UI for fetch method
    this.fetch(dataUrl, {body: this.id, contentType: 'text/plain', method: document._dataFetchMethod})
      .then(data => this.setState({loadingData: false, data}))
      .catch(this.popup)
    this.fetch(metaUrl, {contentType: 'application/json'})
      .then(meta => this.setState({loadingMeta: false, meta}))
      .catch(this.popup)
  }

  update = (dataJson, metaJson = null) => {
    const state = {loadingData: false, loadingMeta: false}
    state.data = isString(dataJson) ? fromJSON(dataJson) : dataJson
    if (metaJson) state.meta = isString(metaJson) ? fromJSON(metaJson) : metaJson
    return this.setState(state)
  }

  fetch = async (url, {body = {}, contentType = 'application/json', method = 'POST'}) => {
    const data = {method, body, headers: {'Content-Type': contentType}}

    if (data.method === 'GET') {
      delete data.body
    }

    const {payload, meta: {result} = {}} = await fetch(url, data)
    if (result === SUCCESS) return payload
    if (result != null) throw Error(result)
  }

  popup = (error) => popupAlert('Fetch Error', <Text>{String(error)}</Text>)

  submit = (formValues) => {
    if (this.POST) return this.POST(formValues).then(({data, meta}) => this.update(data, meta)).catch(this.popup)
    console.warn(formValues)
  }

  render () {
    const {loadingData, loadingMeta, data, meta} = this.state
    this.hasData = !isEmpty(data)
    this.hasMeta = !isEmpty(meta)
    return (this.hasData && this.hasMeta
        ? <UIRender data={data} meta={meta} initialValues={data} onSubmit={this.submit}/>
        : <Placeholder>
          {!this.hasData &&
          <Text className={cn('h1', {error: !loadingData, blink: loadingData})}>
            {loadingData ? <Text><Spinner size="large"/> Loading...</Text> : 'Missing'} *_data.json
          </Text>
          }
          {!this.hasMeta &&
          <Text className={cn('h1', {error: !loadingMeta, blink: loadingMeta})}>
            {loadingMeta ? <Text><Spinner size="large"/> Loading...</Text> : 'Missing'} *_meta.json
          </Text>
          }
        </Placeholder>
    )
  }
}


