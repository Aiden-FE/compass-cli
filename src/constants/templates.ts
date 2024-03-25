import { input, confirm } from '@inquirer/prompts';

/* eslint-disable import/prefer-default-export */
export const SELECT_TEMPLATE = [
  {
    name: '自定义模板',
    value: 'custom',
    getTemplateVars: async (options?: any) => options || {},
  },
  {
    name: 'Utils 实用程序工具库模板',
    value: 'utils',
    getTemplateVars: async (options?: any) => {
      const result = {
        projectName: await input({
          message: '请输入项目名称',
          default: options.projectName,
        }),
        projectDescription:
          options?.projectDescription ||
          (await input({
            message: '请输入项目描述',
          })),
        enabledEslint:
          options?.enabledEslint ||
          (await confirm({
            message: '是否启用 eslint 代码检查插件',
            default: true,
          })),
        enabledPrettier:
          options?.enabledEslint ||
          (await confirm({
            message: '是否启用 prettier 代码格式化插件',
            default: true,
          })),
        enabledJest:
          options?.enabledJest ||
          (await confirm({
            message: '是否启用 jest 单测插件',
            default: true,
          })),
        enabledTypedoc:
          options?.enabledTypedoc ||
          (await confirm({
            message: '是否启用 typedoc 生成文档',
            default: true,
          })),
        enabledPrettyQuick:
          options?.enabledPrettyQuick ||
          (await confirm({
            message: '是否启用 pretty-quick 插件,代码提交前快速格式化变更文件.依赖enabledGithooks开启',
            default: true,
          })),
        enabledCommitlint:
          options?.enabledPrettyQuick ||
          (await confirm({
            message: '是否启用 commitlint 插件,代码提交前对提交信息进行校验.依赖enabledGithooks开启',
            default: true,
          })),
        enabledGithooks: false,
      };

      return {
        ...result,
        enabledGithooks: result.enabledPrettyQuick || result.enabledCommitlint || false,
      };
    },
  },
];
