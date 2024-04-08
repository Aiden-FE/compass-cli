import chalk from 'chalk';
import { join, dirname } from 'path';
import { confirm, input, select } from '@inquirer/prompts';
import YAML from 'yaml';
import { createFileSync, createFolder } from '@compass-aiden/helpers/cjs';
import { PkgManager } from '@/interfaces';
import Logger from '../logger';

interface GithubActionsPluginProps {
  pkgManager?: PkgManager;
  cwd?: string;
}

export default async function addGithubActionsPlugin(options?: GithubActionsPluginProps) {
  const { pkgManager, cwd } = {
    pkgManager: 'npm' as PkgManager,
    ...options,
  };
  const yamlData = {
    jobs: {
      pipeline: {
        name: '',
        'runs-on': 'ubuntu-latest',
        steps: [
          { uses: 'actions/checkout@v4' },
          {
            name: 'Setup git',
            run: 'git config --local user.email github_bot@users.noreply.github.com\ngit config --local user.name GithubBot',
          },
        ],
      },
    },
  } as any;
  // 文件名
  const fileName = await input({
    message: '请输入工作流文件名称,应由小写字母或中划线组成,长度不超过24',
    validate(value) {
      if (!/^[a-z-]{1,24}$/.test(value)) {
        return '工作流文件名称应由小写字母或中划线组成,长度不超过24';
      }
      return true;
    },
  });
  // 工作流名称
  yamlData.name = await input({
    message: '请输入工作流标题名称',
    default: fileName.split('-').join(' '),
    validate(value) {
      if (!value) {
        return '请输入工作流标题名称';
      }
      return true;
    },
  });
  yamlData.jobs.pipeline.name = yamlData.name;
  // 工作流触发的类型
  const workflowOnType = await select({
    message: '请选择工作流触发的类型',
    default: 'pull_request',
    choices: [
      { name: 'Push 推送分支或标签时触发', value: 'push' },
      { name: 'Pull request 创建拉取请求时触发', value: 'pull_request' },
    ],
  });
  yamlData.on = {};
  yamlData.on[workflowOnType] = {};
  // 工作流触发的匹配规则
  const workflowOnMatchType =
    workflowOnType === 'pull_request'
      ? 'branches'
      : await select({
          message: '请选择 Push 匹配的是分支还是标签',
          default: 'branches',
          choices: [
            { name: 'Push 分支时触发', value: 'branches' },
            { name: 'Push 标签时触发', value: 'tags' },
          ],
        });
  yamlData.on[workflowOnType][workflowOnMatchType] = [];
  // 工作流触发的匹配规则
  const workflowOnMatchs = await input({
    message: '[可选] 请输入工作流的匹配规则. 例如: master,rc-*,sprint/** 等等,多个规则以","分隔,为空则全匹配',
  });
  yamlData.on[workflowOnType][workflowOnMatchType] = workflowOnMatchs ? workflowOnMatchs.split(',') : ['**'];
  // 工作流忽略触发的匹配规则
  const workflowOnIgnoreMatchs = await input({
    message: '[可选] 请输入工作流忽略的匹配规则. 例如: master,rc-*,sprint/** 等等,多个规则以","分隔,为空则不忽略',
  });
  if (workflowOnIgnoreMatchs) {
    yamlData.on[workflowOnType][`${workflowOnMatchType}-ignore`] = workflowOnIgnoreMatchs.split(',');
  }
  // 设置node版本
  const setupNodeVersion = await input({
    message: '[可选] 启用并设置Node版本,无需node环境则忽略,如需则指定为类似 18/18.4/latest 的有效版本',
  });
  if (setupNodeVersion) {
    yamlData.jobs.pipeline.steps.push({
      name: 'Setup node',
      uses: 'actions/setup-node@v3',
      with: {
        'node-version': setupNodeVersion,
      },
    });
  }
  let pkgManagerType = 'none';
  if (setupNodeVersion) {
    pkgManagerType = await select({
      message: '是否使用包管理器安装依赖',
      default: pkgManager || 'none',
      choices: [
        { name: '无需使用包管理器', value: 'none' },
        { name: 'pnpm', value: 'pnpm' },
        { name: 'yarn', value: 'yarn' },
        { name: 'npm', value: 'npm' },
      ],
    });
  }
  if (pkgManagerType !== 'none') {
    if (pkgManagerType === 'pnpm') {
      yamlData.jobs.pipeline.steps.push(
        {
          name: 'Setup pnpm',
          uses: 'pnpm/action-setup@v2',
          with: { version: '8.15.6' },
        },
        {
          name: 'Setup pnpm cache',
          uses: 'actions/cache@v3',
          with: {
            path: 'node_modules',
            // eslint-disable-next-line no-template-curly-in-string
            key: "pnpm-cache-${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}",
          },
        },
        {
          name: 'Install deps',
          env: {
            HUSKY: 0,
            SKIP_INSTALL_SIMPLE_GIT_HOOKS: 1,
            SKIP_SIMPLE_GIT_HOOKS: 1,
          },
          run: 'pnpm install --frozen-lockfile',
        },
      );
    } else {
      yamlData.jobs.pipeline.steps.push({
        name: 'Install deps',
        uses: 'bahmutov/npm-install@v1',
      });
    }
  }
  const isPushTag = await confirm({
    message: '是否需要根据commit信息自动推送新的标签',
    default: false,
  });
  if (isPushTag) {
    yamlData.jobs.pipeline.steps.push({
      name: 'Bump version and push tag',
      id: 'tag_version',
      uses: 'mathieudutour/github-tag-action@v6.2',
      // eslint-disable-next-line no-template-curly-in-string
      with: { github_token: '${{ secrets.GITHUB_TOKEN }}' },
    });
    yamlData.permissions = {
      contents: 'write',
      'id-token': 'write',
    };
  }
  let isUpdateNpmVersion = false;
  if (setupNodeVersion && isPushTag) {
    isUpdateNpmVersion = await confirm({
      message: '是否需要将新标签号同步至package.json并创建新的commit提交',
      default: false,
    });
    if (isUpdateNpmVersion) {
      yamlData.jobs.pipeline.steps.push({
        name: 'Updated npm version and create commit',
        // eslint-disable-next-line no-template-curly-in-string, no-useless-escape, prettier/prettier
        run: `npm pkg set version=$\{{ steps.tag_version.outputs.new_version }}
git add -A
git commit -m "chore: published tag $\{{steps.tag_version.outputs.new_tag}}"`,
      });
    }
  }
  const runCustomCmd = await input({
    message: '[可选] 是否运行自定义命令,为空则不运行,多个命令请以 ; 换行',
  });
  if (runCustomCmd) {
    yamlData.jobs.pipeline.steps.push({
      name: 'Run custom commands',
      env: { NODE_ENV: 'production' },
      run: runCustomCmd.split(';').join('\n'),
    });
  }
  let isPublishRelease = false;
  if (isPushTag) {
    isPublishRelease = await confirm({
      message: '是否需要根据新标签自动发布Release',
      default: isPushTag,
    });
  }
  if (isPublishRelease) {
    yamlData.jobs.pipeline.steps.push({
      name: 'Create a GitHub release',
      uses: 'ncipollo/release-action@v1',
      with: {
        // eslint-disable-next-line no-template-curly-in-string
        tag: '${{ steps.tag_version.outputs.new_tag }}',
        // eslint-disable-next-line no-template-curly-in-string
        name: 'Release ${{ steps.tag_version.outputs.new_tag }}',
        // eslint-disable-next-line no-template-curly-in-string
        body: '${{ steps.tag_version.outputs.changelog }}',
      },
    });
  }
  let isPublishNpm = false;
  if (setupNodeVersion) {
    isPublishNpm = await confirm({
      message: '是否需要执行publish发布npm包, 启用则需要提供 secrets.NPM_AUTH_TOKEN 变量',
      default: false,
    });
  }
  if (isPublishNpm) {
    yamlData.jobs.pipeline.steps.push({
      name: 'Publish library to npm',
      uses: 'JS-DevTools/npm-publish@v3',
      // eslint-disable-next-line no-template-curly-in-string
      with: { token: '${{ secrets.NPM_AUTH_TOKEN }}' },
    });
  }
  if (isUpdateNpmVersion) {
    const isPushChange = await confirm({
      message: '是否需要推送变更到远程仓库',
      default: isUpdateNpmVersion,
    });
    if (isPushChange) {
      yamlData.jobs.pipeline.steps.push({
        name: 'Push changes',
        uses: 'ad-m/github-push-action@master',
        with: {
          // eslint-disable-next-line no-template-curly-in-string
          github_token: '${{ secrets.GITHUB_TOKEN }}',
          // eslint-disable-next-line no-template-curly-in-string
          branch: '${{ github.ref }}',
        },
      });
    }
  }
  const isPublishPage = await confirm({
    message: '是否需要发布Github page',
    default: false,
  });
  if (isPublishPage) {
    const docsPath = await input({
      message: '请输入文档目录',
      default: './docs',
    });
    yamlData.jobs.pipeline.steps.push({
      name: 'Deploy GitHub Pages site',
      uses: 'JamesIves/github-pages-deploy-action@v4',
      with: { folder: docsPath || './' },
    });
    if (!yamlData.permissions) {
      yamlData.permissions = {};
    }
    yamlData.permissions.pages = 'write';
    yamlData.permissions.contents = 'write';
  }
  const loading = Logger.createLoading();
  loading.start(chalk.cyan('开始安装 Github actions 插件'));
  let yamlStrData = YAML.stringify(yamlData);
  if (isUpdateNpmVersion) {
    yamlStrData = yamlStrData.replace(/chore: published tag\n\s+(.*?)/g, 'chore: published tag $1');
  }
  const yamlFilePath = join(cwd || process.cwd(), `.github/workflows/${fileName}.yml`);
  await createFolder(dirname(yamlFilePath));
  createFileSync(yamlFilePath, yamlStrData);
  Logger.success(`\nCreated file at ${yamlFilePath}`);
  loading.succeed(chalk.green('Github actions 工作流创建成功,如后续需要移除工作流,直接删除工作流文件即可'));
}
