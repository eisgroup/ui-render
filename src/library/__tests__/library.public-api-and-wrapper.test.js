import fs from 'fs'
import path from 'path'
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ConfigContext } from '../../core/contexts'

const REPO_ROOT = path.resolve(__dirname, '../../..')
const { version: PACKAGE_VERSION } = require('../../../package.json')

// Every place the version is written by hand. Keeping the list here means a release bump is
// caught in one spot, by name, instead of drifting silently across the tree.
const VERSION_SITES = [
    'src/library/AppWrapper.js',
    'src/library/types/UIRender.tsx',
    'public/index.html',
]

jest.mock('../../core/pages/main/rules', () => {
    const ReactModule = require('react')
    const contexts = require('../../core/contexts')

    return function MockUIRender (props) {
        const config = ReactModule.useContext(contexts.ConfigContext)
        const app = ReactModule.useContext(contexts.AppContext)

        return ReactModule.createElement(
            'output',
            { 'data-testid': 'ui-render' },
            `${props.contract}|${config.currency}|${config.language}|${app.isOpen}`
        )
    }
})

import LibraryRender from '../main' // eslint-disable-line import/first
import AppWrapper from '../AppWrapper' // eslint-disable-line import/first
import DefaultExport, { UIRender as NamedExport } from '../index' // eslint-disable-line import/first

describe('published library contract', () => {
    it('exports the same renderer as both the default and named API', () => {
        expect(DefaultExport).toBe(LibraryRender)
        expect(NamedExport).toBe(LibraryRender)
    })

    it('wraps UIRender with initialized contexts and the scoped application shell', () => {
        const { container } = render(<LibraryRender contract="meta-data" />)

        expect(screen.getByTestId('ui-render')).toHaveTextContent('meta-data|USD|en|false')

        const root = container.firstElementChild
        expect(root).toHaveClass('ui-render')
        expect(root).toHaveAttribute('data-version', PACKAGE_VERSION)
        expect(root.querySelector('.app')).toHaveClass('fade-in', 'lang--en', 'USD')
        expect(root.querySelector('.app__content')).toContainElement(screen.getByTestId('ui-render'))
        expect(root.querySelector('#render-popup-root')).toBeInTheDocument()
    })

    it.each(VERSION_SITES)('keeps the hand-written data-version in %s at the package version', site => {
        const source = fs.readFileSync(path.join(REPO_ROOT, site), 'utf8')
        const found = Array.from(source.matchAll(/data-version="([^"]+)"/g)).map(match => match[1])

        expect(found.length).toBeGreaterThan(0)
        // Failing here means a release bumped package.json without updating this file.
        found.forEach(version => expect(version).toBe(PACKAGE_VERSION))
    })

    it('lets AppWrapper react to host configuration values', () => {
        const { container } = render(
            <ConfigContext.Provider value={{ currency: 'PLN', language: 'pl' }}>
                <AppWrapper>
                    <span>Host content</span>
                </AppWrapper>
            </ConfigContext.Provider>
        )

        expect(container.querySelector('.app')).toHaveClass('lang--pl', 'PLN')
        expect(screen.getByText('Host content')).toBeInTheDocument()
    })
})
