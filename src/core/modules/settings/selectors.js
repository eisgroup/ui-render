import { Active, findObjByKeys, LANGUAGE } from 'ui-utils-pack'
import selector from 'ui-utils-pack/selectors'
import { NAME } from './constants'

@selector(NAME)
export default class select {
  static country = () => [
    (state) => state[NAME].data.country,
    (val) => val
  ]

  static currency = () => [
    (state) => state[NAME].data.currency,
    (val) => val
  ]

  static language = () => [
    (state) => state[NAME].data.language,
    (val) => { // @note: do not add default language here to trigger setLanguageFlow saga
      Active.LANG = findObjByKeys(LANGUAGE, {_: val}) || LANGUAGE.ENGLISH
      return val
    }
  ]

  static ui = () => [
    (state) => state[NAME].ui,
    (val) => val
  ]
}
