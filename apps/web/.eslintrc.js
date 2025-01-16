module.exports = {
  extends: ['@repo/eslint-config/next'],
  rules: {
    'no-console': 'warn',
    'import/order': 'off',
    '@typescript-eslint/no-floating-promises': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    'import/no-unresolved': 'off',
  },
}
