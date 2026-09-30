/**
 * WHAT THE DEMO'S TABS DO TO THE BROWSER HISTORY.
 * =============================================================================================
 *
 * NavTabs drives `StandaloneTabs` from the URL: `activeIndex` is the tab for `location.pathname`, and
 * `onChange` navigates. StandaloneTabs reports a controlled `activeIndex` change through `onChange` as
 * well, so a tab the URL itself selected — by Back, Forward or a link — came back as a report, and
 * NavTabs navigated to the page already showing. That pushed a new entry and threw away the Forward
 * history. A click has to push exactly one entry; Back and Forward have to push none.
 *
 * Counted the way the running demo was measured: a spy on `window.history.pushState`, under the
 * `BrowserRouter` the demo mounts. The markdown, the syntax highlighter and the demo pages are
 * stand-ins, since only the navigation is under test.
 */
import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TextDecoder, TextEncoder } from 'util'
import { ConfigContext, initialConfigState } from '../../../core/contexts/ConfigContext'

jest.mock('../../markdowns/changelog.md', () => 'changelog.md')
jest.mock('../../markdowns/styles.md', () => 'styles.md')
jest.mock('../../markdowns/config.md', () => 'config.md')
jest.mock('../../markdowns/docs.md', () => 'docs.md')
jest.mock('../../markdowns/faq.md', () => 'faq.md')
jest.mock('../Changelog', () => () => null)
jest.mock('../../pages/Demo', () => () => null)
jest.mock('../../pages/Examples', () => () => null)
jest.mock('react-markdown', () => () => null)
jest.mock('remark-toc', () => () => undefined)
jest.mock('remark-gfm', () => () => undefined)
jest.mock('react-syntax-highlighter', () => ({ Prism: () => null }))
jest.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({ oneLight: {} }))

let BrowserRouter
let NavTabs
let pushState
let originalFetch

beforeAll(() => {
    // NavTabs reads webpack's public path at module scope, so it is required once the global exists.
    global.__webpack_public_path__ = '/'
    // React Router 7 reads `TextEncoder` when its module loads, and jsdom provides none. Node's pair
    // is installed here, for the one suite that loads the router, rather than for every suite.
    if (typeof global.TextEncoder === 'undefined') Object.assign(global, { TextDecoder, TextEncoder })
    BrowserRouter = require('react-router-dom').BrowserRouter
    NavTabs = require('../NavTabs').default
})

afterAll(() => {
    delete global.__webpack_public_path__
})

beforeEach(() => {
    window.history.replaceState(null, '', '/')
    originalFetch = global.fetch
    global.fetch = () => Promise.resolve({ text: () => Promise.resolve('') })
    pushState = jest.spyOn(window.history, 'pushState')
})

afterEach(() => {
    pushState.mockRestore()
    global.fetch = originalFetch
})

const pushedPaths = () => pushState.mock.calls.map(([, , url]) => String(url))
const tab = name => screen.getByText(name).closest('.tabs__item')
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))
// Past StandaloneTabs' 50 ms transition, twice over and in two `act` windows. React 18 renders what a
// window queued only when that window closes, so a transition the render starts runs in the next one.
// The class version of StandaloneTabs starts exactly that: a second, stale transition after a click.
const settle = async () => {
    await act(() => wait(100))
    await act(() => wait(100))
}
// The demo's AppProvider supplies the config the rendered components read. The router is mounted
// as `src/demo/main.jsx` mounts it, without transitions: that entry says why.
const renderNavTabs = () => render(
    <ConfigContext.Provider value={initialConfigState}>
        <BrowserRouter useTransitions={false}><NavTabs/></BrowserRouter>
    </ConfigContext.Provider>
)

/** jsdom traverses the history asynchronously, as a browser does, and fires `popstate`. */
const traverse = async (direction, expectedPath) => {
    await act(async () => { window.history[direction]() })
    await waitFor(() => expect(window.location.pathname).toBe(expectedPath))
    await settle()
}

describe('the demo tabs and the browser history', () => {
    it('pushes one history entry per tab click', async () => {
        renderNavTabs()

        fireEvent.click(tab('Styles'))
        await settle()
        fireEvent.click(tab('FAQ'))
        await settle()

        expect(window.location.pathname).toBe('/faq')
        expect(pushedPaths()).toEqual(['/styles', '/faq'])
    })

    it('pushes nothing when Back and then Forward select the tabs', async () => {
        renderNavTabs()
        fireEvent.click(tab('Styles'))
        await settle()
        fireEvent.click(tab('FAQ'))
        await settle()
        pushState.mockClear()

        await traverse('back', '/styles')
        expect(tab('Styles')).toHaveClass('active')
        expect(pushedPaths()).toEqual([])

        // Forward still exists, because Back did not replace it with a new entry.
        await traverse('forward', '/faq')
        expect(tab('FAQ')).toHaveClass('active')
        expect(pushedPaths()).toEqual([])
    })
})
