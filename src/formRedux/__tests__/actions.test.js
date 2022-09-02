import { ERROR, FINISH, START, SUBMIT, SUCCESS } from 'ui-utils-pack'
import { isFormActionType } from '../actions'
import { FORM_ACTION_TYPE } from '../constants'

it(`${isFormActionType.name}() matches correct action type`, () => {
  const FORM = 'login'
  const action = {meta: {form: FORM}}
  expect(isFormActionType(FORM, SUBMIT, SUCCESS)(action)).toBe(false)
  expect(isFormActionType(FORM, SUBMIT, ERROR)(action)).toBe(false)
  expect(isFormActionType(FORM, SUBMIT, START)(action)).toBe(false)
  expect(isFormActionType(FORM, SUBMIT, FINISH)(action)).toBe(false)

  action.type = FORM_ACTION_TYPE[SUBMIT][SUCCESS]
  expect(isFormActionType(FORM, SUBMIT, SUCCESS)(action)).toBe(true)
  expect(isFormActionType(FORM, SUBMIT, ERROR)(action)).toBe(false)
  expect(isFormActionType(FORM, SUBMIT, START)(action)).toBe(false)
  expect(isFormActionType(FORM, SUBMIT, FINISH)(action)).toBe(false)

  action.type = FORM_ACTION_TYPE[SUBMIT][ERROR]
  expect(isFormActionType(FORM, SUBMIT, SUCCESS)(action)).toBe(false)
  expect(isFormActionType(FORM, SUBMIT, ERROR)(action)).toBe(true)
  expect(isFormActionType(FORM, SUBMIT, START)(action)).toBe(false)
  expect(isFormActionType(FORM, SUBMIT, FINISH)(action)).toBe(false)

  action.type = FORM_ACTION_TYPE[SUBMIT][START]
  expect(isFormActionType(FORM, SUBMIT, SUCCESS)(action)).toBe(false)
  expect(isFormActionType(FORM, SUBMIT, ERROR)(action)).toBe(false)
  expect(isFormActionType(FORM, SUBMIT, START)(action)).toBe(true)
  expect(isFormActionType(FORM, SUBMIT, FINISH)(action)).toBe(false)

  action.type = FORM_ACTION_TYPE[SUBMIT][FINISH]
  expect(isFormActionType(FORM, SUBMIT, SUCCESS)(action)).toBe(false)
  expect(isFormActionType(FORM, SUBMIT, ERROR)(action)).toBe(false)
  expect(isFormActionType(FORM, SUBMIT, START)(action)).toBe(false)
  expect(isFormActionType(FORM, SUBMIT, FINISH)(action)).toBe(true)

  action.meta = {form: 'different-form'}
  expect(isFormActionType(FORM, SUBMIT, SUCCESS)(action)).toBe(false)
  expect(isFormActionType(FORM, SUBMIT, ERROR)(action)).toBe(false)
  expect(isFormActionType(FORM, SUBMIT, START)(action)).toBe(false)
  expect(isFormActionType(FORM, SUBMIT, FINISH)(action)).toBe(false)
})
