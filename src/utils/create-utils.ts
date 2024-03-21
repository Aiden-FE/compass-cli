import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { createFolder, isFileOrFolderExists, copyFolderSync } from '@compass-aiden/helpers/cjs';
import batchCompileTemplates from './batch-compile-templates';

// eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
const __dirname = dirname(__filename);
const utilsTempBasePath = join(__dirname, '../templates/utils');

export default async function createUtils() {
  /* eslint-disable prefer-const */
  let {
    projectPath,
    projectDescription,
    enabledEslint,
    enabledPrettier,
    enabledJest,
    enabledTypedoc,
    enabledPrettyQuick,
    enabledCommitlint,
    enabledGithubActions,
    /* eslint-enable prefer-const */
  } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectPath',
      message: '请指定项目路径',
      default: './new-project',
    },
    {
      type: 'input',
      name: 'projectDescription',
      message: '[可选]请输入项目描述',
      default: '',
    },
    {
      type: 'confirm',
      name: 'enabledEslint',
      message: '是否启用Eslint代码检查',
      defaut: true,
    },
    {
      type: 'confirm',
      name: 'enabledPrettier',
      message: '是否启用Prettier代码检查',
      defaut: true,
    },
    {
      type: 'confirm',
      name: 'enabledJest',
      message: '是否启用Jest单元测试',
      defaut: true,
    },
    {
      type: 'confirm',
      name: 'enabledTypedoc',
      message: '是否启用Typedoc构建文档',
      defaut: true,
    },
    {
      type: 'confirm',
      name: 'enabledPrettyQuick',
      message: '是否启用pretty-quick在代码提交前自动格式化变更文件',
      defaut: true,
    },
    {
      type: 'confirm',
      name: 'enabledCommitlint',
      message: '是否启用Commitlint在代码提交时校验提交信息',
      defaut: true,
    },
    {
      type: 'confirm',
      name: 'enabledGithubActions',
      message: '是否启用Github actions CICD执行自动化任务',
      defaut: true,
    },
  ]);
  const loading = ora();
  loading.start(chalk.cyan('开始创建项目文件\n'));
  if (isFileOrFolderExists(join(process.cwd(), projectPath))) {
    loading.fail(chalk.red('目标路径已经存在'));
    return;
  }
  const enabledGithooks = enabledPrettyQuick || enabledCommitlint;
  if (enabledPrettyQuick) {
    enabledPrettier = true;
  }
  const pathArr = projectPath.split('/');
  const projectName = pathArr.pop();
  await createFolder(projectPath, {});
  await batchCompileTemplates(
    [
      [join(utilsTempBasePath, 'package.json.handlebars'), join(projectPath, 'package.json')],
      [join(utilsTempBasePath, 'tsconfig.json.handlebars'), join(projectPath, 'tsconfig.json')],
      [join(utilsTempBasePath, 'tsconfig.web.json.handlebars'), join(projectPath, 'tsconfig.web.json')],
      [join(utilsTempBasePath, 'tsconfig.node.json.handlebars'), join(projectPath, 'tsconfig.node.json')],
      [join(utilsTempBasePath, 'rollup.config.js'), join(projectPath, 'rollup.config.js')],
      [join(utilsTempBasePath, 'README.md.handlebars'), join(projectPath, 'README.md')],
      [join(utilsTempBasePath, '.gitignore'), join(projectPath, '.gitignore')],
      enabledJest && [join(utilsTempBasePath, 'tsconfig.test.json'), join(projectPath, 'tsconfig.test.json')],
      enabledJest && [join(utilsTempBasePath, 'jest.config.cjs'), join(projectPath, 'jest.config.cjs')],
      enabledCommitlint && [join(utilsTempBasePath, 'commitlint.config.js'), join(projectPath, 'commitlint.config.js')],
      enabledPrettier && [join(utilsTempBasePath, '.prettierrc.json'), join(projectPath, '.prettierrc.json')],
      enabledPrettier && [join(utilsTempBasePath, '.prettierignore'), join(projectPath, '.prettierignore')],
      enabledEslint && [join(utilsTempBasePath, '.eslintrc.cjs.handlebars'), join(projectPath, '.eslintrc.cjs')],
      enabledGithubActions && [
        join(utilsTempBasePath, '.github/workflows/lint-and-test.yml.handlebars'),
        join(projectPath, '.github/workflows/lint-and-test.yml'),
      ],
      enabledGithubActions && [
        join(utilsTempBasePath, '.github/workflows/publish-and-deploy.yml.handlebars'),
        join(projectPath, '.github/workflows/publish-and-deploy.yml'),
      ],
    ],
    {
      projectDescription,
      enabledEslint,
      enabledPrettier,
      enabledJest,
      enabledTypedoc,
      enabledPrettyQuick,
      enabledCommitlint,
      enabledGithooks,
      projectName,
      enabledGithubActions,
    },
  );
  copyFolderSync(join(utilsTempBasePath, 'src'), join(projectPath, 'src'));
  loading.succeed(chalk.green('创建完成'));
}
