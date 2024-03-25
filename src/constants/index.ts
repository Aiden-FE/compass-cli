export * from './templates';

/** ESlint 插件 */
export const ESLINT_PLUGINS = [
  {
    name: 'Next TS',
    value: '@compass-aiden/eslint-config/next',
    deps: [
      'eslint-config-next',
      'eslint-config-airbnb',
      'eslint-plugin-jsx-a11y',
      'eslint-plugin-react',
      'eslint-config-airbnb-typescript',
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
      'eslint-plugin-react-refresh',
    ],
    lint: 'next lint',
  },
  {
    name: 'Vue TS',
    value: '@compass-aiden/eslint-config/vue',
    deps: ['eslint-plugin-vue', '@typescript-eslint/parser', '@vue/eslint-config-airbnb-with-typescript'],
    lint: 'eslint . --fix --ext .js,.jsx,.ts,.tsx,.vue',
  },
  {
    name: 'React TS',
    value: '@compass-aiden/eslint-config/react',
    deps: [
      'eslint-config-airbnb',
      'eslint-plugin-jsx-a11y',
      'eslint-plugin-react',
      'eslint-plugin-react-hooks',
      'eslint-config-airbnb-typescript',
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
      'eslint-plugin-react-refresh',
    ],
    lint: 'eslint . --fix --ext .js,.jsx,.ts,.tsx',
  },
  {
    name: 'Typescript',
    value: '@compass-aiden/eslint-config/ts',
    deps: [
      'eslint-config-airbnb-base',
      'eslint-config-airbnb-typescript',
      '@typescript-eslint/parser',
      '@typescript-eslint/eslint-plugin',
    ],
    lint: 'eslint . --fix --ext .js,.jsx,.ts,.tsx',
  },
  {
    name: 'Nest TS',
    value: '@compass-aiden/eslint-config/nest',
    deps: [
      'eslint-config-airbnb-base',
      'eslint-config-airbnb-typescript',
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
    ],
    lint: 'eslint . --fix --ext .js,.jsx,.ts,.tsx',
  },
  {
    name: 'Vue2 TS',
    value: '@compass-aiden/eslint-config/vue2',
    deps: ['eslint-plugin-vue', '@vue/eslint-config-airbnb-with-typescript'],
    lint: 'eslint . --fix --ext .js,.jsx,.ts,.tsx,.vue',
  },
  {
    name: 'Javascript',
    value: '@compass-aiden/eslint-config/js',
    deps: ['eslint-config-airbnb-base'],
    lint: 'eslint . --fix --ext .js,.jsx,.ts,.tsx',
  },
];
