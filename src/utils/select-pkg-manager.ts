import inquirer from 'inquirer';
import { PkgManager } from '@/interfaces';

/**
 * @description 引导用户选择包管理器
 * @param options 配置项
 * @returns 用户选择的包管理器
 */
export default async function selectPkgManager(options?: {
  /**
   * @default 'npm'
   */
  defaultManager?: PkgManager;
  /**
   * @default '请选择要使用的包管理器'
   */
  message?: string;
}) {
  const { manager } = await inquirer.prompt([
    {
      type: 'list',
      name: 'manager',
      message: options?.message || '请选择要使用的包管理器',
      default: options?.defaultManager || 'npm',
      choices: [
        {
          name: 'Pnpm 包管理器 (推荐)',
          value: 'pnpm',
        },
        {
          name: 'Yarn 包管理器',
          value: 'yarn',
        },
        {
          name: 'Npm 包管理器',
          value: 'npm',
        },
      ],
    },
  ]);

  return manager as PkgManager;
}
