import i18next from 'i18next'
import { z } from 'zod'
import { zodI18nMap } from 'zod-i18n-map'
import translation from '../i18n/ar/zod.json'

i18next.init({
  lng: 'ar',
  fallbackLng: 'en',
  resources: {
    ar: { zod: translation },
  },
})
z.setErrorMap(zodI18nMap)

export const zod = z
