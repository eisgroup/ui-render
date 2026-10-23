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
}

/**
 * Every active form on the page. Keyed by object identity: a fresh `{...initialValues}` copy per
 * mount, which is also why an entry has to be deleted before its key is replaced.
 */
export const formsStorage = new Map<object, RegisteredForm>()

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
 * Validation errors by field name, PER FORM.
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
const errorsByForm = new WeakMap<object, Record<string, string>>()

/** The error map belonging to one form, created on first use. */
export function errorsFor (form: object): Record<string, string> {
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
