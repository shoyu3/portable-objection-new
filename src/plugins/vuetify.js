import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    sets: {}
  },
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#00B0FF',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
        }
      },
      dark: {
        colors: {
          primary: '#00B0FF',
          secondary: '#f5f5f5',
        }
      }
    },
  },
})