module.exports = {
  parserOptions: {
    project: ['./tsconfig.json'],
  },
  ignorePatterns: ['.eslintrc.cjs', 'dist', 'types', 'node_modules'],
  extends: [
    // typescript使用此配置
    '@compass-aiden/eslint-config/ts',
    'plugin:prettier/recommended',
  ],
};
