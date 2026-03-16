import React, { useEffect } from 'react'
import { useLocation, useNavigate} from 'react-router-dom'
import Markdown from 'react-markdown'
import ScrollView from 'ui-react-pack/ScrollView'
import toc from 'remark-toc'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {oneLight} from 'react-syntax-highlighter/dist/esm/styles/prism'
import './markdown.css'

// Use webpack's publicPath: '/ui-render/' in production, '/' in dev
const basePath = (__webpack_public_path__ || '/').replace(/\/$/, '')
import changelogMarkdown from '../markdowns/changelog.md'
import stylesMarkdown from '../markdowns/styles.md'
import configMarkdown from '../markdowns/config.md'
import docsMarkdown from '../markdowns/docs.md'
import faqMarkdown from '../markdowns/faq.md'
import Tabs from '../../core/components/Tabs'
import Changelog from './Changelog'
import Demo from '../pages/Demo'
import Examples from '../pages/Examples'

const mdProps = {
    remarkPlugins: [toc],
}

function textContent(children) {
    if (typeof children === 'string') return children
    if (Array.isArray(children)) return children.map(textContent).join('')
    if (children && children.props) return textContent(children.props.children)
    return ''
}

function slugify(text) {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

function heading(Tag) {
    return ({ children, ...props }) => {
        const id = slugify(textContent(children))
        return <Tag id={id} {...props}>{children}</Tag>
    }
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

    const components = {
        h1: heading('h1'),
        h2: heading('h2'),
        h3: heading('h3'),
        h4: heading('h4'),
        h5: heading('h5'),
        h6: heading('h6'),
        img: ({src, ...props}) => <img src={src && src.startsWith('http') ? src : `${basePath}/${src}`} {...props} />,
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
            content: () => <div className="markdown-body"><Markdown {...mdProps} components={components}>{docs}</Markdown></div>,
        },
        {
            path: '/configuration', tab: 'Configuration',
            content: () => <div className="markdown-body"><Markdown {...mdProps} components={components}>{config}</Markdown></div>,
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
            content: () => <div className="markdown-body"><Markdown {...mdProps} components={components}>{styles}</Markdown></div>,
        },
        {
            path: '/changelog', tab: 'Change Log',
            content: () => <Changelog content={changelog} />,
        },
        {
            path: '/faq', tab: 'FAQ',
            content: () => <div className="markdown-body"><Markdown {...mdProps} components={components}>{faq}</Markdown></div>,
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
                activeIndex={tabIndex >= 0 ? tabIndex : 0}
                defaultIndex={tabIndex >= 0 ? tabIndex : 0}
                onChange={onClickTab}
                items={[...tabs]}
            />
        </ScrollView>
    )
}

export default NavTabs