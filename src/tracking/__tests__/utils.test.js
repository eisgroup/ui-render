import { DELETE, performStorage } from 'ui-utils-pack'
import { REF } from '../constants'
import { tracking } from '../utils'

describe(`tracking.`, () => {
  beforeEach(() => {
    window.history.pushState({}, 'Home', '/')  // reset URL back to original state
    performStorage(DELETE, REF.STORAGE.TYPE_KEY)
    performStorage(DELETE, REF.STORAGE.CODE_KEY)
    delete tracking.refType
    delete tracking.refCode
  })

  const refCode = 'chris'
  const uCode = '111'

  it(`${tracking.getRefFromParams.name}() returns 'undefined' when no params given`, () => {
    expect(tracking.getRefFromParams()).toEqual({key: undefined, val: undefined})
  })
  it(`${tracking.getRefFromParams.name}() returns 'referral' values from query string when given`, () => {
    const queryString = `?${REF.REFERRAL.PARAM_KEY}=${refCode}`
    window.history.pushState({}, 'Test with query string', queryString)
    expect(tracking.getRefFromParams()).toEqual({key: REF.REFERRAL.INPUT_VALUE, val: refCode})
  })
  it(`${tracking.getRefFromParams.name}() returns 'invite' values from query string even when 'referral' given`, () => {
    const queryString = `?${REF.REFERRAL.PARAM_KEY}=${refCode}&${REF.INVITE.PARAM_KEY}=vip`
    window.history.pushState({}, 'Test with query string', queryString)
    expect(tracking.getRefFromParams()).toEqual({key: REF.INVITE.INPUT_VALUE, val: 'vip'})
  })

  it(`${tracking.getReferrer.name}() returns 'null' when no referral exists`, () => {
    expect(tracking.getReferrer()).toEqual({key: null, val: null})
  })
  it(`${tracking.setReferrer.name}() does not activate when no referral query string given`, () => {
    expect(tracking.getReferrer()).toEqual({key: null, val: null})
  })
  it(`${tracking.setReferrer.name}() persistently stores referral values when query string given`, () => {
    const queryString = `?${REF.REFERRAL.PARAM_KEY}=${refCode}&u=${uCode}`
    window.history.pushState({}, 'Test with query string', queryString)
    expect(tracking.getReferrer()).toEqual({key: REF.REFERRAL.INPUT_VALUE, val: refCode})
    window.history.pushState({}, 'Home', '/')  // reset URL back to original state
    expect(tracking.getReferrer()).toEqual({key: REF.REFERRAL.INPUT_VALUE, val: refCode})  // still has data
  })
})
