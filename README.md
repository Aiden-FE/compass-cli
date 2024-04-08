# @compass-aiden/cli

> Command line interfaces for Compass CLI

## Getting Started

`npm install -g @compass-aiden/cli` 全局安装cli 或着 npm使用 `npx @compass-aiden/cli <command>`, pnpm使用`pnpm dlx @compass-aiden/cli <command>`等方式临时使用

`compass --help` 获取帮助信息

`compass update` Cli更新检查

`compass pull` 通过拉取模板来创建项目, `compass pull --help` 可以获得更多可选项说明,支持拉取的模板如下:

|                                   Name                                    |                            Description                             |
| :-----------------------------------------------------------------------: | :----------------------------------------------------------------: |
|   [Utils](https://github.com/Aiden-FE/compass-template/tree/temp/utils)   |                      Utils实用程序工具库模板                       |
|  [Styles](https://github.com/Aiden-FE/compass-template/tree/temp/styles)  |                        Styles基础样式库模板                        |
| [Commandline](https://github.com/Aiden-FE/compass-template/tree/temp/cli) |                       Commandline 命令行模板                       |
|                                自定义模板                                 | 支持拉取Github自定义模板,支持注入模板变量,排除模板文件等定制化处理 |

`compass plugin` 向项目添加或删除插件, `compass plugin --help` 可以获得更多可选项说明,支持创建的插件如下:

|     Name      |                                     Description                                     |
| :-----------: | :---------------------------------------------------------------------------------: |
|    Eslint     |                         Eslint 基于Airbnb规范对代码进行检查                         |
|   Prettier    |                                 Prettier 代码格式化                                 |
|   Githooks    |                 使用SimpleGitHooks基于githooks对项目添加自动化任务                  |
|  Commitlint   |                Commitlint 提交信息格式校验,该插件依赖于githooks插件                 |
|  Prettyquick  | PrettyQuick 在Commit前仅对变更文件进行快速格式化,该插件依赖于githooks及prettier插件 |
| githubactions |                      Github actions 基于github actions添加CICD                      |

`compass create` 创建各官方标准项目, `compass create --help` 可以获得更多可选项说明, 支持创建的项目如下:

|   Name   |    Description     |
| :------: | :----------------: |
|   Vue    |      Vue项目       |
|  React   |     React项目      |
| Angular  |    Angular项目     |
|   Next   |    Next SSR项目    |
|  Turbo   | Turbo monorepo项目 |
|  Uniapp  |  Uniapp 跨端项目   |
| Electron | Electron桌面端项目 |
|   Nest   |    Nest后端项目    |

## Contributes

### Install

`pnpm install`

### Base commands

- `pnpm dev` 启用开发模式
- `pnpm build` 生产构建
- `pnpm lint` 代码校验
- `pnpm format` 代码格式化

### Publish library

提交合并请求至master即可, publish,tag,release都将自动化处理
