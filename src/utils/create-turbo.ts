import inquirer from 'inquirer';
import { join } from 'path';
import ora from 'ora';
import chalk from 'chalk';
import { createFile, createFolder, isFileOrFolderExists } from '@compass-aiden/helpers/cjs';
import { PkgManager } from '@/interfaces';

const PACKAGE_FILE = `{
  "name": "demo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
`;
const WORKSPACE_PACKAGE_FILE = `{
  "name": "demo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \\"Error: no test specified\\" && exit 1"
  },
  "workspaces": ["packages/*", "apps/*"],
  "keywords": [],
  "author": "",
  "license": "ISC"
}
`;

const PNPM_WORKSPACES_FILE = `packages:
  - "packages/*"
  - "apps/*"
`;

const TURBO_JSON_FILE = `{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      // A package's \`build\` script depends on that package's
      // dependencies and devDependencies
      // \`build\` tasks  being completed first
      // (the \`^\` symbol signifies \`upstream\`).
      "dependsOn": ["^build"],
      // note: output globs are relative to each package's \`package.json\`
      // (and not the monorepo root)
      "outputs": [".next/**", "!.next/cache/**"],
    },
    "deploy": {
      // A package's \`deploy\` script depends on the \`build\`,
      // \`test\`, and \`lint\` scripts of the same package
      // being completed. It also has no filesystem outputs.
      "dependsOn": ["build", "test", "lint"],
    },
    "test": {
      // A package's \`test\` script depends on that package's
      // own \`build\` script being completed first.
      "dependsOn": ["build"],
      // A package's \`test\` script should only be rerun when
      // either a \`.tsx\` or \`.ts\` file has changed in \`src\` or \`test\` folders.
      "inputs": [
        "src/**/*.tsx",
        "src/**/*.ts",
        "test/**/*.ts",
        "test/**/*.tsx",
      ],
    },
    // A package's \`lint\` script has no dependencies and
    // can be run whenever. It also has no filesystem outputs.
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true,
    },
  },
}`;

const GITIGNORE_FILE = `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# Dependencies
node_modules
.pnp
.pnp.js

# Local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Testing
coverage

# Turbo
.turbo

# Vercel
.vercel

# Build Outputs
.next/
out/
build
dist


# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Misc
.DS_Store
*.pem`;

export default async function createTurbo(options?: { pkgManager?: PkgManager }) {
  const opt = {
    pkgManager: 'npm',
    ...options,
  };
  const { projectPath } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectPath',
      message: '请指定项目路径',
      default: './new-project',
    },
  ]);
  const loading = ora();
  loading.start(chalk.cyan('开始生成文件\n'));
  const runCwdPath = join(process.cwd(), projectPath);
  const execOptions = { stdio: 'inherit' as const, cwd: runCwdPath };
  if (isFileOrFolderExists(runCwdPath)) {
    loading.fail(chalk.red('目标路径已经存在'));
    return;
  }
  // 创建目标路径
  await createFolder(projectPath, {});
  // 创建workspaces配置
  if (opt.pkgManager === 'pnpm') {
    createFile('package.json', PACKAGE_FILE, execOptions);
    createFile('pnpm-workspace.yaml', PNPM_WORKSPACES_FILE, execOptions);
  } else {
    createFile('package.json', WORKSPACE_PACKAGE_FILE, execOptions);
  }
  createFolder('apps', execOptions);
  createFolder('packages', execOptions);
  createFile('turbo.json', TURBO_JSON_FILE, execOptions);
  createFile('.gitignore', GITIGNORE_FILE, execOptions);
  // 创建文件夹
  loading.succeed(chalk.green('创建完成'));
}
