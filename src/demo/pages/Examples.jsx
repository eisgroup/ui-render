import React, { Component } from 'react'
import Button from '../../core/components/Button'
import Expand from '../../core/components/Expand'
import Icon from '../../core/components/Icon'
import JsonView from '../../core/components/JsonView'
import { LinkOut } from '../../core/components/LinkOut'
import Row from '../../core/components/Row'
import ScrollView from '../../core/components/ScrollView'
import View from '../../core/components/View'
import { toJSON } from '../../core/utils'
import { goTo } from '../../core/common/variables'
import { EXAMPLES, hasFlag } from '../examples/manifest'
import UIRender from '../../core/pages/main/rules'

import {
  updatePerformanceData,
  downloadHistoricalFileTemplate,
  uploadHistoricalFile
} from '../api/gdn-rating-alg'

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * List of UI Render Documentation Examples Accordion
 *
 * The example set itself lives in `src/demo/examples/manifest.js` — the single
 * manifest shared with the test harness. This file only renders it.
 * -----------------------------------------------------------------------------
 */
export default class Examples extends Component {
  state = {
    activeIndex: null
  }

  toggleExpand = ({expanded, value, key: id}) => {
    this.setState({activeIndex: expanded ? value : null})
    if (expanded) goTo(`#${id}`)
  }

  onGetDataButtonClick = () => {
    const data = this.getFormData();
    console.info('Form data: ', data);
  }

  onSomeDataChanged = () => {
    console.info('Form data has been changed')
  }

  showValidationErrors = (errors) => {
    console.info('Validation errors', errors)
  }

  render () {
    const {activeIndex} = this.state
    const hash = (typeof window !== 'undefined') ? (window.location.hash || '').substr(1) : ''
    return (
      <View className="app__examples bg-white border">
        {EXAMPLES.map((example, i) => {
          const {data, meta, title, id} = example
          return (
            <Expand
              id={id}
              key={title}
              index={i}
              expanded={i === activeIndex || id === hash}
              title={title}
              onClick={this.toggleExpand}
              classNameLabel="inverted bg-inverse"
              classNameItems="bg-inverse"
            >
              {() => (
                <>
                  { hasFlag(example, 'hostApi') ? (
                    <>
                      <UIRender
                        data={data}
                        meta={meta}
                        initialValues={data}
                        form={obj}
                        getFormData={(f) => this.getFormData = f}
                        onDataChanged={this.onSomeDataChanged}
                        onSubmit={console.warn}
                        getValidationErrors={this.showValidationErrors}
                        translate={(v) => v}
                        dateFormat={"MM-DD-YYYY"}
                        apiCalls={{
                          updateExperienceData: updatePerformanceData,
                          downloadFile: downloadHistoricalFileTemplate,
                          uploadFile: uploadHistoricalFile
                        }}
                      />
                      <View className="app__examples bg-white border">
                        <Button onClick={this.onGetDataButtonClick}>Get Data (the ability to request data from outside)</Button>
                      </View>
                    </>
                  ) : (
                    <UIRender
                      data={data}
                      meta={meta}
                      initialValues={data}
                      form={obj}
                      onSubmit={console.warn}
                    />
                  )}
                  <ScrollView className="padding-smaller bg-neutral inverted">
                    <Row className="wrap spread">
                      <View fill className="padding-smaller min-width-320">
                        <h3>
                          <LinkOut
                            to={`data:text/json;charset=utf-8,${encodeURIComponent(toJSON(meta, null, 2))}`}
                            download={`${id}_meta.json`}
                          >
                            {'Meta.json'} <Icon name="file-download" className="large"/>
                          </LinkOut>
                        </h3>
                        <JsonView data={meta} inverted/>
                      </View>
                      <View fill className="padding-smaller min-width-320">
                        <h3>
                          <LinkOut
                            to={`data:text/json;charset=utf-8,${encodeURIComponent(toJSON(data, null, 2))}`}
                            download={`${id}_data.json`}
                          >
                            {'Data.json'} <Icon name="file-download" className="large"/>
                          </LinkOut>
                        </h3>
                        <JsonView data={data} inverted/>
                      </View>
                    </Row>
                  </ScrollView>
                </>
              )}
            </Expand>
          )
        })}
      </View>
    )
  }
}

const obj = {id: 'example'} // can be boolean true
