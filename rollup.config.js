import { builtinModules } from 'module';
import json from '@rollup/plugin-json';
import ts from 'rollup-plugin-ts';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import cleanup from 'rollup-plugin-cleanup';
import summary from 'rollup-plugin-summary';
import { visualizer } from 'rollup-plugin-visualizer';

const IS_PROD = !process.env.ROLLUP_WATCH;

/**
 * @description 获取构建插件
 * @param {{[key: 'json'|'ts'|'commonjs'|'terser'|'cleanup'|'summary'|'visualizer']: object}} [options]
 * @param {('json'|'ts'|'commonjs'|'terser'|'cleanup'|'summary'|'visualizer')[]} [ignorePlugins]
 * @returns
 */
function getPlugins(options = {}, ignorePlugins = []) {
  return [
    !ignorePlugins.includes('json') && json(options.json || undefined),
    !ignorePlugins.includes('ts') && ts(options.ts || undefined),
    // 如果目标是node环境,需要提供选项{ exportConditions: ["node"] }以支持构建
    !ignorePlugins.includes('nodeResolve') && nodeResolve(options.nodeResolve || undefined),
    !ignorePlugins.includes('commonjs') && commonjs(options.commonjs || undefined),
    IS_PROD && !ignorePlugins.includes('terser') && terser(options.terser || undefined),
    IS_PROD && !ignorePlugins.includes('cleanup') && cleanup({ comments: 'none', ...(options.cleanup || {}) }),
    IS_PROD &&
      !ignorePlugins.includes('summary') &&
      summary({
        showGzippedSize: true,
        ...(options.summary || {}),
      }),
    IS_PROD &&
      !ignorePlugins.includes('visualizer') &&
      visualizer({
        gzipSize: true,
        // template: 'treemap', // network, treemap,sunburst, default: treemap
        ...(options.visualizer || {}),
      }),
  ].filter((item) => !!item);
}

/**
 * @description 获取要排除的外部选项
 * @param {string[]} additionalExternal
 * @return {string[]}
 */
function getExternal(additionalExternal = []) {
  return [...builtinModules].concat(additionalExternal || []);
}

/**
 * @description 获取输出配置项
 * @param options 文档: https://www.rollupjs.com/guide/big-list-of-options
 * @return {Record<string, unknown>}
 */
function getOutput(options = {}) {
  return {
    dir: 'dist',
    format: 'es',
    chunkFileNames: 'bundle/chunk.[format].[hash].js',
    entryFileNames: '[name].js',
    sourcemap: IS_PROD,
    ...options,
  };
}

export default [
  // esm
  {
    input: 'src/main.ts',
    output: getOutput(),
    external: getExternal(['axios', 'chalk', 'commander', 'inquirer', 'ora']),
    plugins: getPlugins({
      nodeResolve: { browser: false, exportConditions: ['node'] },
    }),
    watch: {
      include: ['src/**'],
    },
  },
].filter((item) => !!item);
