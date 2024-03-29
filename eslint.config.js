// eslint.config.js
import antfu from '@antfu/eslint-config'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat()

export default antfu(
  {
    ignores: [],
  },

  // Legacy config
  ...compat.config({
    extends: [
      'plugin:tailwindcss/recommended',
      // Other extends...
    ],
  }),

  // Other flat configs...
)
