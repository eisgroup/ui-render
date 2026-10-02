import { FIELD } from '../variables/fields'
import { email, isRequired, maxLength, password, url } from '../../components/inputs/validationRules'

/**
 * CONSTANT VARIABLES ==========================================================
 * =============================================================================
 */

// The five field views this module used to declare live in `variables/fields.ts` with the rest of
// the vocabulary (§9.3 step 3). They were registered here, while `engine/formData.ts` compares against
// `FIELD.TYPE.SELECT` — so that comparison worked only because something on the engine's import
// chain happened to pull this file in. Removing one unrelated import broke Select reordering, in a
// suite that never mentions this module. Same defect as the six engine views moved at step 2.

// Validation Definitions
FIELD.VALIDATE = {
  EMAIL: 'email',
  MAX_LENGTH: 'maxLength',
  PASSWORD: 'password',
  REQUIRED: 'required',
  URL: 'url',
}
FIELD.VALIDATION = {
  [FIELD.VALIDATE.EMAIL]: email,
  // The VALIDATOR, at the factory's default of 100 characters: a meta names it as `validate: 'maxLength'`,
  // and every name here is called with the field's value. The factory itself was registered, so the
  // validator returned a function, an error, for every value, and such a form could never be submitted.
  [FIELD.VALIDATE.MAX_LENGTH]: maxLength(),
  [FIELD.VALIDATE.PASSWORD]: password,
  [FIELD.VALIDATE.REQUIRED]: isRequired,
  [FIELD.VALIDATE.URL]: url,
}
