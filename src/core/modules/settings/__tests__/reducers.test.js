import initState from '../data'
import reducer from '../reducers'

it('should return the initial state', () => expect(reducer(initState, {type: ''})).toEqual(initState))
