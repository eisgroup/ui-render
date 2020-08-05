import React, { Component } from 'react'
import Markdown from 'react-markdown'
import ScrollView from 'react-ui-pack/ScrollView'
import Tabs from 'react-ui-pack/Tabs'
import toc from 'remark-toc'
import { logRender } from 'utils-pack'
import docs from './docs.md'
import faq from './fag.md'

/**
 * EXAMPLE TEMPLATE ------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
@logRender
export default class Docs extends Component {
  state = {
    docs: undefined,
    examples: undefined,
    faq: undefined,
  }

  componentDidMount () {
    fetch(docs).then(r => r.text()).then(docs => this.setState({docs}))
    fetch(faq).then(r => r.text()).then(faq => this.setState({faq}))
  }

  render () {
    const mdProps = {
      plugins: [toc],
      renderers: {heading: HeadingRenderer},
    }
    // todo: show config.js file
    return (
      <ScrollView fill className={'app-docs padding-large'}>
        <h1>{'UI Renderer'}</h1>
        <Tabs
          items={['Summary', 'Examples', 'FAQ']}
          panels={[
            () => <Markdown source={this.state.docs} {...mdProps}/>,
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
