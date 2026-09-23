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
 * `errorsMap` and `storedTouched` are `let` because their owners REPLACE them rather than clearing
 * them key by key. A binding can only be reassigned by the module that declares it, so each has a
 * clearing function here; the alternative — exporting a setter, or re-exporting a `let` through
 * three modules — is how a live binding quietly becomes a stale copy.
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

/** Validation errors accumulated across every form instance, by field name. */
export let errorsMap: Record<string, string> = {}

/** Drop every accumulated error. Replaces the map rather than emptying it, as the original did. */
export function clearErrorsMap (): void {
	errorsMap = {}
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
