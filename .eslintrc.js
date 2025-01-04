module.exports = {
  // ...other config
  rules: {
    // If you need to allow console.log in development
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',

    // If you need to disable any other rules
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
  },
}
