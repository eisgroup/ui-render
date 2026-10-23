<!--
  GENERATED FILE — DO NOT EDIT. Run `npm run docs:phrases` to regenerate.
  The ids, English texts and places come from BUILT_IN_PHRASES in src/core/utils/phrases.ts.
  Generator: scripts/generate-phrase-reference.js.
-->

# Built-in phrases

The texts UI Render writes itself, as opposed to the labels a `meta.json` gives it. Your `translate`
prop is asked for each as `ui-render:<ID>`: register a `ui-render` namespace in your i18n, with the
ids below as its keys. The README's section "Translating the built-in texts (consumer)" shows an
example.

Where your `translate` answers with the key itself (`ui-render:TOTAL`), with the key without its
namespace (`TOTAL`), or with an empty string, UI Render shows the English text below. Without a
`ui-render` namespace, every one of them shows in English.

A `{name}` in a text is a placeholder that UI Render fills after your translation comes back:
keep it in single braces where your translation needs the value.

**This page is generated.** Run `npm run docs:phrases` after changing `BUILT_IN_PHRASES` in
`src/core/utils/phrases.ts`. The package's types list the same ids as `UIRender.UIRenderPhraseId`.

## Phrases (41)

| Id | English text | Where it shows |
| --- | --- | --- |
| `DOWNLOAD_FAILED` | Download Failed! | The popup a failed download opens, under its title, which is why the download failed |
| `END_DATE_CANNOT_BE_LESS_THAN_START_DATE` | End date cannot be less than start date | A period's end date, checked by `notWithinRange`, where it is before the start date |
| `ERROR` | Error | The title of the popup a failed `onApplyPeriods` opens, and of a template popup with no `title` and no `items` |
| `FILE` | File | What an upload takes, where its meta gives no `label` or `fileType`: in its header, and in its drop zone where it takes one file |
| `FILES` | Files | What an upload takes, where its meta gives no `label` or `fileType`: in its drop zone, where it takes several files |
| `FILE_MUST_BE_UNDER` | {file} must be under {size} | The popup a dropped file larger than an upload's `maxSize` opens; `{file}` is the file's name, `{size}` the limit |
| `FILE_UPLOAD_FAILED` | File Upload Failed! | The title of the popup a dropped file of a type an upload does not take opens |
| `INVALID_DATE` | Invalid date | A date field left with text that is no date in its format, which it keeps showing |
| `INVALID_EMAIL_ADDRESS` | Invalid email address | A field with `validate: "email"` that holds no email address |
| `INVALID_URL` | Invalid URL | A field with `validate: "url"` that holds no URL with a protocol |
| `MAXIMUM_FILE_SIZE_EXCEEDED` | Maximum File Size Exceeded! | The title of the popup a dropped file larger than an upload's `maxSize` opens |
| `MUST_BE_LESS_THAN_CHARACTERS` | Must be less than {count} characters | A field with `validate: "maxLength"` that holds more; `{count}` is the limit, 100 |
| `MUST_BE_MAXIMUM` | Must be maximum {max} | A number field above its `max`; `{max}` is the `max` |
| `MUST_BE_MINIMUM` | Must be minimum {min} | A number field below its `min`; `{min}` is the `min` |
| `NEXT_PAGE` | Next page | The name a screen reader gives the button to a table's next page |
| `NO` | No | A value of `false`, shown as text |
| `OFF` | OFF | A toggle's off side, where it has no label |
| `OK` | Ok | The button that closes a popup |
| `ON` | ON | A toggle's on side, where it has no label |
| `PAGE` | Page {page} | The name a screen reader gives the button to one page of a table; `{page}` is its number |
| `PAGINATION` | Pagination | The name a screen reader gives a table's page navigation |
| `PASSWORD_IS_TOO_WEAK` | Password is too weak | A field with `validate: "password"` that holds a weak password |
| `PERIODS_CANNOT_OVERLAP` | Periods cannot overlap | A period's dates, checked by `notWithinRange`, where the period overlaps another row's |
| `POPUP` | Popup | The name a screen reader gives a popup with no title and no message |
| `POPUP_CONTENT_IS_EMPTY` | Popup content is empty | The popup a `popupOpen` opens for a template popup with no `items` |
| `PREVIOUS_PAGE` | Previous page | The name a screen reader gives the button to a table's previous page |
| `REQUIRED` | Required | A required field left empty |
| `SELECT` | Select | A select's placeholder, where its meta gives none |
| `SELECT_NAME` | Select {name} | The name a screen reader gives a select with no `label`; `{name}` is its `name` |
| `SELECT_OR_DROP` | Select or Drop | An upload's drop zone, above what it takes |
| `SLIDER_MAXIMUM` | {name}, maximum | The name a screen reader gives a range slider's upper handle; `{name}` is the slider's `label`, or else its `name` |
| `SLIDER_MINIMUM` | {name}, minimum | The name a screen reader gives a range slider's lower handle; `{name}` is the slider's `label`, or else its `name` |
| `START_AND_END_DATE_CANNOT_BE_THE_SAME` | Start date and end date cannot be the same | A period's two dates, checked by `notWithinRange`, where they are the same |
| `START_DATE_CANNOT_BE_MORE_THAN_END_DATE` | Start date cannot be more than end date | A period's start date, checked by `notWithinRange`, where it is after the end date |
| `SYNCING` | Syncing... | An `AutoSubmit` view's loader while it saves, where its meta gives no `loadContent` |
| `TABLE_HAS_NO_DATA` | Table has no data! | A table with no `headers` and no rows to take them from |
| `TOTAL` | Total | A pie chart's centre, under the total of its values |
| `UPLOAD_FILE` | Upload {file} | An upload's header, and its hover text where it has no `label` or `fileType`; `{file}` is its `label` or `fileType`, or else `FILE` |
| `UPLOAD_FILES_ONLY` | Upload {formats} files only | The popup a dropped file of a type an upload does not take opens; `{formats}` lists the types it takes |
| `UPLOAD_LABEL_FILE` | Upload {label} File | An upload's hover text, where it has a `label` or `fileType` and no `labelOnHover`; `{label}` is that label |
| `YES` | Yes | A value of `true`, shown as text |
