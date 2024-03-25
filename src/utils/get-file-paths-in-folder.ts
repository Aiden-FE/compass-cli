import { readdirSync, statSync } from 'fs';
import { join } from 'path';

export default function getFilePathsInFolder(folderPath: string) {
  try {
    const files = readdirSync(folderPath);
    let filePaths: string[] = [];

    files.forEach((file) => {
      const filePath = join(folderPath, file);
      const stats = statSync(filePath);

      if (stats.isFile()) {
        // 是文件，将文件路径添加到结果数组中
        filePaths.push(filePath);
      } else if (stats.isDirectory()) {
        // 是目录，递归调用函数获取子目录中的文件路径
        const subDirectoryPaths = getFilePathsInFolder(filePath);
        filePaths = filePaths.concat(subDirectoryPaths);
      }
    });

    return filePaths;
  } catch {
    return [];
  }
}
