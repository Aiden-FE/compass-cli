import { existsSync, lstatSync, readdirSync, rmdirSync, unlinkSync } from 'fs';
import { join } from 'path';

export default function deleteFoldersSync(folderPaths: string | string[]) {
  const targetPath = Array.isArray(folderPaths) ? folderPaths : [folderPaths];

  targetPath.forEach((folderPath) => {
    if (existsSync(folderPath)) {
      readdirSync(folderPath).forEach((file) => {
        const curPath = join(folderPath, file);

        if (lstatSync(curPath).isDirectory()) {
          // 递归删除子文件夹
          deleteFoldersSync(curPath);
        } else {
          // 删除文件
          unlinkSync(curPath);
        }
      });

      // 删除空文件夹
      rmdirSync(folderPath);
    }
  });
}
