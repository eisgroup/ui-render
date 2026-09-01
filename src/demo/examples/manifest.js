/**
 * CANONICAL EXAMPLE MANIFEST ==================================================
 *
 * The single source of truth for "every demo example". Both the demo page
 * (`src/demo/pages/Examples.jsx`) and the test harness
 * (`src/demo/examples/__tests__/*`) consume `EXAMPLES` from here, so "every
 * example" means the same set everywhere.
 *
 * TRACKED FILES ONLY (see UPGRADE-PLAN §0.8)
 * -----------------------------------------------------------------------------
 * `src/demo/examples/` is a working directory: contributors keep real customer
 * meta/data JSON in it while debugging, and those files are deliberately left
 * untracked. Nothing may therefore enumerate the directory to find examples.
 * This manifest is the one place a file is admitted, and
 * `__tests__/manifest.contract.test.js` enforces that every file it imports is
 * git-tracked, that every tracked file is either imported here or listed in
 * `UNREGISTERED_EXAMPLE_FILES` with a reason, and that no untracked file in the
 * directory is referenced. Add an example by importing it here — never by
 * globbing, and never by re-deriving the list somewhere else.
 * -----------------------------------------------------------------------------
 */
import allConfigData from './_data.json'
import allConfigMeta from './_meta.js'
import listData from './array-nested_data.json'
import download_meta from './button-download_meta.js'
import icon_meta from './button-icon_meta.js'
import * as tableForm from './data_component.js'
import decimalMeta from './decimal_meta.json'
import dropdownMeta from './dropdown_meta.json'
import exampleData from './example_data.json'
import exampleMeta from './example_meta.json'
import expandListMeta from './expand-list_meta.js'
import inputMeta from './input_meta.json'
import inputIntegerMeta from './input-integer_meta.json'
import inputIntegerData from './input-integer_data.json'
import inputToggle from './input_toggle.js'
import invalidArrayData from './invalid-array_data.json'
import invalidArrayMeta from './invalid-array_meta.json'
import listMeta from './list_meta.js'
import piechartSimpleData from './piechart-simple_data.json'
import piechartSimpleMeta from './piechart-simple_meta.json'
import popupMeta from './popup_meta.js'
import * as ratingDetails from './rating_details.js'
import rowListRelativeDataMeta from './rowlist-relative-data_meta.json'
import rowListRelativeDataData from './rowlist-relative-data_data.json'
import showIfCondition from './showIf.json'
import * as summaryBox from './summary-box.js'
import tabListMeta from './tab-list_meta.js'
import tableExtraItemsMeta from './table-extraItems_meta.json'
import tableNestedMeta from './table-nested_meta.js'
import tableVerticalMeta from './table-vertical_meta.json'
import * as tableMatrix from './table_matrix.js'
import * as tabs from './tabs_meta.js'
import uploadMeta from './upload_meta.js'
import uploadVariantsMeta from './upload-variants_meta.js'
import tablePaginationData from './table-pagination_data.json'
import tablePaginationMeta from './table-pagination_meta.json'
import sliderMeta from './slider_meta.js'
import sliderData from './slider_data.json'
import selectIndexData from './select-index_data.json'
import selectIndexMeta from './select-index_meta.json'
import selectStableData from './select-stable_data.json'
import selectStableMeta from './select-stable_meta.json'
import dropdownExperienceData from './dropdown-experience-data.json'
import dropdownExperienceMeta from './dropdown-experience-meta.json'
import selectCascadingData from './select-cascading-data.json'
import selectCascadingMeta from './select-cascading-meta.json'
import selectCascadingStableData from './select-cascading-stable-data.json'
import selectCascadingStableMeta from './select-cascading-stable-meta.json'
import selectReorderData from './select-reorder-data.json'
import selectReorderMeta from './select-reorder-meta.json'
import nestedDataKindData from './nested-datakind_data.json'
import nestedDataKindMeta from './nested-datakind_meta.json'

/**
 * Every registered example.
 *
 * @type {Array<{
 *   id: String,       - stable identifier; the demo URL hash, the test name and
 *                       the DOM snapshot key. Renaming an id renames a snapshot.
 *   title: String,    - human readable accordion label
 *   meta: Object,     - meta.json declaration passed to `UIRender`
 *   data: Object,     - data.json values passed as `data` and `initialValues`
 *   flags: Object,    - see FLAGS below; absent means "no flags"
 * }>}
 *
 * FLAGS
 * - `hostApi`   the example demonstrates host integration props: the demo mounts
 *               it with `apiCalls`, `translate`, `dateFormat`, `onDataChanged`,
 *               `getValidationErrors` and a "Get Data" button wired to
 *               `getFormData`. Without the flag the demo mounts the minimal
 *               prop set. Previously an inline id array inside Examples.jsx.
 * - `noSnapshot` excluded from the full-DOM contract snapshots, with the reason
 *               recorded at the use site. Nothing carries it today; it exists so
 *               that a genuinely non-deterministic example can be excluded
 *               explicitly instead of being papered over by a loose serializer.
 */
export const EXAMPLES = [
  // Dropdown
  {
    title: 'Dropdown',
    id: 'dropdown',
    data: exampleData,
    meta: dropdownMeta,
  },
  {
    title: 'Dropdown: Cascading (Experience)',
    id: 'dropdownExperience',
    data: dropdownExperienceData,
    meta: dropdownExperienceMeta,
  },
  // Select
  {
    title: 'Select: Index Value ({index})',
    id: 'selectIndexValue',
    data: selectIndexData,
    meta: selectIndexMeta,
    flags: {hostApi: true},
  },
  {
    title: 'Select: Stable Value (id)',
    id: 'selectStableValue',
    data: selectStableData,
    meta: selectStableMeta,
    flags: {hostApi: true},
  },
  {
    title: 'Select: Cascading (Category → Product)',
    id: 'selectCascading',
    data: selectCascadingData,
    meta: selectCascadingMeta,
    flags: {hostApi: true},
  },
  {
    title: 'Select: Cascading Stable Value (string)',
    id: 'selectCascadingStable',
    data: selectCascadingStableData,
    meta: selectCascadingStableMeta,
    flags: {hostApi: true},
  },
  {
    title: 'Select: Index Reorder on Get Data',
    id: 'selectReorder',
    data: selectReorderData,
    meta: selectReorderMeta,
    flags: {hostApi: true},
  },
  // Button
  {
    title: 'Button with Icon',
    id: 'buttonIcon',
    data: {},
    meta: icon_meta,
    flags: {hostApi: true},
  },
  {
    title: 'Button for Download File URL',
    id: 'buttonDownload',
    data: {},
    meta: download_meta,
  },
  // Input
  {
    title: 'Input',
    id: 'input',
    data: exampleData,
    meta: inputMeta,
  },
  {
    title: 'Input: Integer ≥ 0',
    id: 'inputIntegerMin0',
    data: inputIntegerData,
    meta: inputIntegerMeta,
  },
  {
    title: 'Input Toggle Checkbox',
    id: 'inputToggle',
    data: exampleData,
    meta: inputToggle,
  },
  {
    title: 'Decimal Points',
    id: 'decimal',
    data: exampleData,
    meta: decimalMeta,
  },
  // Layout
  {
    title: 'Dynamic Layout',
    id: 'layout',
    data: exampleData,
    meta: exampleMeta,
  },
  {
    title: 'Dynamic List',
    id: 'list',
    data: listData,
    meta: listMeta,
  },
  {
    title: 'Expand List',
    id: 'expandList',
    data: listData,
    meta: expandListMeta,
  },
  // Tabs
  {
    title: 'Tab List',
    id: 'tabList',
    data: listData,
    meta: tabListMeta,
  },
  {
    title: 'Tabs',
    id: 'tabs',
    data: listData,
    meta: tabs.meta,
  },
  {
    title: 'Tabs Buttoned',
    id: 'tabsButtoned',
    data: listData,
    meta: tabs.buttoned,
  },
  // Table
  {
    title: 'Table Nested within Table',
    id: 'tableNested',
    data: listData,
    meta: tableNestedMeta,
  },
  {
    title: 'Table Rows as Columns (Vertical Layout)',
    id: 'tableVertical',
    data: listData,
    meta: tableVerticalMeta,
  },
  {
    title: 'Table with Custom Data',
    id: 'tableExtraItems',
    data: exampleData,
    meta: tableExtraItemsMeta,
  },
  {
    title: 'Table with Matrix Data',
    id: 'tableMatrix',
    data: tableMatrix.data,
    meta: tableMatrix.meta,
  },
  {
    title: 'Table with Matrix Data (minimum required config)',
    id: 'tableMatrixRequired',
    data: tableMatrix.data,
    meta: tableMatrix.metaRequired,
  },
  {
    title: 'Table with Form Inputs',
    id: 'tableForm',
    data: tableForm.data,
    meta: tableForm.meta,
    flags: {hostApi: true},
  },
  {
    title: 'Nested dataKind table (add/remove inner rows)',
    id: 'nestedDataKind',
    data: nestedDataKindData,
    meta: nestedDataKindMeta,
    flags: {hostApi: true},
  },
  {
    title: 'Table with Pagination',
    id: 'tablePagination',
    data: tablePaginationData,
    meta: tablePaginationMeta,
  },
  // Other
  {
    title: 'Pie Chart',
    id: 'pieChart',
    data: piechartSimpleData,
    meta: piechartSimpleMeta,
  },
  {
    title: 'Popup Content',
    id: 'popupContent',
    data: listData,
    meta: popupMeta,
  },
  {
    title: 'Rating Details',
    id: 'ratingDetails',
    data: ratingDetails.data,
    meta: ratingDetails.meta,
    flags: {hostApi: true},
  },
  {
    title: 'RowList: relativeData false ancestors',
    id: 'rowListRelativeData',
    data: rowListRelativeDataData,
    meta: rowListRelativeDataMeta,
  },
  {
    title: 'Show If Condition',
    id: 'showIf',
    data: exampleData,
    meta: showIfCondition,
  },
  {
    title: 'Summary Box',
    id: 'summaryBox',
    data: summaryBox.data,
    meta: summaryBox.meta,
  },
  {
    title: 'Upload',
    id: 'upload',
    data: {},
    meta: uploadMeta,
  },
  {
    title: 'Upload: variants (single, multiple, image, readonly)',
    id: 'uploadVariants',
    data: {},
    meta: uploadVariantsMeta,
  },
  {
    title: 'Slider (single, range, marks, percent, disabled)',
    id: 'slider',
    data: sliderData,
    meta: sliderMeta,
  },
  {
    title: 'Invalid Array Data',
    id: 'invalidArray',
    data: invalidArrayData,
    meta: invalidArrayMeta,
  },
  {
    title: 'All Possible Configurations',
    id: 'all',
    data: allConfigData,
    meta: allConfigMeta,
  },
]

/**
 * Tracked files in `src/demo/examples/` that the manifest deliberately does NOT
 * register, each with the reason. Keeping them here rather than silently
 * ignoring them is what makes the tracked-file check total: a newly added
 * tracked file must be either imported above or classified here, so it cannot
 * slip in unnoticed — and an untracked customer JSON cannot be classified here
 * at all, because the check requires every key to be tracked.
 *
 * @type {Object<String, String>} filename -> reason
 */
export const UNREGISTERED_EXAMPLE_FILES = {
  'example_components.js': 'dynamic-component catalogue for a demo that was never wired up; no importer',
  'experience_data.json': 'orphaned pair, superseded by dropdown-experience-*; no importer',
  'experience_meta.json': 'orphaned pair, superseded by dropdown-experience-*; no importer',
  'piechart_meta.json': 'orphaned meta with no data pair, superseded by piechart-simple_meta; no importer',
  'select-experience-data.json': 'orphaned pair, superseded by select-cascading-*; no importer',
  'select-experience-meta.json': 'orphaned pair, superseded by select-cascading-*; no importer',
  'webstudio_data.json': 'orphaned pair kept as an external-producer meta sample; no importer',
  'webstudio_meta.json': 'orphaned pair kept as an external-producer meta sample; no importer',
}

/** Files in this directory that are infrastructure rather than example payloads. */
export const MANIFEST_INFRASTRUCTURE_FILES = [
  'manifest.js',
]

/** @returns {Boolean} true when the example opts into the given flag */
export const hasFlag = (example, flag) => Boolean(example.flags && example.flags[flag])

/** Examples covered by the full-DOM contract snapshots. */
export const snapshotExamples = () => EXAMPLES.filter(example => !hasFlag(example, 'noSnapshot'))
