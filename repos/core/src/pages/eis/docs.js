import React, { Component } from 'react'
import Markdown from 'react-markdown'
import ScrollView from 'react-ui-pack/ScrollView'
import Tabs from 'react-ui-pack/Tabs'
import toc from 'remark-toc'
import { get, logRender } from 'utils-pack'
import { goTo } from '../../common/variables'
import changelog from './changelog.md'
import CodeBlock from './CodeBlock'
import config from './config.md'
import docs from './docs.md'
import Examples from './Examples'
import faq from './faq.md'
import styles from './styles.md'

const mdProps = {
  plugins: [toc],
  renderers: {code: CodeBlock, heading: HeadingRenderer},
}

/**
 * EXAMPLE TEMPLATE ------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
@logRender
export default class Docs extends Component {
  state = {
    docs: undefined,
    config: undefined,
    examples: undefined,
    styles: undefined,
    changelog: undefined,
    faq: undefined,
  }

  tabs = [
    {id: '', title: 'Summary'},
    {id: 'configuration', title: 'Configuration'},
    {id: 'examples', title: 'Examples'},
    {id: 'styles', title: 'Styles'},
    {id: 'changelog', title: 'Change Log'},
    {id: 'faq', title: 'FAQ'},
  ]

  get id () {
    return get(this.props, 'match.params.id') || ''
  }

  get tabIndex () {
    return this.tabs.findIndex(v => v.id === this.id)
  }

  onClickTab = (index) => {
    const id = this.tabs[index].id
    goTo(`/docs${id && '/'}${id}`)
  }

  componentDidMount () {
    fetch(docs).then(r => r.text()).then(docs => this.setState({docs}))
    fetch(config).then(r => r.text()).then(config => this.setState({config}))
    fetch(styles).then(r => r.text()).then(styles => this.setState({styles}))
    fetch(changelog).then(r => r.text()).then(changelog => this.setState({changelog}))
    fetch(faq).then(r => r.text()).then(faq => this.setState({faq}))
  }

  render () {
    return (
      <ScrollView fill className={'app-docs padding-large'}>
        <h1>{'UI Render'}</h1>
        <Tabs
          defaultIndex={this.tabIndex}
          onChange={this.onClickTab}
          tabs={this.tabs.map(v => v.title)}
          panels={[
            () => <Markdown source={this.state.docs} {...mdProps}/>,
            () => <Markdown source={this.state.config} {...mdProps}/>,
            () => <Examples/>,
            () => <Markdown source={this.state.styles} {...mdProps}/>,
            () => <Markdown source={this.state.changelog} {...mdProps}/>,
            () => <Markdown source={this.state.faq} {...mdProps}/>,
          ]}
          classNamePanels="padding-v margin-v"
        />

      </ScrollView>
    )
  }
}

function flatten (text, child) {
  return typeof child === 'string'
    ? text + child
    : React.Children.toArray(child.props.children).reduce(flatten, text)
}

function HeadingRenderer (props) {
  const children = React.Children.toArray(props.children)
  const text = children.reduce(flatten, '')
  const slug = text.trim().toLowerCase().replace(/ +/g, '-').replace(/[^a-zA-Z0-9_-]/g, '')
  return React.createElement('h' + props.level, {id: slug}, props.children)
}
