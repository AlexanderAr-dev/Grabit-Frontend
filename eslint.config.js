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
            ['^@/types'],
            ['^react', '^@?\\w'],
            ['^@?\\/api'],
            ['^@?\\/utils'],
            ['^@?\\/[^(ui|api|utils)]'],
            ['^@?\\/ui\\/[^ce]', '^@?\\/ui\\/e', '^@?\\/ui\\/c'],
            ['^\\u0000'],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            ['^.+\\.s?css$'],
          ],
        },
      ],
      'boundaries/element-types': [
        'error',
        {
          'default': 'disallow',
          'rules': [
            { 'from': 'shared',   'allow': [] },
            { 'from': 'entities', 'allow': ['shared'] },
            { 'from': 'features', 'allow': ['shared', 'entities'] },
            { 'from': 'widgets',  'allow': ['shared', 'entities', 'features'] },
            { 'from': 'pages',    'allow': ['shared', 'entities', 'features', 'widgets'] },
            { 'from': 'app',      'allow': ['shared', 'entities', 'features', 'widgets', 'pages'] },
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
        { 'type': 'shared',   'pattern': 'src/shared/**' },
        { 'type': 'entities', 'pattern': 'src/entities/**' },
        { 'type': 'features', 'pattern': 'src/features/**' },
        { 'type': 'widgets',  'pattern': 'src/widgets/**' },
        { 'type': 'pages',    'pattern': 'src/pages/**' },
        { 'type': 'app',      'pattern': 'src/app/**' },
      ],
      'import/resolver': {
        'typescript': {
          'project': 'tsconfig.app.json'
        }
      }
    }
  },
)
