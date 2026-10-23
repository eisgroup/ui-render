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
  NO: 'No', // A value of `false`, shown as text
  TOTAL: 'Total', // A pie chart's centre, under the total of its values
  YES: 'Yes', // A value of `true`, shown as text
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
