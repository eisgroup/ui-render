import * as React from 'react'
import UIRender from '../core/engine/rules'
import { AppProvider, ConfigOverride } from '../core/providers'
import { reportMetaProblems } from '../core/engine/validateMeta'
import AppWrapper from './AppWrapper'
import type { UIRenderProps } from './contract'

// THIS DECLARATION IS THE PACKAGE'S (§9.6-E4): `npm run gen-ts` publishes it as `UIRender`, through
// `scripts/gen-ts.js`, with the JSDoc below and without these line comments, which declaration emit
// drops. So it is a function, because a namespace of types merges with a function and not with a
// `const`, and its return type is written out, so the published signature stays the contract's own
// `React.ReactElement | null` rather than whatever the checker infers. All the props reach the
// engine except `validateMeta`, which is read here.
/**
 * Renders `meta` with `data`, inside the library's providers and its scoped shell. Each prop is
 * documented on `UIRender.UIRenderProps`.
 *
 * The published UMD/CommonJS entry is this function itself, not an object with `.default`.
 */
function Render<Data = unknown> (props: UIRenderProps<Data>): React.ReactElement | null {
    const {validateMeta, ...hostProps} = props
    // A cast, not a guard: the contract keeps a host's `Data` open (`unknown` unless the host says
    // otherwise), while the engine's form layer types `initialValues` as a record and `onSubmit` as
    // final-form's handler. The engine is handed the host's props exactly as before; the cast says
    // so to the checker, and only here, at the one place the two meet.
    const engineProps = hostProps as React.ComponentProps<typeof UIRender>

    // During render, deliberately: the failures worth naming (a non-array `items`, a non-string
    // `name`) throw inside UIRender's own render, so an effect would report after the crash it
    // was meant to explain. Keyed on the meta identity so a re-render costs nothing.
    React.useMemo(() => reportMetaProblems(hostProps.meta, validateMeta), [hostProps.meta, validateMeta])

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
                dateFormat={hostProps.dateFormat}
                currency={hostProps.currency}
                language={hostProps.language}
            >
                <AppWrapper>
                    <UIRender {...engineProps} />
                </AppWrapper>
            </ConfigOverride>
        </AppProvider>
    )
}

export default Render