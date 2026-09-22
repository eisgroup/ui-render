import * as React from 'react'

/** The published UMD/CommonJS entry is the function itself, not an object with `.default`. */
declare function UIRender<Data = unknown>(
    props: UIRender.UIRenderProps<Data>
): React.ReactElement | null

declare namespace UIRender {
    export interface UIRenderValidationMessage {
        text: string
    }

    export interface UIRenderValidationError {
        messages: UIRenderValidationMessage[]
    }

    export type UIRenderValidationErrors = Record<string, UIRenderValidationError>
    export type UIRenderMethod = (...args: any[]) => unknown
    export type UIRenderTranslate = (value: string) => string

    /** One finding from the dev-mode meta contract check enabled by `validateMeta`. */
    export interface UIRenderMetaProblem {
        /** JSON path of the offending node, relative to the meta root (`''` for the root itself). */
        path: string
        /** `error` — the renderer fails on this node; `warning` — it renders, silently degraded. */
        severity: 'error' | 'warning'
        code: string
        message: string
    }

    export type UIRenderMetaProblemReporter = (problems: UIRenderMetaProblem[]) => void

    /** What React's error boundary hands over about a caught failure. */
    export interface UIRenderErrorInfo {
        componentStack: string
    }

    /** One render failure, as passed to `onError`. */
    export interface UIRenderErrorReport {
        error: unknown
        errorInfo: UIRenderErrorInfo
        /**
         * JSON path of the node whose subtree failed, relative to the meta root (`''` for the
         * root itself). Exact for a failure inside the component a node resolved to; for a
         * failure the renderer hits while preparing a node (a malformed `items`, say) it names
         * the closest enclosing node, which is the most precise position available.
         */
        path: string
        /** Resolved props of that node — the meta declaration plus what the engine added. */
        props: Record<string, unknown>
        /** The one-line diagnostic, also rendered in place of the failed subtree. */
        message: string
    }

    export type UIRenderErrorReporter = (report: UIRenderErrorReport) => void

    export interface UIRenderDownloadResponse {
        blob(): Promise<Blob>
    }

    export interface UIRenderApiCalls<Data = unknown> {
        updateExperienceData?(data: Data): Promise<unknown>
        downloadFile?(fileName: string): Promise<UIRenderDownloadResponse>
        uploadFile?(serializedData: string, file: File): Promise<unknown>
    }

    export interface UIRenderFormOptions extends React.FormHTMLAttributes<HTMLFormElement> {
        kind?: string
    }

    /**
     * THE META CONTRACT (§9.4, typed at §9.6-E1).
     *
     * These types are OPT-IN. `UIRenderProps.meta` is still `object`, deliberately: narrowing it
     * would be a breaking change for every consumer that builds meta at runtime, and it would
     * reproduce at the type level the exact failure §9.4 spent a review cycle fixing on the schema —
     * a contract stricter than the engine, reddening working meta. Annotate where you author:
     *
     *     const meta: UIRender.Meta = { view: 'Row', items: [...] }
     *
     * WHAT THEY BUY, AND WHAT THEY DO NOT.
     *
     * They buy editor suggestions for the five vocabularies and structure on the 29 declared
     * properties. They do NOT buy typo detection: a node must carry `[key: string]: unknown`,
     * because 65 of the 95 keys the tracked examples actually use are undeclared, and an index
     * signature switches off excess-property checking. `{ view: 'Row', itms: [] }` compiles. Anyone
     * selling these types as a spell-checker is overselling them.
     *
     * WHY THE VOCABULARIES END IN `(string & {})` AND NOT `| string`.
     *
     * `'Row' | 'Col' | string` IS `string` — TypeScript collapses it, and the collapse is invisible
     * in review because the union still reads as a list of names. `(string & {})` keeps the literals
     * alive for autocomplete while accepting any string, which is what the permissive schema
     * promises. Both facts are pinned by a compile-time probe in the contract suite, because this is
     * the one mistake here that no reviewer would catch by reading.
     *
     * HOW THEY ARE KEPT FROM DRIFTING. They are not generated from `meta.schema.json`, and the
     * schema is not generated from them — a generator in either direction destroys what the other
     * artifact is for. The link is a check, not a derivation: the contract suite compares these
     * vocabularies against the schema's enums AND against the engine's own live `FIELD` groups, so
     * all three must agree or CI fails.
     */
    export type MetaView =
        'AutoSubmit' | 'Button' | 'Checkbox' | 'Col' | 'ColList' | 'Column' | 'Counter' | 'Data' |
        'Dropdown' | 'Expand' | 'ExpandList' | 'HorizontalLayout' | 'HorizontalList' | 'Icon' |
        'Image' | 'Input' | 'Label' | 'List' | 'PieChart' | 'Popup' | 'ProgressSteps' | 'Row' |
        'RowList' | 'Select' | 'SliderLabel' | 'Space' | 'TabList' | 'Table' | 'TableCells' | 'Tabs' |
        'Text' | 'Title' | 'Toggle' | 'Tooltip' | 'Upload' | 'VerticalLayout' | 'VerticalList' |
        (string & {})

    export type MetaRenderMethod =
        'Currency' | 'Date' | 'Double5' | 'Float' | 'Percent' | 'String' | 'Title+Input' |
        (string & {})

    export type MetaActionName =
        'addData' | 'download' | 'fetch' | 'onApplyPeriods' | 'popup' | 'popupOpen' | 'removeData' |
        'reset' | 'setState' | 'submit' | 'updateDataOnChange' | 'upload' | 'warn' |
        (string & {})

    export type MetaNormalizerName =
        'currency' | 'date' | 'double5' | 'hh:mm' | 'integer' | 'percent' | 'phone' | 'uppercase' |
        (string & {})

    export type MetaInputType =
        'date' | 'file' | 'number' | 'select' | 'slider' | 'text' | 'textarea' | 'toggle' |
        (string & {})

    /** `{ name: 'path.to.value' }` — the engine resolves it against `data` at render time. */
    export interface MetaValueRef {
        name: string
    }

    /** A string, or a reference the engine resolves from `data`. */
    export type MetaStringOrValueRef = string | MetaValueRef | null

    /** `renderCell: 'Currency'` or `renderCell: { name: 'Currency', ... }`. */
    export type MetaRenderer = MetaRenderMethod | { name?: MetaRenderMethod, [key: string]: unknown } | null

    /** `onClick: 'submit'` or `onClick: { name: 'submit', ... }`. */
    export type MetaFunctionRef =
        | MetaActionName
        | { name?: MetaActionName, [key: string]: unknown }
        | Array<MetaActionName | { name?: MetaActionName, [key: string]: unknown }>
        | null

    export type MetaMapper = Record<string, unknown> | Array<Record<string, unknown>> | null

    /** An entry in `items`/`headers`: a node, or `null`, which the renderer deletes. */
    export type MetaNodeEntry = MetaNode | null

    /**
     * One node of the render tree. Every declared property is optional — the corpus has NO
     * per-view required key beyond `view` itself, measured across 631 view-bearing nodes.
     */
    export interface MetaNode {
        view?: MetaView
        name?: string | null
        items?: MetaNodeEntry[] | null
        headers?: MetaNodeEntry[] | null
        extraHeaders?: unknown[] | null
        extraItems?: unknown[] | null
        relativeData?: boolean | null
        showIf?: unknown
        meta?: Meta
        onClick?: MetaFunctionRef
        onChange?: MetaFunctionRef
        onDone?: MetaFunctionRef
        type?: MetaInputType
        format?: MetaNormalizerName
        normalize?: MetaNormalizerName
        parse?: MetaNormalizerName
        validate?: unknown
        verify?: Record<string, unknown>
        mapOptions?: MetaMapper
        mapItems?: MetaMapper
        filterItems?: unknown[]
        tooltip?: unknown
        styles?: MetaStringOrValueRef | unknown[]
        className?: MetaStringOrValueRef | unknown[]
        label?: unknown
        children?: unknown
        tab?: unknown
        content?: unknown
        /** The schema's `patternProperties: { "^render": … }`, expressed as a template literal key. */
        [key: `render${string}`]: MetaRenderer
        /** Required: 65 of the 95 keys the tracked examples use are undeclared here. */
        [key: string]: unknown
    }

    /** The document root: a node, plus the two keys the engine strips before rendering. */
    export interface Meta extends MetaNode {
        $schema?: string
        /** `"MAJOR"` or `"MAJOR.MINOR"`. Absent means "current". */
        metaVersion?: string | null
    }

    /** Props accepted by the component exported from the package root. */
    export interface UIRenderProps<Data = unknown> {
        data: Data
        meta: object
        initialValues?: Data
        childBefore?: React.ReactNode
        childAfter?: React.ReactNode
        form?: boolean | UIRenderFormOptions
        embedded?: boolean
        onSubmit?(values: Data, ...args: any[]): unknown
        getFormData?(getData: () => Data): void
        onDataChanged?(): void
        getValidationErrors?(errors: UIRenderValidationErrors): void
        methods?: Record<string, UIRenderMethod>
        translate?: UIRenderTranslate
        apiCalls?: UIRenderApiCalls<Data>
        /**
         * `moment` format tokens applied to every date the renderer displays or edits.
         * Defaults to `MM-DD-YYYY`.
         */
        dateFormat?: string
        /**
         * Currency name published to the renderer's configuration; the application shell
         * renders it as a CSS class. Not `meta.currencyCode`, which selects the currency
         * symbol the value renderers use.
         */
        currency?: string
        /** Language code published to the configuration; the shell renders it as a CSS class. */
        language?: string
        /**
         * Called with a report whenever one node's subtree fails to render, instead of the
         * failure taking the document down. The library logs the same report itself, so this
         * is an additional channel — send it to your error reporting — not a way to silence
         * the console diagnostic.
         */
        onError?: UIRenderErrorReporter
        /**
         * Dev-mode validation of `meta` against the published contract (`meta.schema.json`).
         * Omitted or `false` walks nothing at all. `true` reports each problem to
         * `console.warn`, naming the JSON path of the offending node. A function receives the
         * problems instead of the console being written to; pass a stable reference, since the
         * check is memoised on the meta identity and this value together.
         */
        validateMeta?: boolean | UIRenderMetaProblemReporter
        className?: string
        style?: React.CSSProperties
    }
}

export = UIRender
