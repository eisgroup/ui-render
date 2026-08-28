import React from 'react'
import UIRender from '../core/pages/main/rules'
import { AppProvider, ConfigOverride } from '../core/providers'
import { reportMetaProblems } from '../core/ui-render/validateMeta'
import AppWrapper from './AppWrapper'

/**
 * @param {Object} props - UIRender props
 * @param {Boolean|Function} [props.validateMeta] - dev-mode meta contract check (UPGRADE-PLAN §9.4).
 *    Falsy (the default) walks nothing at all. `true` reports every problem to `console.warn`,
 *    each line naming the JSON path of the offending node (e.g. `items[3].items[0].name`).
 *    A function receives the problems array instead of the console being written to; pass a
 *    stable reference (the check is memoised on the meta identity and this value together).
 * @param {String} [props.dateFormat] - moment format tokens applied to every rendered and
 *    edited date. Defaults to `MM-DD-YYYY`.
 * @param {String} [props.currency] - currency name; the shell renders it as a CSS class.
 *    @Note: not `meta.currencyCode`, which selects the symbol used by value renderers.
 * @param {String} [props.language] - language code; the shell renders it as a CSS class.
 * @param {Function} [props.onError] - called with a report — `{error, errorInfo, path, props,
 *    message}` — whenever a node's subtree fails to render, where `path` is the JSON path of
 *    the node in `meta`. The library logs the same report itself, so this is an extra channel
 *    (send it to your error reporting), not a way to silence the console diagnostic.
 * @returns {JSX.Element} the renderer, wrapped in the library's providers and scoped shell
 */
const Render = ({validateMeta, ...props}) => {
    // During render, deliberately: the failures worth naming (a non-array `items`, a non-string
    // `name`) throw inside UIRender's own render, so an effect would report after the crash it
    // was meant to explain. Keyed on the meta identity so a re-render costs nothing.
    React.useMemo(() => reportMetaProblems(props.meta, validateMeta), [props.meta, validateMeta])

    return (
        <AppProvider>
            {/*
              * The configuration props are published twice on purpose: the engine publishes
              * them for the components it renders, and here they are lifted ABOVE
              * `AppWrapper`, which is outside the engine and turns `currency`/`language`
              * into the shell's CSS classes. Merging is idempotent, so the inner publish
              * sees exactly the same values.
              */}
            <ConfigOverride
                dateFormat={props.dateFormat}
                currency={props.currency}
                language={props.language}
            >
                <AppWrapper>
                    <UIRender {...props} />
                </AppWrapper>
            </ConfigOverride>
        </AppProvider>
    )
}

export default Render