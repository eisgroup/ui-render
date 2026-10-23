/**
 * THE PUBLISHED CONTRACT (§9.6-E4): every type a host sees, as ordinary exports. It is the SOURCE of
 * the package's declarations, not a description kept beside the code:
 *  - `main.tsx` types the component the package exports with `UIRenderProps`, so the component and
 *    its published props cannot disagree;
 *  - `npm run gen-ts` (`scripts/gen-ts.js`) emits this module as `dist/contract.d.ts`, and writes
 *    `dist/index.d.ts` from `main.tsx`'s declaration: the component itself, `export =` for the
 *    CommonJS default, and a namespace that re-exports every type below under `UIRender.*`.
 * So a type added here is published with nothing else to edit. Keep it free of imports other than
 * `react`: whatever this module imports, a host's compiler must resolve too.
 */
import * as React from 'react'

export interface UIRenderValidationMessage {
    text: string
}

export interface UIRenderValidationError {
    messages: UIRenderValidationMessage[]
}

export type UIRenderValidationErrors = Record<string, UIRenderValidationError>
export type UIRenderMethod = (...args: any[]) => unknown
export type UIRenderTranslate = (value: string) => string

/**
 * The id of a text the widget writes itself, such as the `Total` under a pie chart's total, a select's
 * `Select` or a field's `Required`. The host's `translate` is asked for each as `ui-render:<id>`. Where it
 * answers with that key, with the key without `ui-render:`, or with an empty string, the widget shows its own
 * English text. `docs/BUILT-IN-PHRASES.md` lists each id with its English text.
 */
export type UIRenderPhraseId =
    'DOWNLOAD_FAILED' | 'END_DATE_CANNOT_BE_LESS_THAN_START_DATE' | 'ERROR' | 'FILE' | 'FILES' |
    'FILE_MUST_BE_UNDER' | 'FILE_UPLOAD_FAILED' | 'INVALID_EMAIL_ADDRESS' | 'INVALID_URL' |
    'MAXIMUM_FILE_SIZE_EXCEEDED' | 'MUST_BE_LESS_THAN_CHARACTERS' | 'MUST_BE_MAXIMUM' | 'MUST_BE_MINIMUM' |
    'NEXT_PAGE' | 'NO' | 'OFF' | 'OK' | 'ON' | 'PAGE' | 'PAGINATION' | 'PASSWORD_IS_TOO_WEAK' |
    'PERIODS_CANNOT_OVERLAP' | 'POPUP' | 'POPUP_CONTENT_IS_EMPTY' | 'PREVIOUS_PAGE' | 'REQUIRED' | 'SELECT' |
    'SELECT_NAME' | 'SELECT_OR_DROP' | 'SLIDER_MAXIMUM' | 'SLIDER_MINIMUM' |
    'START_AND_END_DATE_CANNOT_BE_THE_SAME' | 'START_DATE_CANNOT_BE_MORE_THAN_END_DATE' | 'SYNCING' |
    'TABLE_HAS_NO_DATA' | 'TOTAL' | 'UPLOAD_FILE' | 'UPLOAD_FILES_ONLY' | 'UPLOAD_LABEL_FILE' | 'YES'

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
    /**
     * Called by the `onApplyPeriods` action with every form's current values; what it resolves with
     * becomes the document's data, and an empty answer leaves the data as it was. It is not called while
     * a field the user can change shows its validation error, and the values hold no table's draft row
     * (`renderExtraItem`) until the row is added.
     */
    updateData?(data: Data): Promise<unknown>
    /**
     * @deprecated The old name of `updateData`, which keeps working; `updateData` wins when a host
     * passes both.
     */
    updateExperienceData?(data: Data): Promise<unknown>
    downloadFile?(fileName: string): Promise<UIRenderDownloadResponse>
    /**
     * `file` is the first picked file; `files` is every file picked, for a field that allows
     * `multiple`. A host that takes only the first two arguments is unaffected.
     */
    uploadFile?(serializedData: string, file: File, files: File[]): Promise<unknown>
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
    'currency' | 'date' | 'double5' | 'integer' | 'percent' | 'phone' | 'uppercase' |
    (string & {})

export type MetaInputType =
    'date' | 'file' | 'number' | 'select' | 'slider' | 'text' | 'textarea' | 'toggle' |
    (string & {})

/**
 * `{ name: 'path.to.value' }`, the value transform: the engine resolves it against `data` at render time. Only
 * `name` and an optional `relativeData` — an object with any other key is passed on as it is.
 */
export interface MetaValueRef {
    name: string
    relativeData?: boolean | null
}

/**
 * A class-name value: a string, a reference the engine resolves from `data`, a number, or an object whose truthy
 * keys are the class names, as `classNames()` takes them.
 */
export type MetaStringOrValueRef = string | number | MetaValueRef | Record<string, unknown> | null

/** `renderCell: 'Currency'` or `renderCell: { name: 'Currency', ... }`. */
export type MetaRenderer = MetaRenderMethod | { name?: MetaRenderMethod, [key: string]: unknown } | null

/**
 * `onClick: 'submit'` or `onClick: { name: 'submit', ... }`. Not an array: the engine turns only a string or an
 * object into a function, and an array reached React as the listener, which a click then threw on (measured
 * 2026-10-09). The type allowed one until then.
 */
export type MetaFunctionRef =
    | MetaActionName
    | { name?: MetaActionName, [key: string]: unknown }
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
    /** The child nodes, or a value transform that resolves to them. */
    items?: MetaNodeEntry[] | MetaValueRef | null
    /**
     * A Table's columns. A header shows its `label`. Without one it shows no text, and its `id` is hidden text that
     * names it for screen readers; `label: ""` names nothing.
     */
    headers?: MetaNodeEntry[] | MetaValueRef | null
    /** Rows of Table headers, above `headers` in the order given: each an array of headers like those of `headers`. */
    extraHeaders?: unknown[] | MetaValueRef | null
    extraItems?: unknown[] | MetaValueRef | null
    relativeData?: boolean | null
    showIf?: unknown
    meta?: Meta
    onClick?: MetaFunctionRef
    onChange?: MetaFunctionRef
    onDone?: MetaFunctionRef
    /** On a field, called after the field's own focus handling, never in its place. */
    onFocus?: MetaFunctionRef
    /** On a field, called after the field's own blur handling, never in its place. */
    onBlur?: MetaFunctionRef
    type?: MetaInputType | null
    format?: MetaNormalizerName | null
    normalize?: MetaNormalizerName | null
    parse?: MetaNormalizerName | null
    validate?: unknown
    verify?: Record<string, unknown> | null
    mapOptions?: MetaMapper
    mapItems?: MetaMapper
    filterItems?: unknown[] | null
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
    /** Should be the same as `data` initially. */
    initialValues?: Data
    childBefore?: React.ReactNode
    childAfter?: React.ReactNode
    /**
     * Renders no element in the document a host mounts, which has no `<form>` around it, so Enter in
     * a field submits nothing. A document a `Data` node nests renders inside `<form onSubmit {...form}>`,
     * unless it is `embedded`.
     */
    form?: boolean | UIRenderFormOptions
    /** Whether to disable rendering of the wrapper scroll view and the html form. */
    embedded?: boolean
    onSubmit?(values: Data, ...args: any[]): unknown
    /**
     * Called as the document mounts, with a reader of every form's current values. They hold no table's
     * draft row (`renderExtraItem`): what a user types there is in them once the row is added.
     */
    getFormData?(getData: () => Data): void
    onDataChanged?(): void
    /**
     * Called with each field's validation error once the user has left the field. A message the widget writes
     * itself is in the language of `translate`, as the field shows it. A required field's is the exception: it
     * reads `<Field Name> is Required`, the name made from the field's `name`.
     */
    getValidationErrors?(errors: UIRenderValidationErrors): void
    methods?: Record<string, UIRenderMethod>
    /**
     * Translates what the widget shows: the labels, titles and options of the meta, the values it shows as
     * text, and the texts the widget writes itself, which it asks for as `ui-render:<id>` (`UIRenderPhraseId`).
     * It is handed strings only, and returns one it has no translation for as it was given.
     */
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
     * Language tag the widget shows numbers in, `de-DE`; `de_DE` is read the same. It sets the decimal and
     * grouping separators of the `Currency`, `Float`, `Double5` and `Percent` renderers, a `Counter`, a pie
     * chart's values and a slider's labels. It also sets the decimal separator of a number shown as plain
     * text or in short form: a pie chart's total, an upload's size limit. Without it, or with a value that
     * is no language tag, numbers show as before: the renderers in the runtime's locale, the rest with a
     * point. Number inputs take and show a point either way.
     */
    locale?: string
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
