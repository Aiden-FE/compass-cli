import { input, confirm } from '@inquirer/prompts';

export const STYLELINT_PLUGINS = [
  { name: 'Vue', value: 'vue' },
  { name: 'Scss', value: 'scss' },
  { name: 'Less', value: 'less' },
  { name: 'Stylus', value: 'stylus' },
];

export const SELECT_TEMPLATE = [
  {
    name: '自定义模板',
    value: 'custom',
    description: '自定义模板,仅支持Github模板. 自动将.handlebars后缀文件同路径编译为无后缀的文件,变量可按需提供',
    getTemplateVars: async (options?: any) => {
      const tempData = await input({
        message: '[可选]可在此处提供模板变量, 请输入可被JSON.parse处理的对象数据或JSON数据',
        validate(value) {
          try {
            if (!value) {
              return true;
            }
            const data = JSON.parse(value);
            if (typeof data === 'object') {
              return true;
            }
            return '请输入可被JSON.parse处理的对象数据或JSON数据';
          } catch {
            return '请输入可被JSON.parse处理的对象数据或JSON数据';
          }
        },
      });
      return {
        ...options,
        ...(tempData ? JSON.parse(tempData) : {}),
      };
    },
  },
  {
    name: 'Nextjs SSR项目模板',
    value: 'nextjs',
    getTemplateVars: async (options?: any) => {
      const result = {
        projectName: await input({
          message: '请输入项目名称',
          default: options.projectName,
        }),
        projectDescription:
          options?.projectDescription ||
          (await input({
            message: '[可选]请输入项目描述',
          })),
      };
      return result;
    },
  },
  {
    name: 'Vue 基础项目模板',
    value: 'vue',
    getTemplateVars: async (options?: any) => {
      const result = {
        projectName: await input({
          message: '请输入项目名称',
          default: options.projectName,
        }),
        projectDescription:
          options?.projectDescription ||
          (await input({
            message: '[可选]请输入项目描述',
          })),
      };
      return result;
    },
  },
  {
    name: 'Vue 组件库模板',
    value: 'vue-lib',
    getTemplateVars: async (options?: any) => {
      const result = {
        projectName: await input({
          message: '请输入项目名称',
          default: options.projectName,
        }),
        projectDescription:
          options?.projectDescription ||
          (await input({
            message: '[可选]请输入项目描述',
          })),
      };
      return result;
    },
  },
  {
    name: 'Uniapp 基础项目模板',
    value: 'uniapp',
    getTemplateVars: async (options?: any) => {
      const result = {
        projectName: await input({
          message: '请输入项目名称',
          default: options.projectName,
        }),
        projectDescription:
          options?.projectDescription ||
          (await input({
            message: '[可选]请输入项目描述',
          })),
      };
      return result;
    },
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
            message: '[可选]请输入项目描述',
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
            message: '是否启用 pretty-quick 插件,代码提交前快速格式化变更文件',
            default: true,
          })),
        enabledCommitlint:
          options?.enabledPrettyQuick ||
          (await confirm({
            message: '是否启用 commitlint 插件,代码提交前对提交信息进行校验',
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
  {
    name: 'Commandline 命令行模板',
    value: 'cli',
    getTemplateVars: async (options?: any) => {
      return {
        projectName: await input({
          message: '请输入项目名称',
          default: options.projectName,
        }),
        projectDescription:
          options?.projectDescription ||
          (await input({
            message: '[可选]请输入项目描述',
          })),
        commandName:
          options?.commandName ||
          (await input({
            message: '请指定终端命令的字符,由长度12以内的小写字母组成,建议简洁易记',
            validate(value) {
              if (!/^[a-z]{1,12}$/.test(value)) {
                return '命令字符由长度12以内的小写字母组成,建议简洁易记';
              }
              return true;
            },
          })),
      };
    },
  },
  {
    name: 'Styles 基础样式库模板',
    value: 'styles',
    getTemplateVars: async (options?: any) => {
      return {
        projectName: await input({
          message: '请输入项目名称',
          default: options.projectName,
        }),
        projectDescription:
          options?.projectDescription ||
          (await input({
            message: '[可选]请输入项目描述',
          })),
        domain:
          options?.domain ||
          (await input({
            message: '请指定样式前缀字符,用来控制业务域影响,由长度12以内的小写字母和数字组成',
            validate(value) {
              if (!/^[a-z0-9]{1,12}$/.test(value)) {
                return '业务域前缀应该由12位长度以内的小写字母和数字组成';
              }
              return true;
            },
          })),
        enabledStylelint:
          options?.enabledStylelint ||
          (await confirm({
            message: '是否启用 Stylelint 样式检查',
            default: true,
          })),
      };
    },
  },
];
