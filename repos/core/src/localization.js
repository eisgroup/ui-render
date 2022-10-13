import {IoC , Localization} from '@eisgroup/common'
import { enMT } from './i18n/common-i18n.en_MT'
import { enUS } from './i18n/common_i18n.en_US'
import { frFR } from './i18n/common_i18n.fr_FR'

const mtLocale = { country : 'MT' , language : 'en' }
const enLocale = { country : 'US' , language : 'en' }
const frLocale = { country : 'FR' , language : 'fr' }

export const ioc = IoC.get(Localization.TYPES.LocalizerProvider)
  .initLocalizer({
    supportedLocales: [enLocale , mtLocale, frLocale],
    currentLocale: enLocale
  })
  .then (localizerObject => {
    localizerObject.addResourceBundles([enMT, enUS, frFR])
  })
