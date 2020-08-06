import React, { Component } from 'react'
import Markdown from 'react-markdown'
import ScrollView from 'react-ui-pack/ScrollView'
import Tabs from 'react-ui-pack/Tabs'
import toc from 'remark-toc'
import { get, logRender } from 'utils-pack'
import CodeBlock from './CodeBlock'
import config from './config.md'
import docs from './docs.md'
import faq from './fag.md'

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
    faq: undefined,
  }

  get id () {
    return get(this.props, 'match.params.id') || ''
  }

  get tabIndex () {
    const id = this.id
    switch (id) {
      case 'examples':
        return 2
      case 'configuration':
        return 1
      case 'faq':
        return 3
      default:
        return 0

    }
  }

  componentDidMount () {
    fetch(docs).then(r => r.text()).then(docs => this.setState({docs}))
    fetch(config).then(r => r.text()).then(config => this.setState({config}))
    fetch(faq).then(r => r.text()).then(faq => this.setState({faq}))
  }

  render () {
    return (
      <ScrollView fill className={'app-docs padding-large'}>
        <h1>{'UI Renderer'}</h1>
        <Tabs
          defaultIndex={this.tabIndex}
          items={['Summary', 'Configuration', 'Examples', 'FAQ']}
          panels={[
            () => <Markdown source={this.state.docs} {...mdProps}/>,
            () => <Markdown source={this.state.config} {...mdProps}/>,
            () => null,
            () => <Markdown source={this.state.faq} {...mdProps}/>,
          ]}
          classNamePanels='padding-v margin-v'
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
