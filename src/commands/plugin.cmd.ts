import { join } from 'path';
import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { scanDependencyManager } from '@compass-aiden/helpers/cjs';
import {
  addCommitlintPlugin,
  addEslintPlugin,
  addGithooksPlugin,
  addGithubActionsPlugin,
  addJestPlugin,
  addPrettierPlugin,
  addPrettyQuickPlugin,
  addStylelintPlugin,
  removeCommitlintPlugin,
  removeEslintPlugin,
  removeGithooksPlugin,
  removeJestPlugin,
  removePrettierPlugin,
  removePrettyQuickPlugin,
  removeStylelintPlugin,
} from '@/utils';
import { PkgManager } from '@/interfaces';

/**
 * @description Compass 项目插件管理
 * @example
 * ```bash
 * compass plugin [options] # 添加或删除插件
 * compass plugin --help # 获取更多帮助信息
 * ```
 */
export default (program: Command) => {
  program
    .command('plugin')
    .description('项目插件管理')
    .option(
      '-T, --type [type]',
      `操作类型
\t\t\t- add\t\t为项目添加插件
\t\t\t- remove\t为项目移除插件`,
    )
    .option(
      '-N, --name [name]',
      `插件名称
\t\t\t- eslint\tEslint 基于Airbnb规范对代码进行检查
\t\t\t- prettier\tPrettier 代码格式化
\t\t\t- jest\t\tJest 单元测试
\t\t\t- stylelint\tStylelint 样式检查
\t\t\t- githubactions\tGithub actions 基于github actions添加CICD
\t\t\t- githooks\t使用SimpleGitHooks基于githooks对项目添加自动化任务
\t\t\t- commitlint\tCommitlint 提交信息格式校验,该插件依赖于githooks插件
\t\t\t- prettyquick\tPrettyQuick 在Commit前仅对变更文件进行快速格式化,该插件依赖于githooks及prettier插件`,
    )
    .option('-P, --path [path]', '项目路径,默认为当前路径')
    .option('-M, --pkg-manager [pkgManager]', '指定npm管理器. npm,yarn,pnpm')
    .action(async ({ name: inputName, type: inputType, path: inputPath, pkgManager: inputPkgManager }) => {
      // 确认操作的类型
      let type: 'add' | 'remove' = inputType;
      let basePath = inputPath || undefined;
      if (basePath) {
        basePath = basePath.startsWith('/') ? basePath : join(process.cwd(), basePath);
      }
      if (!['add', 'remove'].includes(type)) {
        const { type: selectedType } = await inquirer.prompt([
          {
            type: 'list',
            name: 'type',
            message: `请选择您的操作类型`,
            choices: [
              {
                name: '为项目添加插件',
                value: 'add',
              },
              {
                name: '为项目移除插件',
                value: 'remove',
              },
            ],
          },
        ]);
        type = selectedType;
      }

      // 确认要操作的插件
      const { name } = inputName
        ? { name: inputName }
        : await inquirer.prompt([
            {
              type: 'list',
              name: 'name',
              message: `请选择您要${type === 'add' ? '添加' : '删除'}的插件`,
              choices: [
                {
                  name: 'Eslint 基于Airbnb规范对代码进行检查',
                  value: 'eslint',
                },
                {
                  name: 'Prettier 代码格式化',
                  value: 'prettier',
                },
                {
                  name: 'Jest 单元测试',
                  value: 'jest',
                },
                {
                  name: 'Stylelint 样式检查',
                  value: 'stylelint',
                },
                type === 'add' && {
                  name: 'Github actions 基于github actions添加CICD',
                  value: 'githubactions',
                },
                {
                  name: '使用SimpleGitHooks基于git hooks对项目添加自动化任务',
                  value: 'githooks',
                },
                {
                  name: 'Commitlint 提交信息格式校验,该插件依赖于git hooks插件',
                  value: 'commitlint',
                },
                {
                  name: 'PrettyQuick 在Commit前仅对变更文件进行快速格式化,该插件依赖于git hooks及prettier插件',
                  value: 'prettyquick',
                },
              ].filter((item) => !!item),
            },
          ]);

      // 处理选择的插件
      if (name === 'githooks') {
        const action = {
          add: addGithooksPlugin,
          remove: removeGithooksPlugin,
        };
        const pkgManager: PkgManager = inputPkgManager || scanDependencyManager({ cwd: basePath });
        await action[type]({ pkgManager, cwd: basePath });
        return;
      }

      if (name === 'prettier') {
        const action = {
          add: addPrettierPlugin,
          remove: removePrettierPlugin,
        };
        const pkgManager: PkgManager = inputPkgManager || scanDependencyManager({ cwd: basePath });
        await action[type]({ pkgManager, cwd: basePath });
        return;
      }

      if (name === 'prettyquick') {
        const action = {
          add: addPrettyQuickPlugin,
          remove: removePrettyQuickPlugin,
        };
        const pkgManager: PkgManager = inputPkgManager || scanDependencyManager({ cwd: basePath });
        await action[type]({ pkgManager, cwd: basePath });
        return;
      }

      if (name === 'commitlint') {
        const action = {
          add: addCommitlintPlugin,
          remove: removeCommitlintPlugin,
        };
        const pkgManager: PkgManager = inputPkgManager || scanDependencyManager({ cwd: basePath });
        await action[type]({ pkgManager, cwd: basePath });
        return;
      }

      if (name === 'eslint') {
        const action = {
          add: addEslintPlugin,
          remove: removeEslintPlugin,
        };
        const pkgManager: PkgManager = inputPkgManager || scanDependencyManager({ cwd: basePath });
        await action[type]({ pkgManager, cwd: basePath });
        return;
      }

      if (name === 'jest') {
        const action = {
          add: addJestPlugin,
          remove: removeJestPlugin,
        };
        const pkgManager: PkgManager = inputPkgManager || scanDependencyManager({ cwd: basePath });
        await action[type]({ pkgManager, cwd: basePath });
        return;
      }

      if (name === 'githubactions') {
        const action = {
          add: addGithubActionsPlugin,
        };
        const pkgManager: PkgManager = inputPkgManager || scanDependencyManager({ cwd: basePath });
        await action.add({ pkgManager, cwd: basePath });
        return;
      }

      if (name === 'stylelint') {
        const action = {
          add: addStylelintPlugin,
          remove: removeStylelintPlugin,
        };
        const pkgManager: PkgManager = inputPkgManager || scanDependencyManager({ cwd: basePath });
        await action[type]({ pkgManager, cwd: basePath });
        return;
      }

      // eslint-disable-next-line no-console
      console.log(chalk.red(`❌ ${name}不是可用的插件名称, 请通过 'compass plugin --help' 获取更多帮助信息`));
    });
};
