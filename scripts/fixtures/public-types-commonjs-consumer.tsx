import * as React from 'react'
import UIRender = require('eis-ui-render')

interface QuoteData {
    cost: number
}

const data: QuoteData = { cost: 120 }
const meta = { view: 'Text', children: 'Cost' }

const translate: UIRender.UIRenderTranslate = (value: string): string => value.toUpperCase()

const props: UIRender.UIRenderProps<QuoteData> = {
    data,
    meta,
    translate,
}

const component = <UIRender {...props}/>
const inferred: React.ComponentProps<typeof UIRender> = { data, meta }

// @ts-expect-error the direct CommonJS export has no .default property
const falseDefault = UIRender.default
// @ts-expect-error the direct CommonJS export has no named UIRender value property
const falseNamed = UIRender.UIRender

void [component, inferred, falseDefault, falseNamed]
