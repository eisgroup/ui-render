import { GET } from '../../constants'
import { apiAction } from '../actions'
import { API_CALL } from '../constants'

describe(`${apiAction.name}()`, () => {
  it('updates endpoint URL placeholders with given variables in meta.url', () => {
    const meta = {url: {'{id}': 7, '{limit}': 2}}
    expect(apiAction('http://api.com/{id}?limit={limit}', GET, null, meta)[API_CALL].payload.url)
      .toEqual('http://api.com/7?limit=2')
  })

  it('throws error if url interpolation is missing variables', () => {
    expect(() => apiAction('http://api.com/{id}', GET, null, {}, true)).toThrow(/{id}/)
  })
})
