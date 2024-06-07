import { readFileSync } from 'fs';
import { dirname } from 'path';
import handlebars from 'handlebars';
import { createFileSync, createFolder, isFileOrFolderExists } from '@compass-aiden/helpers/cjs';

/**
 * @description 使用handlebars批量编译模板
 * @param temps 模板的源路径与目标路径
 * @param tempData 模板的上下文数据
 */
export default async function batchCompileTemplates(temps: [string, string][], tempData: Record<string, any>) {
  const tasks = temps.map(async (temp) => {
    if (temp && temp[0] && temp[1]) {
      let fileData = '';
      if (temp[0].endsWith('.handlebars')) {
        fileData = handlebars.compile(readFileSync(temp[0], 'utf-8'))(tempData);
      } else {
        fileData = readFileSync(temp[0], 'utf-8');
      }
      const targetDirPath = dirname(temp[1]);
      if (!isFileOrFolderExists(targetDirPath)) {
        await createFolder(targetDirPath);
      }
      createFileSync(temp[1], fileData);
    }
  });
  await Promise.all(tasks);
}
