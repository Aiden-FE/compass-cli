import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { readFileSync } from 'fs';
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import handlebars from 'handlebars';
import { createFile, createFolder, isFileOrFolderExists } from '@compass-aiden/helpers/cjs';

// eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
const __dirname = dirname(__filename);
const utilsTempBasePath = join(__dirname, '../templates/utils');

export default async function createUtils() {
  const {
    projectPath,
    projectDescription,
    enabledEslint,
    enabledPrettier,
    enabledJest,
    enabledTypedoc,
    enabledPrettyQuick,
    enabledCommitlint,
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
  ]);
  const loading = ora();
  loading.start(chalk.cyan('开始创建项目文件\n'));
  if (isFileOrFolderExists(join(process.cwd(), projectPath))) {
    loading.fail(chalk.red('目标路径已经存在'));
    return;
  }
  const enabledGithooks = enabledPrettyQuick || enabledCommitlint;
  const pathArr = projectPath.split('/');
  const projectName = pathArr.pop();
  await createFolder(projectPath, {});
  // 输出package.json文件
  const packageTemplate = handlebars.compile(readFileSync(join(utilsTempBasePath, 'package.json.handlebars'), 'utf-8'));
  createFile(
    join(projectPath, 'package.json'),
    packageTemplate({
      projectDescription,
      enabledEslint,
      enabledPrettier,
      enabledJest,
      enabledTypedoc,
      enabledPrettyQuick,
      enabledCommitlint,
      enabledGithooks,
      projectName,
    }),
  );
  loading.succeed(chalk.green('创建完成'));
}
