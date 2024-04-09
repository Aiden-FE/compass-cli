import chalk from 'chalk';
import { execSync } from 'child_process';
import { checkbox } from '@inquirer/prompts';
import { createFileSync } from '@compass-aiden/helpers/cjs';
import { join } from 'path';
import { PkgManager } from '@/interfaces';
import { STYLELINT_PLUGINS } from '@/constants';
import Logger from '../logger';
import { deleteFilesSync } from '../delete-files-sync';
import getLibraryVersionFromNpmRegisty from '../get-library-version-from-npm-registy';

interface StylelintPluginProps {
  pkgManager?: PkgManager;
  cwd?: string;
}

export async function addStylelintPlugin(options?: StylelintPluginProps) {
  const { pkgManager, cwd } = {
    pkgManager: 'npm' as PkgManager,
    ...options,
  };
  const loading = Logger.createLoading();
  const execOption = { stdio: 'inherit' as const, cwd };
  const lintPlugins = await checkbox({
    message: '请按需选择额外的解析器',
    choices: STYLELINT_PLUGINS,
  });
  loading.start(chalk.cyan('开始安装 Stylelint 插件'));
  let deps = ['stylelint', 'stylelint-order', 'stylelint-config-rational-order'];
  const prettierVersion = getLibraryVersionFromNpmRegisty('prettier', { cwd });
  if (prettierVersion) {
    deps.push('stylelint-config-prettier');
  }
  if (lintPlugins.includes('scss')) {
    if (prettierVersion) {
      deps.push('stylelint-config-prettier-scss');
    }
    deps.push('stylelint-config-standard-scss');
  }
  if (lintPlugins.includes('less')) {
    deps.push('stylelint-config-standard', 'stylelint-config-recommended-less');
  }
  if (lintPlugins.includes('stylus')) {
    deps.push('stylelint-stylus');
  }
  if (lintPlugins.includes('vue')) {
    deps = deps.filter((item: string) => item !== 'stylelint-config-standard');
    deps.push('postcss', 'postcss-html', 'stylelint-config-html', 'stylelint-config-standard-vue');
    if (lintPlugins.includes('scss')) {
      deps.push('postcss-scss', 'stylelint-scss');
    }
    if (lintPlugins.includes('less')) {
      deps.push('postcss-less', 'stylelint-less', 'stylelint-config-recommended-less');
    }
    if (lintPlugins.includes('stylus')) {
      deps.push('postcss-styl');
    }
  }
  const data = {
    extends: [],
    overrides: [],
    ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.tsx', '**/*.ts', '**/*.json', '**/*.md', '**/*.yaml'],
    plugins: [],
    rules: {},
  } as any;
  if (lintPlugins.includes('scss')) {
    data.extends.push('stylelint-config-standard-scss');
  }
  if (lintPlugins.includes('less')) {
    data.extends.push('stylelint-config-standard', 'stylelint-config-recommended-less');
  }
  if (lintPlugins.includes('stylus')) {
    data.extends.push('stylelint-stylus/standard');
  }
  if (prettierVersion) {
    data.extends.push('stylelint-config-prettier');
    if (lintPlugins.includes('scss')) {
      data.extends.push('stylelint-config-prettier-scss');
    }
  }
  if (lintPlugins.includes('vue')) {
    data.extends = data.extends.filter((item: string) => item !== 'stylelint-config-standard');
    data.extends.push('stylelint-config-html/vue', 'stylelint-config-standard-vue');
    if (lintPlugins.includes('scss')) {
      data.overrides.push({
        files: ['**/*.(scss|css|vue|html)'],
        customSyntax: 'postcss-scss',
      });
    }
    if (lintPlugins.includes('less')) {
      data.overrides.push({
        files: ['**/*.(less|css|vue|html)'],
        customSyntax: 'postcss-less',
      });
    }
    if (lintPlugins.includes('stylus')) {
      data.overrides.push({
        files: ['**/*.(styl|css|vue|html)'],
        customSyntax: 'postcss-styl',
      });
    }
    data.overrides.push({
      files: ['**/*.(html|vue)'],
      customSyntax: 'postcss-html',
    });
  }
  if (!lintPlugins.length) {
    deps.push('stylelint-config-standard');
    data.extends.push('stylelint-config-standard');
  }
  data.extends.push('stylelint-config-rational-order');

  execSync(`${pkgManager} add -D ${deps.join(' ')}`, execOption);
  execSync(
    'npm pkg set scripts.lint:style="npx stylelint \\"src/**/*.{vue,scss,css,sass,less,styl}\\" --fix"',
    execOption,
  );
  createFileSync('.stylelintrc.json', JSON.stringify(data, null, 2), { cwd });
  Logger.success(`Installed ${deps.join(' ')} at ${cwd || process.cwd()}`);
  Logger.success(`Set 'scripts.lint:style' field at ${join(cwd || process.cwd(), 'package.json')}`);
  Logger.success(`Created file at ${join(cwd || process.cwd(), '.stylelintrc.json')}`);
  loading.succeed(chalk.green('Stylelint 插件安装成功, 可通过以下命令主动检查样式:\n\n\tnpm run lint:style'));
}

export async function removeStylelintPlugin(options?: StylelintPluginProps) {
  const { pkgManager, cwd } = {
    pkgManager: 'npm' as PkgManager,
    ...options,
  };
  const execOption = { stdio: 'inherit' as const, cwd };
  // 需要二次确认再删除的依赖项
  let confirmDeps = ['postcss', 'postcss-html', 'postcss-scss', 'postcss-less', 'postcss-styl'];
  // 可以直接删除的依赖项
  let deps = [
    'stylelint',
    'stylelint-order',
    'stylelint-config-rational-order',
    'stylelint-config-prettier',
    'stylelint-config-standard-scss',
    'stylelint-config-prettier-scss',
    'stylelint-config-standard',
    'stylelint-config-recommended-less',
    'stylelint-stylus',
    'stylelint-config-html',
    'stylelint-config-standard-vue',
    'stylelint-scss',
    'stylelint-less',
  ];
  const allDepsStr = execSync(`npm pkg get devDependencies`, { cwd }).toString().trim();
  const allDeps = Object.keys(JSON.parse(allDepsStr));
  confirmDeps = confirmDeps.filter((item) => allDeps.includes(item));
  deps = deps.filter((item) => allDeps.includes(item));
  let extraDeps = [] as string[];
  if (confirmDeps.length) {
    extraDeps = await checkbox({
      message: '请确认是否要移除以下依赖?',
      choices: confirmDeps.map((key) => ({ name: key, value: key })),
    });
  }
  const removeDeps = deps.concat(extraDeps);
  const loading = Logger.createLoading();
  loading.start(chalk.cyan('开始卸载 Stylelint 插件'));
  if (removeDeps.length) {
    execSync(`${pkgManager} remove ${removeDeps.join(' ')}`, execOption);
  }
  execSync('npm pkg delete scripts.lint:style', execOption);
  deleteFilesSync(join(cwd || process.cwd(), '.stylelintrc.json'));

  if (removeDeps.length) {
    Logger.success(`Uninstalled ${removeDeps.join(' ')} at ${cwd || process.cwd()}`);
  }
  Logger.success(`Deleted 'scripts.lint:style' field at ${join(cwd || process.cwd(), 'package.json')}`);
  Logger.success(`Deleted file at ${join(cwd || process.cwd(), '.stylelintrc.json')}`);
  loading.succeed(chalk.green('Stylelint 插件卸载成功'));
}
