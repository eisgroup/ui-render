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
 * import nothing but `utils`, and the ESLint layer rules in `package.json` enforce that.
 *
 * The errors, the touched fields and the baselines are keyed by the final-form `form` object, the key
 * BOTH sides of the boundary already hold, in weak maps, so an unmounted form's entries are collected
 * with it. `formsStorage` is a plain map, and each form deletes its own entry when it unmounts.
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
