import type { Translate } from './_envs'
import { interpolateString } from './string'

/**
 * BUILT-IN PHRASES ============================================================
 * =============================================================================
 *
 * The texts the widget writes itself, as opposed to the labels a meta gives it, which are the host's own.
 * A host translates these through its `translate` prop: each is asked for as `ui-render:<ID>`, under a
 * namespace the host registers in its own i18n. Where the host has no translation, the widget shows the
 * English text below, so a host that does nothing sees no change.
 *
 * The ids are published. `UIRenderPhraseId` in `src/library/contract.ts` lists them, and
 * `src/library/contract.agreement.ts` fails to compile while the two lists differ. `docs/BUILT-IN-PHRASES.md`,
 * which `npm run docs:phrases` writes from this table, shows each with its English text. An id stays once
 * published, since a host's translation of a renamed one would be lost without a word. It is UPPER_SNAKE_CASE
 * with no `:` or `.`, which an i18next-based host reads as the namespace and key separators.
 *
 * Each entry reads `ID: 'English text', // where it shows`: the generator reads the lines as they are
 * written, comment included, and fails on any other.
 */
export const BUILT_IN_PHRASES = {
  // Values
  NO: 'No', // A value of `false`, shown as text
  TOTAL: 'Total', // A pie chart's centre, under the total of its values
  YES: 'Yes', // A value of `true`, shown as text

  // Fields
  OFF: 'OFF', // A toggle's off side, where it has no label
  ON: 'ON', // A toggle's on side, where it has no label
  SELECT: 'Select', // A select's placeholder, where its meta gives none
  SELECT_NAME: 'Select {name}', // The name a screen reader gives a select with no `label`; `{name}` is its `name`
  SLIDER_MAXIMUM: '{name}, maximum', // The name a screen reader gives a range slider's upper handle; `{name}` is the slider's `label`, or else its `name`
  SLIDER_MINIMUM: '{name}, minimum', // The name a screen reader gives a range slider's lower handle; `{name}` is the slider's `label`, or else its `name`

  // A date field's calendar
  CALENDAR_OK: 'OK', // The button under a date field's calendar that takes the date picked in it, where its meta gives `needConfirm` or `showTime`
  CHOOSE_A_DECADE: 'Choose a decade', // The name a screen reader gives the decade over the years of a date field's calendar, a button that shows the decades
  CHOOSE_A_MONTH: 'Choose a month', // The name a screen reader gives the month over the days of a date field's calendar, a button that shows the months
  CHOOSE_A_YEAR: 'Choose a year', // The name a screen reader gives the year over the days or the months of a date field's calendar, a button that shows the years
  LAST_YEAR: 'Last year (Control + left)', // The name a screen reader gives the button that goes a year back in a date field's calendar: a decade back where the calendar shows years, a century where it shows decades
  NEXT_MONTH: 'Next month (PageDown)', // The name a screen reader gives the button that goes a month forward in a date field's calendar
  NEXT_YEAR: 'Next year (Control + right)', // The name a screen reader gives the button that goes a year forward in a date field's calendar: a decade forward where the calendar shows years, a century where it shows decades
  NOW: 'Now', // The link under a date field's calendar that picks the current date and time, where its meta gives `showTime`
  PREVIOUS_MONTH: 'Previous month (PageUp)', // The name a screen reader gives the button that goes a month back in a date field's calendar
  TODAY: 'Today', // The link under a date field's calendar that picks today
  WEEK: 'Week', // The name a screen reader gives the column of week numbers in a date field's calendar, where its meta gives `showWeek`

  // Validation messages, under a field
  END_DATE_CANNOT_BE_LESS_THAN_START_DATE: 'End date cannot be less than start date', // A period's end date, checked by `notWithinRange`, where it is before the start date
  INVALID_DATE: 'Invalid date', // A date field left with text that is no date in its format, which it keeps showing
  INVALID_EMAIL_ADDRESS: 'Invalid email address', // A field with `validate: "email"` that holds no email address
  INVALID_URL: 'Invalid URL', // A field with `validate: "url"` that holds no URL with a protocol
  MUST_BE_LESS_THAN_CHARACTERS: 'Must be less than {count} characters', // A field with `validate: "maxLength"` that holds more; `{count}` is the limit, 100
  MUST_BE_MAXIMUM: 'Must be maximum {max}', // A number field above its `max`; `{max}` is the `max`
  MUST_BE_MINIMUM: 'Must be minimum {min}', // A number field below its `min`; `{min}` is the `min`
  PASSWORD_IS_TOO_WEAK: 'Password is too weak', // A field with `validate: "password"` that holds a weak password
  PERIODS_CANNOT_OVERLAP: 'Periods cannot overlap', // A period's dates, checked by `notWithinRange`, where the period overlaps another row's
  REQUIRED: 'Required', // A required field left empty
  START_AND_END_DATE_CANNOT_BE_THE_SAME: 'Start date and end date cannot be the same', // A period's two dates, checked by `notWithinRange`, where they are the same
  START_DATE_CANNOT_BE_MORE_THAN_END_DATE: 'Start date cannot be more than end date', // A period's start date, checked by `notWithinRange`, where it is after the end date

  // Tables
  NEXT_PAGE: 'Next page', // The name a screen reader gives the button to a table's next page
  PAGE: 'Page {page}', // The name a screen reader gives the button to one page of a table; `{page}` is its number
  PAGINATION: 'Pagination', // The name a screen reader gives a table's page navigation
  PREVIOUS_PAGE: 'Previous page', // The name a screen reader gives the button to a table's previous page
  TABLE_HAS_NO_DATA: 'Table has no data!', // A table with no `headers` and no rows to take them from

  // Popups
  DOWNLOAD_FAILED: 'Download Failed!', // The popup a failed download opens, under its title, which is why the download failed
  ERROR: 'Error', // The title of the popup a failed `onApplyPeriods` opens, and of a template popup with no `title` and no `items`
  OK: 'Ok', // The button that closes a popup
  POPUP: 'Popup', // The name a screen reader gives a popup with no title and no message
  POPUP_CONTENT_IS_EMPTY: 'Popup content is empty', // The popup a `popupOpen` opens for a template popup with no `items`

  // Uploads
  FILE: 'File', // What an upload takes, where its meta gives no `label` or `fileType`: in its header, and in its drop zone where it takes one file
  FILE_MUST_BE_UNDER: '{file} must be under {size}', // The popup a dropped file larger than an upload's `maxSize` opens; `{file}` is the file's name, `{size}` the limit
  FILE_UPLOAD_FAILED: 'File Upload Failed!', // The title of the popup a dropped file of a type an upload does not take opens
  FILES: 'Files', // What an upload takes, where its meta gives no `label` or `fileType`: in its drop zone, where it takes several files
  MAXIMUM_FILE_SIZE_EXCEEDED: 'Maximum File Size Exceeded!', // The title of the popup a dropped file larger than an upload's `maxSize` opens
  SELECT_OR_DROP: 'Select or Drop', // An upload's drop zone, above what it takes
  UPLOAD_FILE: 'Upload {file}', // An upload's header, and its hover text where it has no `label` or `fileType`; `{file}` is its `label` or `fileType`, or else `FILE`
  UPLOAD_FILES_ONLY: 'Upload {formats} files only', // The popup a dropped file of a type an upload does not take opens; `{formats}` lists the types it takes
  UPLOAD_LABEL_FILE: 'Upload {label} File', // An upload's hover text, where it has a `label` or `fileType` and no `labelOnHover`; `{label}` is that label

  // Saving
  SYNCING: 'Syncing...', // An `AutoSubmit` view's loader while it saves, where its meta gives no `loadContent`
} as const

/** The id of a built-in phrase, published as `UIRenderPhraseId`. */
export type BuiltInPhraseId = keyof typeof BUILT_IN_PHRASES

/** The namespace a host registers the built-in phrases under, in its own i18n. */
export const PHRASE_NAMESPACE = 'ui-render'

/**
 * The built-in phrase `id` in the language of `translate`, which is the document's translator.
 *
 * It asks `translate` once, for `ui-render:<ID>`. The answer is the translation when it is a non-empty
 * string other than the key itself or the key without its namespace: an i18next-based host translate answers
 * a key it does not have with the first, plain i18next with the second. Any other answer gives the
 * English text. A host's translate is also handed data values to show, so it already returns a string it
 * does not know as it was given, and that is what makes the check reliable.
 *
 * The `{name}` placeholders of the text that comes out are filled from `variables` after that, and a
 * placeholder with no variable stays as written: a host's text may leave out a variable or misspell one.
 *
 * What it returns is in the document's language already. Show it where nothing translates it again: in a
 * `Text`, give it `alreadyTranslated` as its translator.
 */
export function phrase (translate: Translate, id: BuiltInPhraseId, variables?: Record<string, unknown>): string {
  const key = `${PHRASE_NAMESPACE}:${id}`
  const answer: unknown = translate(key)
  const text = typeof answer === 'string' && answer !== '' && answer !== key && answer !== id
    ? answer
    : BUILT_IN_PHRASES[id]
  return variables ? interpolateString(text, variables, { suppressError: true }) : text
}

/**
 * The translator for a `Text` that shows what `phrase` returned. A `Text` translates a string it shows,
 * and this one is translated already: it shows as it is.
 */
export const alreadyTranslated: Translate = value => value

/**
 * A built-in phrase that a component shows later, in its own language: a validation message, which a validator
 * returns as a field's error, and a popup's title, which the popup translates. Neither the validator nor what
 * opens the popup knows the document's translator. The `Text` that shows the message does, and shows it as its
 * phrase in the language of its `translate`, as it shows a boolean (`components/Text.tsx`). The host's
 * `getValidationErrors` is handed the text in the language of the document's `translate`.
 *
 * A validator makes each of its messages once and returns that one each time: final-form tells a field that its
 * error changed when the error is another object, so a new one for the same message would render the field again.
 */
export type PhraseMessage = {
  readonly phrase: BuiltInPhraseId
  readonly variables?: Readonly<Record<string, unknown>>
}

/** A message that shows the built-in phrase `id`, with its placeholders filled from `variables` (`PhraseMessage`). */
export function phraseMessage (id: BuiltInPhraseId, variables?: Record<string, unknown>): PhraseMessage {
  return Object.freeze(variables ? { phrase: id, variables: Object.freeze({ ...variables }) } : { phrase: id })
}

/** Whether `value` is a `PhraseMessage`: an object whose `phrase` is the id of a built-in phrase. */
export function isPhraseMessage (value: unknown): value is PhraseMessage {
  return typeof value === 'object' && value !== null
    && Object.prototype.hasOwnProperty.call(BUILT_IN_PHRASES, String((value as { phrase?: unknown }).phrase))
}

/** A piece of what `phraseParts` returns: text, or the placeholder a component shows a value of its own in. */
export type PhrasePart = string | { readonly placeholder: string }

/**
 * The built-in phrase `id` in the language of `translate`, cut at its placeholders `names`, for a component that
 * shows each of those values as an element of its own, such as a file name in bold. `'{file} must be under
 * {size}'`, cut at `file` and `size`, is `[{ placeholder: 'file' }, 'must be under', { placeholder: 'size' }]`.
 *
 * A piece of text is trimmed, since the component spaces the elements, and an empty one is left out. Any other
 * placeholder stays in the text as it is written, as `phrase` leaves one it has no variable for.
 */
export function phraseParts (translate: Translate, id: BuiltInPhraseId, names: readonly string[]): PhrasePart[] {
  const text = phrase(translate, id)
  const parts: PhrasePart[] = []
  const keep = (piece: string) => {
    const trimmed = piece.trim()
    if (trimmed) parts.push(trimmed)
  }
  const placeholders = /\{([^{}]+)\}/g
  let from = 0
  let match: RegExpExecArray | null
  while ((match = placeholders.exec(text)) !== null) {
    if (names.indexOf(match[1]) === -1) continue
    keep(text.slice(from, match.index))
    parts.push({ placeholder: match[1] })
    from = match.index + match[0].length
  }
  keep(text.slice(from))
  return parts
}
