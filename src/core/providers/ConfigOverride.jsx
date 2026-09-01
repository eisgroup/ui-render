import React from 'react'
import { ConfigContext, initialConfigState } from '../contexts'

/**
 * CONFIGURATION PUBLISHED BY A HOST ===========================================
 *
 * UPGRADE-PLAN §9.4 / §2.6-2. `ConfigContext` is the channel every component
 * reads formatting configuration from, but nothing ever fed it: the `dateFormat`
 * prop was passed into the renderer, dropped there, and every component read the
 * `MM-DD-YYYY` default instead. This is the one piece that was missing — it takes
 * the configuration values a host hands to `UIRender` and publishes them.
 *
 * Merging, not replacing: a host that sets only `dateFormat` keeps the inherited
 * `currency` and `language`, so an application can set some values around the
 * renderer (through `AppProvider`) and others per renderer. `undefined` means
 * "not given" — passing it does not blank an inherited value.
 *
 * A given prop wins over `setConfig`, deliberately: a value the host renders with
 * is the host's to own, the same way a controlled input's value is.
 * -----------------------------------------------------------------------------
 */

/**
 * @param {String} [dateFormat] - moment format tokens for every rendered date
 * @param {String} [currency] - currency name, used by the application shell as a CSS class
 * @param {String} [language] - language code, used by the application shell as a CSS class
 * @param {*} children - subtree the configuration applies to
 * @returns {JSX.Element} ConfigContext provider
 */
export const ConfigOverride = ({dateFormat, currency, language, children}) => {
    // `initialConfigState` is the fallback because `ConfigContext` is created without a
    // default value, so a renderer mounted outside `AppProvider` — which is how the demo
    // and the test harnesses mount it — would otherwise publish `undefined` for everything.
    const inherited = React.useContext(ConfigContext) || initialConfigState
    const value = React.useMemo(() => {
        const given = {}
        if (dateFormat !== undefined) given.dateFormat = dateFormat
        if (currency !== undefined) given.currency = currency
        if (language !== undefined) given.language = language
        return {...inherited, ...given}
    }, [inherited, dateFormat, currency, language])

    return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
}

export default ConfigOverride
