import React from 'react'
import Markdown from 'react-markdown'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
import {oneLight} from 'react-syntax-highlighter/dist/esm/styles/prism'
import './changelog.css'

const codeComponent = (props) => {
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
        <code {...rest} className={className}>{children}</code>
    )
}

/**
 * Split changelog markdown into version sections and render as cards.
 * Expects h3 (###) for version headings.
 */
const Changelog = ({ content }) => {
    if (!content) return null

    const lines = content.split('\n')
    const sections = []
    let current = null

    for (const line of lines) {
        if (line.startsWith('### ') && !line.toLowerCase().includes('table of contents')) {
            if (current) sections.push(current)
            current = { title: line.replace('### ', ''), body: '' }
        } else if (current) {
            current.body += line + '\n'
        }
    }
    if (current) sections.push(current)

    return (
        <div className="changelog">
            {sections.map((section, i) => (
                <div key={i} className="changelog__card">
                    <div className="changelog__version">{section.title}</div>
                    <div className="changelog__content markdown-body">
                        <Markdown components={{ code: codeComponent }}>
                            {section.body.trim()}
                        </Markdown>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default Changelog
