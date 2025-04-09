import React, { useEffect } from 'react'
import { useLocation, useNavigate} from 'react-router-dom'
import Markdown from 'react-markdown'
import ScrollView from 'ui-react-pack/ScrollView'
import toc from 'remark-toc'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {oneLight} from 'react-syntax-highlighter/dist/esm/styles/prism'
import changelogMarkdown from '../markdowns/changelog.md'
import stylesMarkdown from '../markdowns/styles.md'
import configMarkdown from '../markdowns/config.md'
import docsMarkdown from '../markdowns/docs.md'
import faqMarkdown from '../markdowns/faq.md'
import Tabs from '../../core/components/Tabs'
import Demo from '../pages/Demo'
import Examples from '../pages/Examples'

const mdProps = {
    remarkPlugins: [toc],
}

/**
 * EXAMPLE TEMPLATE ------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */
const NavTabs = (props) => {
    const [docs, setDocs] = React.useState(undefined)
    const [config, setConfig] = React.useState(undefined)
    const [styles, setStyles] = React.useState(undefined)
    const [changelog, setChangelog] = React.useState(undefined)
    const [faq, setFaq] = React.useState(undefined)

    let location = useLocation();
    let navigate = useNavigate();

    useEffect(() => {
        fetch(docsMarkdown).then(r => r.text()).then(docs => setDocs(docs))
        fetch(configMarkdown).then(r => r.text()).then(config => setConfig(config))
        fetch(stylesMarkdown).then(r => r.text()).then(styles => setStyles(styles))
        fetch(changelogMarkdown).then(r => r.text()).then(changelog => setChangelog(changelog))
        fetch(faqMarkdown).then(r => r.text()).then(faq => setFaq(faq))
    }, [])

    const components= {
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

    const tabs = [
        {
            path: '', tab: 'Summary',
            content: () => <Markdown {...mdProps} components={components}>{docs}</Markdown>,
        },
        {
            path: '/configuration', tab: 'Configuration',
            content: () => <Markdown {...mdProps} components={components}>{config}</Markdown>,
        },
        {
            path: '/demo', tab: 'Demo',
            content: () => <Demo/>,
        },
        {
            path: '/examples', tab: 'Examples',
            content: () => <Examples/>,
        },
        {
            path: '/styles', tab: 'Styles',
            content: () => <Markdown {...mdProps} components={components}>{styles}</Markdown>,
        },
        {
            path: '/changelog', tab: 'Change Log',
            content: () => <Markdown {...mdProps} components={components}>{changelog}</Markdown>,
        },
        {
            path: '/faq', tab: 'FAQ',
            content: () => <Markdown {...mdProps} components={components}>{faq}</Markdown>,
        },
    ]

    const tabIndex = tabs.findIndex(v => v.path === location.pathname)

    const onClickTab = (index) => {
        const path = tabs[index].path
        navigate(`${path}` || '/')
    }

    return (
        <ScrollView fill className={'app-docs padding-large no-padding-top'}>
            <Tabs
                defaultIndex={tabIndex}
                onChange={onClickTab}
                items={[...tabs]}
            />
        </ScrollView>
    )
}

export default NavTabs