import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-plugin-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import boundaries from 'eslint-plugin-boundaries'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'prettier': prettier,
      'simple-import-sort': simpleImportSort,
      'boundaries': boundaries,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'react-hooks/exhaustive-deps': 'off',
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            // common types
            ['^@/types'],
            // Packages. `react` related packages come first.
            ['^react', '^@?\\w'],
            // Internal packages.
            // api
            ['^@?\\/api'],
            // api
            ['^@?\\/utils'],
            // misc
            ['^@?\\/[^(ui|api|utils)]'],
            // UI
            ['^@?\\/ui\\/[^ce]', '^@?\\/ui\\/e', '^@?\\/ui\\/c'],
            // Side effect imports.
            ['^\\u0000'],
            // Parent imports. Put `..` last.
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // Other relative imports. Put same-folder imports and `.` last.
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            // Style imports.
            ['^.+\\.s?css$'],
          ],
        },
      ],
      'boundaries/element-types': [
        'error',
        {
          'default': 'allow',
          'rules': [
            {
              'from': 'ui',
              'disallow': [
                'pages',
                'modules',
                'components'
              ],
              'message': 'import in ui scope from pages, modules, components is forbidden'
            },
            {
              'from': 'components',
              'disallow': [
                'pages',
                'modules',
              ],
              'message': 'import in components scope from pages, modules is forbidden'
            },
            {
              'from': 'modules',
              'disallow': [
                'pages',
              ],
              'message': 'import in modules scope from pages is forbidden'
            },
          ]
        }
      ],
      'simple-import-sort/exports': 'warn',
      'prettier/prettier': [
        'warn', {
          endOfLine: 'auto'
        }
      ]
    },
    settings: {
      'boundaries/elements': [
        {
          'type': 'app',
          'pattern': 'src/app/**'
        },
        {
          'type': 'ui',
          'pattern': 'src/ui/**'
        },
        {
          'type': 'components',
          'pattern': 'src/components/**'
        },
        {
          'type': 'modules',
          'pattern': 'src/modules/**'
        },
        {
          'type': 'pages',
          'pattern': 'src/pages/**'
        },
      ],
      'import/resolver': {
        'typescript': {
          'project': 'tsconfig.app.json'
        }
      }
    }
  },
)