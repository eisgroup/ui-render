import { POPUP } from 'modules-pack/popup/constants'
import { connect, stateAction } from 'modules-pack/redux'
import settings from 'modules-pack/settings'
import LanguageSelection from 'modules-pack/settings/views/LanguageSelection'
import Upload from 'modules-pack/upload/views/Upload'
import { FILE } from 'modules-pack/variables'
import React, { Component } from 'react'
import JsonView from 'react-ui-pack/JsonView'
import Row from 'react-ui-pack/Row'
import ScrollView from 'react-ui-pack/ScrollView'
import Text from 'react-ui-pack/Text'
import View from 'react-ui-pack/View'
import { ALERT, GET, isEmpty, l, localiseTranslation, logRender, performStorage, SET } from 'utils-pack'
import { _ } from 'utils-pack/translations'
import UIRender from './rules'

const DEMO_JSON_STORAGE_KEY = 'DEMO_JSON'

localiseTranslation({
  CONFIG_USED: {
    [l.ENGLISH]: 'Config Used',
    [l.RUSSIAN]: 'Используемая Конфигурация',
  },
  UPLOADED: {
    [l.ENGLISH]: 'Uploaded',
    [l.RUSSIAN]: 'Загружено',
  },
})

/**
 * MAP STATE & ACTIONS TO PROPS ------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const mapStateToProps = (state) => ({
  lang: settings.select.language(state), // to trigger re-render
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
@logRender
export default class Demo extends Component {
  // @Note: functions should have consistent pattern of receiving important arguments first,
  // followed by optional arguments.
  // Positional arguments was chosen instead of keyword arguments because
  // it provides more flexibility and separation of concerns between different configs.
  state = {
    showMeta: true,
    data: (performStorage(GET, DEMO_JSON_STORAGE_KEY) || {}).data || {
      json: undefined,
      name: undefined,
    },
    meta: {
      json: undefined,
      name: undefined,
    },
    active: {
      // plan: 1,
    },
  }

  handleUpload = (kind, [file], type) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        let json = JSON.parse(reader.result)
        this.setState({[kind]: {json, name: file.name}}, () => {
          if (kind === 'data') performStorage(SET, DEMO_JSON_STORAGE_KEY, {[kind]: this.state.data})
        })
      } catch (error) {
        this.props.actions.popup({
          title: `${file.name} is invalid .${type} file`,
          content: <View>
            <Text className='h5'>{_.ERROR_MESSAGE}</Text>
            <Text className='p'>{String(error)}</Text>
          </View>
        })
      }
    }
    reader.readAsText(file)
  }

  render () {
    const {lang} = this.props
    const {data, meta, showMeta} = this.state
    const hasData = !isEmpty(data.json)
    const hasMeta = !isEmpty(meta.json)
    const uploadProps = {
      hasHeader: false,
      multiple: false,
      lang,
      type: FILE.TYPE.JSON,
    }
    return (
      <>
        <UIRender
          initialValues={data.json}
          data={data.json}
          meta={meta.json}
        />

        {showMeta &&
        <ScrollView className="padding-smaller bg-neutral inverted">
          <Row className="wrap spread">
            <View className="margin-smaller">
              <Upload {...uploadProps} label="*_data.json" onUpload={this.handleUpload.bind(this, 'data')}
                      className={'test-data radius-large' + (!hasData ? ' bg-primary-dark' : '')}
              >
                {data.name && <View><Text className="h4">{_.UPLOADED}</Text><Text>{data.name}</Text></View>}
              </Upload>
            </View>
            <View className="margin-smaller">
              <Upload {...uploadProps} label="*_meta.json" onUpload={this.handleUpload.bind(this, 'meta')}
                      className={'test-meta radius-large' + (hasData && !hasMeta ? ' bg-primary-dark' : '')}
                      disabled={!hasData}
              >
                {meta.name && <View><Text className="h4">{_.UPLOADED}</Text><Text>{meta.name}</Text></View>}
              </Upload>
            </View>
            <View className="margin-smaller min-width-290">
              <Row className="middle justify">
                {hasMeta && <Text className="h6 no-margin fade-in-up">{_.CONFIG_USED}</Text>}
                <LanguageSelection className="right margin-left-small"/>
              </Row>
              {hasMeta && <View className="fade-in-down"><JsonView data={meta.json} inverted/></View>}
            </View>
          </Row>
        </ScrollView>
        }
      </>
    )
  }
}
