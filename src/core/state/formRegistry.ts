/**
 * THE MUTABLE REGISTRIES THE ENGINE AND THE FORM MODULE BOTH WRITE TO.
 * =============================================================================================
 *
 * These three lived one on each side of the `engine` ↔ `modules/form` boundary, and each side
 * reached across for the other's — the import cycle §2.6-4 catalogued and §9.3 step 2 dissolves.
 * They are module-level and shared by every `UIRender` on the page, which is a defect in its own
 * right: §9.3 step 3 moves them to per-instance context. This module exists to make that step a
 * change in ONE place rather than an archaeology exercise, so nothing else belongs in it.
 *
 * It sits below `components` and `modules` and above `utils`: both layers may import it, it may
 * import nothing but `utils`, and the ESLint layer rules in `package.json` enforce that.
 *
 * `storedTouched` is a `let` because its owner REPLACES it rather than clearing it key by key. A
 * binding can only be reassigned by the module that declares it, so it has a clearing function
 * here; the alternative — exporting a setter, or re-exporting a `let` through three modules — is
 * how a live binding quietly becomes a stale copy.
 */

/** What a form registers about itself, keyed by the `initialValues` snapshot it was mounted with. */
type RegisteredForm = {
	meta: unknown,
	form: unknown,
}

/**
 * Every active form on the page, so any one of them can read the others' data.
 * Keyed by object identity: a fresh `{...initialValues}` copy per mount, which is also why an
 * entry has to be deleted before its key is replaced.
 */
export const formsStorage = new Map<object, RegisteredForm>()

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
 * Fields the user has touched, kept beyond what final-form reports: a field blurred in a row that
 * has since re-rendered still counts as touched for the purpose of showing its error.
 */
export let storedTouched: Record<string, boolean> = {}

/** Forget every touched field. Called when a form is re-initialised with different values. */
export function clearStoredTouched (): void {
	storedTouched = {}
}
