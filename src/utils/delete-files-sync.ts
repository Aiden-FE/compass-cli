import { unlinkSync, existsSync } from 'fs';

// eslint-disable-next-line import/prefer-default-export
export function deleteFilesSync(filesPath: string | string[]) {
  const files = Array.isArray(filesPath) ? filesPath : [filesPath];
  files.forEach((file) => {
    if (existsSync(file)) {
      unlinkSync(file);
    }
  });
}
