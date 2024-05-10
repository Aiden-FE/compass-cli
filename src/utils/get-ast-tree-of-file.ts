import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as acorn from 'acorn';

/**
 * 获取文件的ast语法树
 * @param filePath 文件路径
 * @param options 配置项
 * @returns {acorn.Program}
 */
export default function getASTTreeOfFile(
  filePath: string,
  options?: {
    cwd?: string;
  } & Partial<acorn.Options>,
): acorn.Program {
  const { cwd, encoding } = {
    encoding: 'utf8' as const,
    cwd: process.cwd(),
    ...options,
  };
  const target = typeof cwd !== 'undefined' ? resolve(cwd, filePath) : filePath;
  const code = readFileSync(target, { encoding });
  const comments: acorn.Comment[] = [];
  const tokens: acorn.Token[] = [];
  const ast = acorn.parse(code, {
    ecmaVersion: options?.ecmaVersion || 7,
    onComment: comments,
    onToken: tokens,
    locations: true,
    ...options,
  });
  // @ts-expect-error -- expected
  ast.comments = comments;
  // @ts-expect-error -- expected
  ast.tokens = tokens;
  return ast;
}
