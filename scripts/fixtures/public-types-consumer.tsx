import * as React from 'react'
import UIRender, {
    UIRenderApiCalls,
    UIRenderErrorReport,
    UIRenderMetaProblem,
    UIRenderPhraseId,
    UIRenderProps,
    UIRenderTranslate,
    UIRenderValidationErrors,
} from 'eis-ui-render'
// @ts-expect-error the published UMD has no named UIRender value export
import { UIRender as NamedUIRender } from 'eis-ui-render'

interface QuoteData {
    cost: number
}

const data: QuoteData = { cost: 120 }
const meta = { view: 'Text', children: 'Cost' }

const apiCalls: UIRenderApiCalls<QuoteData> = {
    updateData: async values => values,
    downloadFile: async () => ({ blob: async () => new Blob() }),
    uploadFile: async (serializedData, file) => ({ serializedData, file }),
}
// The old name of `updateData` still compiles: deprecated, not removed.
const apiCallsUnderTheOldName: UIRenderApiCalls<QuoteData> = {
    updateExperienceData: async values => values,
}

const translate: UIRenderTranslate = (value: string): string => value.toUpperCase()

// What a host registers under the `ui-render` namespace: one text for each published id.
const builtInTexts: Record<UIRenderPhraseId, string> = {
    DOWNLOAD_FAILED: 'Herunterladen fehlgeschlagen!',
    END_DATE_CANNOT_BE_LESS_THAN_START_DATE: 'Das Ende darf nicht vor dem Beginn liegen',
    ERROR: 'Fehler',
    FILE: 'Datei',
    FILES: 'Dateien',
    FILE_MUST_BE_UNDER: '{file} muss kleiner als {size} sein',
    FILE_UPLOAD_FAILED: 'Hochladen fehlgeschlagen!',
    INVALID_EMAIL_ADDRESS: 'Ungültige E-Mail-Adresse',
    INVALID_URL: 'Ungültige URL',
    MAXIMUM_FILE_SIZE_EXCEEDED: 'Datei zu groß!',
    MUST_BE_LESS_THAN_CHARACTERS: 'Höchstens {count} Zeichen',
    MUST_BE_MAXIMUM: 'Höchstens {max}',
    MUST_BE_MINIMUM: 'Mindestens {min}',
    NEXT_PAGE: 'Nächste Seite',
    NO: 'Nein',
    OFF: 'AUS',
    OK: 'OK',
    ON: 'AN',
    PAGE: 'Seite {page}',
    PAGINATION: 'Seitennavigation',
    PASSWORD_IS_TOO_WEAK: 'Das Passwort ist zu schwach',
    PERIODS_CANNOT_OVERLAP: 'Zeiträume dürfen sich nicht überschneiden',
    POPUP: 'Dialog',
    POPUP_CONTENT_IS_EMPTY: 'Der Dialog ist leer',
    PREVIOUS_PAGE: 'Vorherige Seite',
    REQUIRED: 'Pflichtfeld',
    SELECT: 'Bitte wählen',
    SELECT_NAME: '{name} wählen',
    SELECT_OR_DROP: 'Auswählen oder ablegen',
    SLIDER_MAXIMUM: '{name}, Maximum',
    SLIDER_MINIMUM: '{name}, Minimum',
    START_AND_END_DATE_CANNOT_BE_THE_SAME: 'Beginn und Ende dürfen nicht gleich sein',
    START_DATE_CANNOT_BE_MORE_THAN_END_DATE: 'Der Beginn darf nicht nach dem Ende liegen',
    SYNCING: 'Wird gespeichert…',
    TABLE_HAS_NO_DATA: 'Die Tabelle hat keine Daten!',
    TOTAL: 'Gesamt',
    UPLOAD_FILE: '{file} hochladen',
    UPLOAD_FILES_ONLY: 'Nur {formats}-Dateien hochladen',
    UPLOAD_LABEL_FILE: '{label}-Datei hochladen',
    YES: 'Ja',
}
// @ts-expect-error an id the widget does not publish
const unknownPhrase: UIRenderPhraseId = 'MAYBE'

const props: UIRenderProps<QuoteData> = {
    data,
    meta,
    initialValues: data,
    form: { kind: 'quote', className: 'quote-form' },
    onSubmit: values => values.cost,
    getFormData: getData => getData().cost,
    onDataChanged: () => undefined,
    getValidationErrors: (errors: UIRenderValidationErrors) => errors,
    methods: { formatCost: value => String(value) },
    translate,
    apiCalls,
    dateFormat: 'MM-DD-YYYY',
    currency: 'USD',
    language: 'en',
    locale: 'de-DE',
    onError: (report: UIRenderErrorReport) => [report.path, report.message, report.errorInfo.componentStack],
    validateMeta: (problems: UIRenderMetaProblem[]) => problems.map(problem => problem.path),
    className: 'quote-render',
    style: { display: 'block' },
}

const minimal = <UIRender data={data} meta={meta}/>
const validating = <UIRender data={data} meta={meta} validateMeta/>
const complete = <UIRender {...props}/>
const inferred: React.ComponentProps<typeof UIRender> = { data, meta }

// @ts-expect-error data is required by the runtime contract
const missingData = <UIRender meta={meta}/>
// @ts-expect-error meta is required by the runtime contract
const missingMeta = <UIRender data={data}/>

void [minimal, validating, complete, inferred, missingData, missingMeta, NamedUIRender, apiCallsUnderTheOldName, builtInTexts, unknownPhrase]
