/**
 * THE PUBLIC CONFIG CHANNEL ===================================================
 *
 * UPGRADE-PLAN §9.4 / §2.6-2: `dateFormat` was dead end to end — the engine
 * passed it into `<Render>`, which dropped it; nothing fed `ConfigContext`; and
 * every component read the context default instead. These are the contract
 * tests for the repaired route, one per link in the chain:
 *
 *   UIRender props -> ConfigContext -> the components that format values
 *
 * `currency` and `language` travel the same route. They are not date formats:
 * they are the two values the application shell turns into CSS classes
 * (`lang--pl`, `PLN`), which is why the library entry point has to lift them
 * ABOVE the engine — see
 * src/library/__tests__/library.public-api-and-wrapper.test.js. Here we only
 * assert that the engine publishes what it is given.
 *
 * NOT the same thing as `meta.currencyCode`: that one selects the currency
 * SYMBOL used by the value renderers and is read from meta, not from props.
 * -----------------------------------------------------------------------------
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ConfigContext, initialConfigState } from '../../../contexts'
import UIRender from '../rules'

// An ISO date in the data plus a `Text` node is the shortest path to an
// observable format: Text formats any complete ISO-8601 date it renders with
// the configured format (src/core/components/Text.js).
const data = { issued: '2024-01-15' }
const meta = { view: 'Col', items: [{ view: 'Text', name: 'issued' }] }

const Probe = () => {
    const config = React.useContext(ConfigContext)
    return <output data-testid="config">{`${config.dateFormat}|${config.currency}|${config.language}`}</output>
}

const renderEngine = (props, { config } = {}) => {
    const tree = (
        <UIRender data={data} meta={meta} childAfter={<Probe />} {...props} />
    )
    return render(config === undefined
        ? tree
        : <ConfigContext.Provider value={config}>{tree}</ConfigContext.Provider>
    )
}

describe('UIRender public config channel', () => {
    // The engine publishes `fetch` as a meta-callable action while it renders, so the
    // global has to exist even though nothing here fetches anything.
    const originalFetch = global.fetch

    beforeEach(() => {
        global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
    })

    afterEach(() => {
        if (originalFetch === undefined) delete global.fetch
        else global.fetch = originalFetch
    })

    it('formats values with the dateFormat it was given, not the context default', () => {
        renderEngine({ dateFormat: 'YYYY/MM/DD' }, { config: initialConfigState })

        expect(screen.getByText('2024/01/15')).toBeInTheDocument()
        expect(screen.getByTestId('config')).toHaveTextContent('YYYY/MM/DD|USD|en')
    })

    it('keeps the inherited configuration for every key it was not given', () => {
        renderEngine({ dateFormat: 'YYYY/MM/DD' }, {
            config: { ...initialConfigState, currency: 'PLN', language: 'pl' },
        })

        expect(screen.getByTestId('config')).toHaveTextContent('YYYY/MM/DD|PLN|pl')
    })

    it('publishes currency and language on the same route', () => {
        renderEngine({ currency: 'PLN', language: 'pl' }, { config: initialConfigState })

        expect(screen.getByTestId('config')).toHaveTextContent('MM-DD-YYYY|PLN|pl')
        // The date format is untouched, so the ISO value still renders in the inherited format.
        expect(screen.getByText('01-15-2024')).toBeInTheDocument()
    })

    it('falls back to the documented defaults when mounted without a provider', () => {
        renderEngine({ dateFormat: 'DD.MM.YYYY' })

        expect(screen.getByText('15.01.2024')).toBeInTheDocument()
        expect(screen.getByTestId('config')).toHaveTextContent('DD.MM.YYYY|USD|en')
    })

    it('leaves the inherited configuration untouched when given no config props', () => {
        renderEngine({}, { config: { ...initialConfigState, dateFormat: 'DD.MM.YYYY' } })

        expect(screen.getByText('15.01.2024')).toBeInTheDocument()
    })
})
