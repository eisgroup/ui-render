import React, { Component } from 'react'
import { ALERT, stateAction } from '../../common/actions'
import fetch from '../../common/fetch'
import { connect } from '../../common/redux'
import { cloneDeep, fromJSON, logRender, set } from '../../common/utils'
import { _, FIELD, FILE_TYPE } from '../../common/variables'
import Json from '../../components/Json'
import Row from '../../components/Row'
import ScrollView from '../../components/ScrollView'
import Text from '../../components/Text'
import View from '../../components/View'
import Render, { metaToProps } from '../../components/views/Render'
import { settings } from '../../modules'
import { POPUP } from '../../modules/exports'
import { reset } from '../../modules/form'
import { withForm } from '../../modules/form/utils'
import router from '../../modules/router'
import LanguageSelection from '../../modules/settings/views/LanguageSelection'
import Upload from '../../modules/upload/views/Upload'
import data from './data/_data'
import meta from './data/_meta'

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapStateToProps = (state) => ({
  lang: settings.select.language(state), // to trigger re-render
  activeRoute: router.select.activeRoute(state),
  initialValues: data,
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
@withForm({form: 'DEMO', enableReinitialize: true})
@logRender
export default class Demo extends Component {
  resetForm = () => {
    const {dispatch, form} = this.props
    dispatch(reset(form))
  }

  // @Note: functions should have consistent pattern of receiving important arguments first,
  // followed by optional arguments.
  // Positional arguments was chosen instead of keyword arguments because
  // it provides more flexibility and separation of concerns between different configs.
  setStates = (value, keyPath) => {
    return this.setState(set(this.state, keyPath, value))
  }

  state = {
    showMeta: true,
    reset: (FIELD.FUNC[FIELD.ACTION.RESET] = this.resetForm), // must be declared before using `metaToProps`
    setState: (FIELD.FUNC[FIELD.ACTION.SET_STATE] = this.setStates), // must be declared before using `metaToProps`
    fetch: (FIELD.FUNC[FIELD.ACTION.FETCH] = fetch), // must be declared before using `metaToProps`
    data: {
      json: data,
      name: undefined,
    },
    meta: {
      json: meta,
      name: undefined,
    },
    active: {
      // plan: 1,
    },
  }

  /**
   * Handle Redux-Form submit, which expects a promise return value
   */
  submit = (values) => {
    return this.props.actions.popup({title: 'Submitted Form with these values', content: <Json data={values}/>})
  }

  handleSubmit = this.props.handleSubmit(this.submit)

  handleUpload = (kind, [file]) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => this.setState({[kind]: {json: fromJSON(reader.result), name: file.name}})
    reader.readAsText(file)
  }

  render () {
    const {lang} = this.props
    const {data, meta, showMeta} = this.state
    const props = metaToProps(cloneDeep(meta.json), data.json, this)
    const uploadProps = {
      hasHeader: false,
      multiple: false,
      lang,
      id: FILE_TYPE.JSON,
      className: 'radius-large',
    }
    return (
      <>
        <ScrollView fill className='fade-in bg-texture'>
          <form onSubmit={this.handleSubmit}>
            <Render data={data.json} {...props}/>
          </form>
        </ScrollView>

        {showMeta &&
        <ScrollView className='padding bg-neutral inverted json-tree'>
          <Row className='spread'>
            <View><Upload {...uploadProps} label='*_data.json' onUpload={this.handleUpload.bind(this, 'data')}>
              {data.name && <View><Text className='h4'>{_.UPLOADED}</Text><Text>{data.name}</Text></View>}
            </Upload></View>
            <View><Upload {...uploadProps} label='*_meta.json' onUpload={this.handleUpload.bind(this, 'meta')}>
              {meta.name && <View><Text className='h4'>{_.UPLOADED}</Text><Text>{meta.name}</Text></View>}
            </Upload></View>
            <Json data={meta.json} inverted/>
          </Row>
          <LanguageSelection className='position-top-right'/>
        </ScrollView>
        }
      </>
    )
  }
}
