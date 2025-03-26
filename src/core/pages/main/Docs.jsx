import React, { Component } from 'react'
import { Helmet } from 'react-helmet'
import Markdown from 'react-markdown'
import ScrollView from 'ui-react-pack/ScrollView'
import toc from 'remark-toc'
import { __PROD__, get } from 'ui-utils-pack'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {oneLight} from 'react-syntax-highlighter/dist/esm/styles/prism'
import { goTo, ROUTE } from '../../common/variables'
import changelog from './changelog.md'
import Tabs from './components/Tabs'
import config from './config.md'
import Demo from './demo'
import docs from './docs.md'
import Examples from './Examples'
import faq from './faq.md'
import styles from './styles.md'

const mdProps = {
  remarkPlugins: [toc],
}

/**
 * EXAMPLE TEMPLATE ------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
export default class Docs extends Component {
  state = {
    docs: undefined,
    config: undefined,
    styles: undefined,
    changelog: undefined,
    faq: undefined,
  }

  components= {
    code: (props) => {
      const {children, className, node, ...rest} = props
      const match = /language-(\w+)/.exec(className || '')
      return match ? (
          <SyntaxHighlighter
              {...rest}
              PreTag="div"
              children={String(children).replace(/\n$/, '')}
              language={match[1]}
              style={oneLight}
          />
      ) : (
          <code {...rest} className={className}>
            {children}
          </code>
      )
    }
  }

  tabs = [
    {
      id: '', tab: 'Summary',
      content: () => <Markdown {...mdProps} components={this.components}>{this.state.docs}</Markdown>,
    },
    {
      id: 'configuration', tab: 'Configuration',
      content: () => <Markdown {...mdProps} components={this.components}>{this.state.config}</Markdown>,
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
      content: () => <Markdown {...mdProps} components={this.components}>{this.state.styles}</Markdown>,
    },
    {
      id: 'changelog', tab: 'Change Log',
      content: () => <Markdown {...mdProps} components={this.components}>{this.state.changelog}</Markdown>,
    },
    {
      id: 'faq', tab: 'FAQ',
      content: () => <Markdown {...mdProps} components={this.components}>{this.state.faq}</Markdown>,
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
