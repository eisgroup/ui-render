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
        dateFormat?: string
        className?: string
        style?: React.CSSProperties
    }
}

export = UIRender
