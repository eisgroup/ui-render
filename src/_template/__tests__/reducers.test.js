import initState from '../data'
import reducer from '../reducers'

/**
 * ACTION HANDLERS TESTS =======================================================
 * =============================================================================
 */

test('returns initial state', () => expect(reducer(initState, { type: '' })).toEqual(initState))
