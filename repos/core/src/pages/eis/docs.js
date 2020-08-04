import React, { Component } from 'react'
import Markdown from 'react-markdown'
import ScrollView from 'react-ui-pack/ScrollView'
import toc from 'remark-toc'
import { logRender } from 'utils-pack'
import docs from './docs.md'

/**
 * EXAMPLE TEMPLATE ------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
@logRender
export default class Docs extends Component {
  state = {
    text: undefined
  }

  componentDidMount () {
    fetch(docs).then(r => r.text()).then(text => this.setState({text}))
  }

  render () {
    return (
      <ScrollView fill className={'app-docs padding-large'}>
        <Markdown
          source={this.state.text} plugins={[toc]}
          renderers={{heading: HeadingRenderer}}
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
