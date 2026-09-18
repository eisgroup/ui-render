/**
 * THE TYPE ARM OF THE CONTRACT AGREEMENT (§9.4, §9.6-E1). Compiled, never imported, never shipped —
 * it is excluded from the package by `files` in package.json and lives here only because the types
 * it checks cannot be reached from anywhere else (`export =` forces namespace membership).
 *
 * WHY THIS FILE EXISTS AT ALL. `src/demo/examples/__tests__/examples.meta-contract.test.js` pins a
 * biconditional over a fixed table: the published schema rejects a shape exactly when the dev-mode
 * validator calls it an error. Jest can hold two of the three parties to that agreement, but it can
 * never hold the third — Babel strips types file by file, so a wrong annotation in a `.test.ts`
 * passes silently. Types can only be asserted by a compiler. So the same table is mirrored here and
 * `npm run typecheck:contract` is the assertion.
 *
 * HOW TO READ IT. Each row of AGREEMENT_TABLE appears once:
 *   - `engineAccepts: true`  -> a plain assignment. It must COMPILE.
 *   - `engineAccepts: false` -> a `@ts-expect-error`. It must NOT compile — and `@ts-expect-error`
 *     fails the build if the line turns out to be fine, so this direction is checked too.
 *
 * KEEP IT IN STEP. Adding a row to AGREEMENT_TABLE without adding it here leaves the types
 * unchecked for that shape while the Jest suite stays green. There is no automatic link between the
 * two lists, and pretending otherwise would be worse than saying so: this comment is the link.
 */
import UIRender = require('./UIRender')

type Meta = UIRender.Meta

/* ---------------------------------------------------------------------------------------------
 * Tolerated by the engine: null attributes are deleted before rendering.
 * ------------------------------------------------------------------------------------------- */

const itemsNull: Meta = { view: 'Text', items: null }
const headersNull: Meta = { view: 'Table', name: 'rows', headers: null }
const extraHeadersNull: Meta = { view: 'Table', name: 'rows', extraHeaders: null }
const extraItemsNull: Meta = { view: 'Table', name: 'rows', extraItems: null }
const nameNull: Meta = { view: 'Text', name: null }
const showIfNull: Meta = { view: 'Text', showIf: null }

/* classNames() recurses over arrays and reads truthy object keys. */
const classNameArray: Meta = { view: 'Text', className: ['a', 'b'] }
const stylesArray: Meta = { view: 'Text', styles: ['a'] }

/* ---------------------------------------------------------------------------------------------
 * Genuine crashes — the shapes the contract exists to catch.
 * ------------------------------------------------------------------------------------------- */

// @ts-expect-error items must be a list of nodes, not a string (the engine throws on this)
const itemsString: Meta = { view: 'Text', items: 'nope' }
// @ts-expect-error headers must be a list of nodes, not a number (the engine throws on this)
const headersNumber: Meta = { view: 'Table', name: 'rows', headers: 7 }

/* ---------------------------------------------------------------------------------------------
 * PERMISSIVENESS, pinned in the accepting direction. A contract stricter than the engine reddens an
 * author's editor on working meta, which §9.4 records as worse than a loose one. These are the
 * shapes the corpus actually contains and the type must never start rejecting.
 * ------------------------------------------------------------------------------------------- */

/** 65 of the 95 keys the tracked examples use are undeclared. All of them must still compile. */
const undeclaredKeys: Meta = { view: 'Row', '@class': 'x', id: 7, options: [], compact: true }

/** An unlisted view renders a placeholder; it is not an error. */
const hostSpecificView: Meta = { view: 'SomeHostSpecificView' }

/** The engine strips these two before rendering. */
const rootKeys: Meta = { $schema: './meta.schema.json', metaVersion: '1', view: 'Row' }

/** Nesting: `items` entries may be nodes or null, and `meta` recurses into a whole document. */
const nested: Meta = {
    view: 'Row',
    items: [{ view: 'Text', name: 'a.b' }, null],
    meta: { view: 'Col', items: [] },
}

/* ---------------------------------------------------------------------------------------------
 * The `render*` pattern — the ONE place these types are not vacuous. The schema says
 * `patternProperties: { "^render": … }`; the type says it with a template-literal key, and that
 * survives the open index signature the corpus forces on everything else.
 * ------------------------------------------------------------------------------------------- */

const rendererByName: Meta = { view: 'Table', renderCell: 'Currency' }
const rendererByObject: Meta = { view: 'Table', renderCell: { name: 'Currency' } }
// @ts-expect-error a render* key must be a renderer, not a number
const rendererBad: Meta = { view: 'Table', renderCell: 7 }

/* ---------------------------------------------------------------------------------------------
 * THE COLLAPSE PROBE. `'Row' | 'Col' | string` IS `string`, and the collapse is invisible in review
 * because the union still reads as a list. If someone "simplifies" `(string & {})` to `| string`,
 * the vocabularies keep compiling, autocomplete dies silently, and only this fails.
 * ------------------------------------------------------------------------------------------- */

type Eq<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false

const viewIsNotJustString: Eq<UIRender.MetaView, string> = false
const renderIsNotJustString: Eq<UIRender.MetaRenderMethod, string> = false
const actionIsNotJustString: Eq<UIRender.MetaActionName, string> = false
const normalizerIsNotJustString: Eq<UIRender.MetaNormalizerName, string> = false
const inputTypeIsNotJustString: Eq<UIRender.MetaInputType, string> = false

/** …while still accepting any string, which is what "open" means. */
const openView: UIRender.MetaView = 'NotADeclaredView'

/* Reference every binding so `noUnusedLocals` stays available to whoever turns it on. */
void itemsNull; void headersNull; void extraHeadersNull; void extraItemsNull; void nameNull
void showIfNull; void classNameArray; void stylesArray; void itemsString; void headersNumber
void undeclaredKeys; void hostSpecificView; void rootKeys; void nested
void rendererByName; void rendererByObject; void rendererBad
void viewIsNotJustString; void renderIsNotJustString; void actionIsNotJustString
void normalizerIsNotJustString; void inputTypeIsNotJustString; void openView
