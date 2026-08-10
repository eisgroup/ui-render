import * as React from 'react'
import UIRender, {
    UIRenderApiCalls,
    UIRenderProps,
    UIRenderTranslate,
    UIRenderValidationErrors,
} from 'eis-ui-render'
// @ts-expect-error the published UMD has no named UIRender value export
import { UIRender as NamedUIRender } from 'eis-ui-render'

interface QuoteData {
    premium: number
}

const data: QuoteData = { premium: 120 }
const meta = { view: 'Text', children: 'Premium' }

const apiCalls: UIRenderApiCalls<QuoteData> = {
    updateExperienceData: async values => values,
    downloadFile: async () => ({ blob: async () => new Blob() }),
    uploadFile: async (serializedData, file) => ({ serializedData, file }),
}

const translate: UIRenderTranslate = (value: string): string => value.toUpperCase()

const props: UIRenderProps<QuoteData> = {
    data,
    meta,
    initialValues: data,
    form: { kind: 'quote', className: 'quote-form' },
    onSubmit: values => values.premium,
    getFormData: getData => getData().premium,
    onDataChanged: () => undefined,
    getValidationErrors: (errors: UIRenderValidationErrors) => errors,
    methods: { formatPremium: value => String(value) },
    translate,
    apiCalls,
    dateFormat: 'MM-DD-YYYY',
    className: 'quote-render',
    style: { display: 'block' },
}

const minimal = <UIRender data={data} meta={meta}/>
const complete = <UIRender {...props}/>
const inferred: React.ComponentProps<typeof UIRender> = { data, meta }

// @ts-expect-error data is required by the runtime contract
const missingData = <UIRender meta={meta}/>
// @ts-expect-error meta is required by the runtime contract
const missingMeta = <UIRender data={data}/>

void [minimal, complete, inferred, missingData, missingMeta, NamedUIRender]
