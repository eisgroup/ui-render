import React, { Component } from 'react'
import Expand from 'react-ui-pack/Expand'
import Icon from 'react-ui-pack/Icon'
import JsonView from 'react-ui-pack/JsonView'
import { LinkOut } from 'react-ui-pack/LinkOut'
import Row from 'react-ui-pack/Row'
import ScrollView from 'react-ui-pack/ScrollView'
import View from 'react-ui-pack/View'
import { toJSON } from 'utils-pack'
import { goTo } from '../../common/variables'
import data from './examples/_data.json'
import meta from './examples/_meta'
import listData from './examples/array-nested_data.json'
import icon_meta from './examples/button-icon_meta'
import * as tableForm from './examples/data_component'
import decimalMeta from './examples/decimal_meta.json'
import dropdownMeta from './examples/dropdown_meta.json'
import exampleData from './examples/example_data.json'
import exampleMeta from './examples/example_meta.json'
import expandListMeta from './examples/expand-list_meta'
import inputMeta from './examples/input_meta'
import invalidArrayData from './examples/invalid-array_data'
import invalidArrayMeta from './examples/invalid-array_meta'
import listMeta from './examples/list_meta'
import piechartMeta from './examples/piechart_meta'
import * as ratingDetails from './examples/rating_details'
import showIfCondition from './examples/showIf'
import * as summaryBox from './examples/summary-box'
import tabListMeta from './examples/tab-list_meta'
import tableExtraItemsMeta from './examples/table-extraItems_meta.json'
import tableNestedMeta from './examples/table-nested_meta'
import tableVerticalMeta from './examples/table-vertical_meta'
import * as tableMatrix from './examples/table_matrix'
import * as tabs from './examples/tabs_meta'
import UIRender from './rules'
import experienceDetails_data from './tester/test_data'
import experienceDetails_meta from './tester/test_meta'

const examples = [
  {
    title: 'Button with Icon',
    id: 'buttonIcon',
    data: {},
    meta: icon_meta,
  },
  {
    title: 'Decimal Points',
    id: 'decimal',
    data: exampleData,
    meta: decimalMeta,
  },
  {
    title: 'Dropdown',
    id: 'dropdown',
    data: exampleData,
    meta: dropdownMeta,
  },
  {
    title: 'Dynamic Layout',
    id: 'layout',
    data: exampleData,
    meta: exampleMeta,
  },
  {
    title: 'Dynamic List',
    id: 'list',
    data: listData,
    meta: listMeta,
  },
  {
    title: 'Expand List',
    id: 'expandList',
    data: listData,
    meta: expandListMeta,
  },
  {
    title: 'Tab List',
    id: 'tabList',
    data: listData,
    meta: tabListMeta,
  },
  {
    title: 'Tabs',
    id: 'tabs',
    data: listData,
    meta: tabs.meta,
  },
  {
    title: 'Tabs Buttoned',
    id: 'tabsButtoned',
    data: listData,
    meta: tabs.buttoned,
  },
  {
    title: 'Table Nested within Table',
    id: 'tableNested',
    data: listData,
    meta: tableNestedMeta,
  },
  {
    title: 'Table Rows as Columns (Vertical Layout)',
    id: 'tableVertical',
    data: listData,
    meta: tableVerticalMeta,
  },
  {
    title: 'Table with Custom Data',
    id: 'tableExtraItems',
    data: exampleData,
    meta: tableExtraItemsMeta,
  },
  {
    title: 'Table with Matrix Data',
    id: 'tableMatrix',
    data: tableMatrix.data,
    meta: tableMatrix.meta,
  },
  {
    title: 'Table with Matrix Data (minimum required config)',
    id: 'tableMatrixRequired',
    data: tableMatrix.data,
    meta: tableMatrix.metaRequired,
  },
  {
    title: 'Table with Form Inputs',
    id: 'tableForm',
    data: tableForm.data,
    meta: tableForm.meta,
  },
  {
    title: 'Pie Chart',
    id: 'pieChart',
    data,
    meta: piechartMeta,
  },
  {
    title: 'Show If Condition',
    id: 'showIf',
    data: exampleData,
    meta: showIfCondition,
  },
  {
    title: 'Summary Box',
    id: 'summaryBox',
    data: summaryBox.data,
    meta: summaryBox.meta,
  },
  {
    title: 'Input',
    id: 'input',
    data: exampleData,
    meta: inputMeta,
  },
  {
    title: 'Invalid Array Data',
    id: 'invalidArray',
    data: invalidArrayData,
    meta: invalidArrayMeta,
  },
  {
    title: 'Experience Ratings',
    id: 'experienceRatings',
    data: experienceDetails_data,
    meta: experienceDetails_meta,
  },
  {
    title: 'Rating Details',
    id: 'ratingDetails',
    data: ratingDetails.data,
    meta: ratingDetails.meta,
  },
  {
    title: 'All Possible Configurations',
    id: 'all',
    data,
    meta,
  },
]

/**
 * VIEW TEMPLATE ---------------------------------------------------------------
 * List of UI Render Documentation Examples Accordion
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

  render () {
    const {activeIndex} = this.state
    const hash = (typeof window !== 'undefined') ? (window.location.hash || '').substr(1) : ''
    return (
      <View className="app__examples bg-white border">
        {examples.map(({data, meta, title, id}, i) => (
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
                <UIRender data={data} meta={meta} initialValues={data}/>
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
        ))}
      </View>
    )
  }
}
