# @compass-aiden/cli

> Command line interfaces for Compass CLI

## Getting Started

`npm install -g @compass-aiden/cli` 全局安装cli

`compass --help` 获取帮助信息

`compass update` Cli更新检查

`compass create` 创建项目, `compass create --help` 可以获得更多可选项说明, 支持创建的项目如下:

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
|  Utils   |   实用程序工具库   |

`compass plugin` 向项目添加或删除插件, `compass plugin --help` 可以获得更多可选项说明

## Contributes

### Install

`pnpm install`

### Base commands

- `pnpm dev` 启用开发模式
- `pnpm build` 生产构建
- `pnpm lint` 代码校验
- `pnpm format` 代码格式化

### Publish library

1. 变更package.json内的version字段
2. 提交合并请求至master即可

## Roadmap

- [ ] `compass update` Compass CLI更新检查
- [ ] `compass create <command> --options` 创建项目命令
- [ ] `compass plugin <command> --options` 插件管理命令
