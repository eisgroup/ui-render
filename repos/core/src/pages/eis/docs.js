import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import Markdown from 'react-markdown'
import ScrollView from 'react-ui-pack/ScrollView'
import toc from 'remark-toc'
import { __PROD__, get, logRender } from 'utils-pack'
import { goTo, ROUTE } from '../../common/variables'
import changelog from './changelog.md'
import CodeBlock from './CodeBlock'
import Tabs from './components/Tabs'
import config from './config.md'
import Demo from './demo'
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
    {
      id: '', tab: 'Summary',
      content: () => <Markdown source={this.state.docs} {...mdProps}/>,
    },
    {
      id: 'configuration', tab: 'Configuration',
      content: () => <Markdown source={this.state.config} {...mdProps}/>,
    },
    {
      id: 'demo', tab: 'Demo',
      content: () => <Demo/>,
    },
    {
      id: 'examples', tab: 'Examples',
      content: () => <Examples/>,
    },
    {
      id: 'styles', tab: 'Styles',
      content: () => <Markdown source={this.state.styles} {...mdProps}/>,
    },
    {
      id: 'changelog', tab: 'Change Log',
      content: () => <Markdown source={this.state.changelog} {...mdProps}/>,
    },
    {
      id: 'faq', tab: 'FAQ',
      content: () => <Markdown source={this.state.faq} {...mdProps}/>,
    },
  ]

  get id () {
    return get(this.props, 'match.params.id') || ''
  }

  get tabIndex () {
    return this.tabs.findIndex(v => v.id === this.id)
  }

  onClickTab = (index) => {
    const id = this.tabs[index].id
    goTo(`${ROUTE.DOCS}${__PROD__ ? '' : (id && '/')}${id}`)
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
      <ScrollView fill className={'app-docs padding-large no-padding-top'}>
        <Helmet>
          <title>{'UI Render'}</title>
        </Helmet>
        <Tabs
          defaultIndex={this.tabIndex}
          onChange={this.onClickTab}
          items={[...this.tabs]}
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
