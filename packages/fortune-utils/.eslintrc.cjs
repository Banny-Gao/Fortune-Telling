/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['@repo/eslint-config/library.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'src'],
      },
    },
  },
  rules: {
    'tsdoc/syntax': 'off',
    '@typescript-eslint/no-explicit-any': ['warn'],
    '@typescript-eslint/no-unsafe-assignment': ['warn'],
    '@typescript-eslint/no-unsafe-member-access': ['warn'],
    '@typescript-eslint/no-unnecessary-type-assertion': ['off'],
    '@typescript-eslint/non-nullable-type-assertion-style': ['off'],
    'no-param-reassign': ['off'],
    'import/no-cycle': ['warn'],
    'import/no-unresolved': 'off',
  },
}
