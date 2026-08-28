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
