/**
 * THE MUTABLE REGISTRIES THE ENGINE AND THE FORM MODULE BOTH WRITE TO.
 * =============================================================================================
 *
 * These lived one on each side of the `engine` ↔ `modules/form` boundary, and each side reached
 * across for the other's — the import cycle §2.6-4 catalogued and §9.3 step 2 dissolved. Sharing them
 * between every `UIRender` on the page was a defect of its own, fixed one registry at a time: the
 * errors and the touched fields are per form since §9.3 step 3, and the forms are read per document
 * tree since 2026-10-06 (`formsOf`). Nothing else belongs in this module.
 *
 * It sits below `components` and `modules` and above `utils`: both layers may import it, it may
 * import nothing but `utils`, and the ESLint layer rules in `eslint.config.js` enforce that.
 *
 * The errors, the touched fields, the baselines and the fields whose error the user can fix are keyed
 * by the final-form `form` object, the key BOTH sides of the boundary already hold, in weak maps, so an
 * unmounted form's entries are collected with it. `formsStorage` is a plain map, and each form deletes
 * its own entry when it unmounts.
 */

import type { FormApi } from 'final-form'

/** What a form registers about itself, keyed by the `initialValues` snapshot it was mounted with. */
export type RegisteredForm = {
	/** The document's meta: a nested document's says where its rows sit */
	meta: unknown,
	form: FormApi,
	/**
	 * The document tree the form belongs to: one `UIRender` and every document nested in it share it,
	 * and another `UIRender` on the page has its own. Its root's form layer makes it.
	 */
	tree: object,
	/**
	 * Whether the form is a table's draft row, the row a `renderExtraItem` declaration renders: it holds
	 * what the user types there, which is not the document's data until the row is added (`dataFormsOf`).
	 */
	draftRow: boolean,
	/**
	 * Whether the form holds the whole document from its root: a tree's root document's form, and a `useForm` block's
	 * whose `name` or `data` selects no values in a document that holds the whole document, which starts from that
	 * document's (`engine/Data.tsx`). Where more than one does, the merges take from each the fields it changed
	 * (`mergeDocuments` in `engine/formData.ts`). A block that selects values of its own holds them from its root too,
	 * and is no such form, nor one in a `Data` view that selects a section or a row.
	 */
	wholeDocument?: boolean,
}

/**
 * How many times what the page's forms hold has changed: a form registered, went or registered again (`formsStorage`),
 * or a form's values changed. The form a document renders counts its new values before the first of its subscribers
 * hears of them (`createBatchedForm`, `modules/form/batchedForm.ts`), so the count moves before anything that follows
 * the form decides. What the engine reads from a tree's forms is kept while the count stays the same
 * (`engine/keptRawFormsData.ts`). A change made to a form's values in place, which final-form tells nobody of, is
 * counted where it is made: the `submit` action's (`engine/rules.tsx`).
 *
 * The tree's tells (`tellTreeValues`) are no such signal: the form layer subscribes for them as the form commits, after
 * the nodes under it have subscribed, which then decide before the tree is told.
 */
let formsChanges = 0

/** How many times what the page's forms hold has changed. */
export function formsChangeCount (): number {
	return formsChanges
}

/** Counts a change of what the page's forms hold. */
export function countFormsChange (): void {
	formsChanges += 1
}

/**
 * Every active form on the page. Keyed by object identity: a fresh `{...initialValues}` copy per
 * mount, which is also why an entry has to be deleted before its key is replaced.
 *
 * Every entry set or deleted, and the storage cleared, counts as a change (`formsChangeCount`): a form registered again
 * with new initial values brings the meta of the render that brought them, which no values tell.
 */
class FormsStorage extends Map<object, RegisteredForm> {
	set (key: object, entry: RegisteredForm): this {
		countFormsChange()
		return super.set(key, entry)
	}

	delete (key: object): boolean {
		countFormsChange()
		return super.delete(key)
	}

	clear (): void {
		countFormsChange()
		super.clear()
	}
}

export const formsStorage = new FormsStorage()

/**
 * The forms of one document tree, which is what a document reads its data from: its own form and its
 * nested documents'. It read every form on the page until 2026-10-06, so a second `UIRender` on the
 * same page found its fields in the first one's `getFormData`, and the first one's in its own.
 */
export function formsOf (tree: object | undefined): Map<object, RegisteredForm> {
	const forms = new Map<object, RegisteredForm>()
	if (tree === undefined) return forms
	formsStorage.forEach((entry, key) => {
		if (entry.tree === tree) forms.set(key, entry)
	})
	return forms
}

/**
 * The forms whose values are a document tree's data: every form of `formsOf(tree)` but a table's draft
 * row's. Until 2026-10-23 a draft row's values were data as soon as the user typed them: `getFormData`
 * returned them, and an `onApplyPeriods` and an upload sent them, as one more row, malformed, and a submit
 * sent them as a row of a table that had none. They are data once Add puts them in the table's rows. The
 * errors a host hears are still every form's (`formsOf`).
 */
export function dataFormsOf (tree: object | undefined): Map<object, RegisteredForm> {
	const forms = formsOf(tree)
	forms.forEach((entry, key) => {
		if (entry.draftRow) forms.delete(key)
	})
	return forms
}

/**
 * What a document tree tells of one of its forms: its values before and after, `undefined` before a form registers
 * and after it goes, and the count of the tree's tells it makes.
 */
export type TreeValuesTell = { readonly version: number, readonly form: object, readonly previous: unknown, readonly values: unknown }

export type TreeValuesListener = (tell: TreeValuesTell) => void

/**
 * The values of a document tree's forms, PER TREE. A node whose `showIf` reads a field of another form of its tree
 * than its own, a `useForm` block's, hears that form's changes here (`engine/showIfFollowsForm.ts`): its own document
 * renders only on changes of its own form. The form layer tells (`modules/form/utils.tsx`, `WithForm`), as a form
 * registers, on every change of its values, and as it goes.
 *
 * A tell says what the form held before as well, so a listener needs no memory of the forms it has not heard yet. The
 * latest tells are kept, oldest first, for a node to catch up with those made between its render and its commit: a
 * node that mounts hears none of them, and one that renders again hears them with the decision of its last render.
 * They are kept until the task that made them ends, where a node renders and commits: one that commits in a later task
 * finds them gone, and decides again. Kept for longer, they held a copy of a form's values for each of the latest
 * thousand changes, in every document. A WeakMap, so a tree that has gone takes all of it with it.
 */
type TreeValues = {
	listeners: Set<TreeValuesListener>,
	/** The values each live form told last */
	live: Map<object, unknown>,
	version: number,
	log: TreeValuesTell[],
	/** Whether the log is to be emptied as the task ends */
	emptying: boolean,
	/** How many tasks that told have ended */
	task: number,
}

/** How many tells a tree keeps in a task: the registrations of a mount, and more. A node that rendered before more decides again. */
const LOG_LENGTH = 1024

const treeValues = new WeakMap<object, TreeValues>()

function valuesOf (tree: object): TreeValues {
	let entry = treeValues.get(tree)
	if (!entry) {
		entry = { listeners: new Set(), live: new Map(), version: 0, log: [], emptying: false, task: 0 }
		treeValues.set(tree, entry)
	}
	return entry
}

/** How many tells `tree` has made: a node reads it as it renders, and catches up with the tells after it. */
export function treeValuesVersion (tree: object): number {
	const entry = treeValues.get(tree)
	return entry ? entry.version : 0
}

/** How many of the tasks in which `tree` told have ended: a node counts its renders per task by it. */
export function treeValuesTask (tree: object): number {
	const entry = treeValues.get(tree)
	return entry ? entry.task : 0
}

/** The tells `tree` has made after `version`, oldest first, or `undefined` once it keeps no longer all of them. */
export function treeValuesTellsSince (tree: object, version: number): readonly TreeValuesTell[] | undefined {
	const entry = treeValues.get(tree)
	const count = entry ? entry.version - version : 0
	if (!entry || count <= 0) return []
	return count > entry.log.length ? undefined : entry.log.slice(entry.log.length - count)
}

/** Hears every form of `tree`, from now on. Returns what stops it. */
export function listenToTreeValues (tree: object, listener: TreeValuesListener): () => void {
	const { listeners } = valuesOf(tree)
	listeners.add(listener)
	return () => { listeners.delete(listener) }
}

/** Tells the listeners of `tree` that the values of its `form` are `values`, `undefined` once it has gone. */
export function tellTreeValues (tree: object, form: object, values: unknown): void {
	const entry = valuesOf(tree)
	const previous = entry.live.get(form)
	if (values === undefined) entry.live.delete(form)
	else entry.live.set(form, values)
	entry.version += 1
	const tell = { version: entry.version, form, previous, values }
	entry.log.push(tell)
	if (entry.log.length > LOG_LENGTH) entry.log.shift()
	if (!entry.emptying) {
		entry.emptying = true
		const emptied = entry
		setTimeout(() => {
			emptied.log = []
			emptied.emptying = false
			emptied.task += 1
		}, 0)
	}
	// A copy, and only who still listens: a listener that a render stops while the others hear is told nothing more.
	const { listeners } = entry
	Array.from(listeners).forEach(listener => { if (listeners.has(listener)) listener(tell) })
}

/**
 * Validation errors by field name, PER FORM. A message is a string, or a built-in phrase (`PhraseMessage`,
 * `utils/phrases.ts`), which the report to the host puts in its document's language.
 *
 * One shared map until §9.3 step 3 split it, and sharing it was visible to anyone mounting two
 * documents on one page: the second document's `componentDidUpdate` found the first one's errors
 * here and reported them to its own `getValidationErrors` callback as if they were its own.
 *
 * Keyed by the final-form `form` object because both sides of the boundary already hold it and
 * neither needs a new reference to the other: `errorsProcessing(form, meta)` takes it as an
 * argument, the engine reads `this.form`, and the form module's subscription closes over the same
 * object. A WeakMap, so an unmounted form's errors are collected with it and nothing has to be
 * cleaned up between tests.
 */
const errorsByForm = new WeakMap<object, Record<string, unknown>>()

/** The error map belonging to one form, created on first use. */
export function errorsFor (form: object): Record<string, unknown> {
	let errors = errorsByForm.get(form)
	if (!errors) {
		errors = {}
		errorsByForm.set(form, errors)
	}
	return errors
}

/**
 * Drop one form's accumulated errors. Deletes the keys rather than replacing the object, so a
 * caller holding the map from `errorsFor()` sees the clearing instead of a stale copy.
 */
export function clearErrorsFor (form: object): void {
	const errors = errorsFor(form)
	for (const key of Object.keys(errors)) delete errors[key]
}

/**
 * Fields the user has touched, PER FORM, kept beyond what final-form reports: a field blurred in a
 * row that has since re-rendered still counts as touched for the purpose of showing its error.
 *
 * One shared object until §9.3 step 3. Sharing it produced no symptom anyone could observe — four
 * scenarios were probed and the display condition `touchedFor(form)[name] || touched || !pristine`
 * is dominated by final-form's own `touched` while the field is mounted — but it did make mounting
 * a SECOND document empty the first one's registry, because the baseline check below belonged to
 * whichever form initialised last. That is the case this registry exists for, so the two were
 * converted together rather than one at a time.
 */
const touchedByForm = new WeakMap<object, Record<string, boolean>>()

/** The touched-field registry belonging to one form, created on first use. */
export function touchedFor (form: object): Record<string, boolean> {
	let touched = touchedByForm.get(form)
	if (!touched) {
		touched = {}
		touchedByForm.set(form, touched)
	}
	return touched
}

/**
 * Forget one form's touched fields. Deletes the keys rather than replacing the object, so a caller
 * holding the registry from `touchedFor()` sees the clearing instead of a stale copy.
 */
export function clearTouchedFor (form: object): void {
	const touched = touchedFor(form)
	for (const key of Object.keys(touched)) delete touched[key]
}

/**
 * The `initialValues` a form was last seen with — the baseline a later one is compared against to
 * decide whether the form has been re-initialised and its touched fields and errors should go.
 *
 * Was a single module-level `let`, which is what made one document's mount reset another's: the
 * first form to arrive owned the comparison for every form after it.
 */
const baselineByForm = new WeakMap<object, unknown>()

/** Whether this form has a baseline yet. Distinguishes "never seen" from "seen as undefined". */
export function hasBaseline (form: object): boolean {
	return baselineByForm.has(form)
}

/** The `initialValues` this form was last seen with. */
export function baselineOf (form: object): unknown {
	return baselineByForm.get(form)
}

/** Record the `initialValues` this form is now working from. */
export function setBaseline (form: object, initialValues: unknown): void {
	baselineByForm.set(form, initialValues)
}

/**
 * The fields whose validation error the user can fix, PER FORM: by name, how many such fields are mounted.
 * `asField` and `asInputDateField` count each field they host while it is mounted, unless it is disabled or
 * readonly. They are the two that show a field's error, and these are the fields whose shown error holds an
 * `onApplyPeriods` back (`showsAnError`, `engine/errorMapping.ts`).
 *
 * A field the user cannot change holds nothing back: the error it shows is one only the host can clear. A
 * table column the host computes from the other columns is declared disabled and required, and the host
 * fills it in its answer to that action. A row added without it would show `Required` there once a submit
 * had failed, and the action would have waited for it for good.
 */
const fixableByForm = new WeakMap<object, Map<string, number>>()

/** The fields of one form whose error the user can fix, with how many of each are mounted. */
export function fixableFieldsOf (form: object): ReadonlyMap<string, number> {
	return fixableByForm.get(form) || new Map()
}

/**
 * Count one mounted field of `form` whose error the user can fix. Returns what uncounts it, which the field
 * calls once, when it goes or can no longer be changed.
 */
export function holdFixableField (form: object, name: string): () => void {
	let fields = fixableByForm.get(form)
	if (!fields) {
		fields = new Map()
		fixableByForm.set(form, fields)
	}
	const held = fields
	held.set(name, (held.get(name) || 0) + 1)
	return () => {
		const count = held.get(name)! // not undefined: this hold counted it, and is released once
		if (count > 1) held.set(name, count - 1)
		else held.delete(name)
	}
}

/**
 * How many times the `reset` action has reset a form, PER FORM. A date field left with text that is no date shows
 * it, and its error, only until the form's next reset (`asInputDateField`): the form's values hold the date it had
 * before, so a reset that finds the value unchanged says nothing to the field.
 *
 * Counted by the action alone, not by every `form.reset`: the form layer resets a form to new initial values too,
 * when a host or a parent document hands them over, and a field whose value they left unchanged keeps its text.
 */
const resetsByForm = new WeakMap<object, number>()

/** How many times the `reset` action has reset this form; 0 when there is no form. */
export function resetsOf (form: object | undefined): number {
	return form ? resetsByForm.get(form) || 0 : 0
}

/** Count one reset of `form` by the `reset` action, before it resets the form's values. */
export function countReset (form: object): void {
	resetsByForm.set(form, resetsOf(form) + 1)
}
