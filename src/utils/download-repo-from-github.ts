import AdmZip from 'adm-zip';
import fs from 'fs';
import path, { join } from 'path';
import { createFolder } from '@compass-aiden/helpers/cjs';
import { RepositoryInfo } from '@/interfaces';
import { getFile, getRepoReleasesFromGithub, getRepoFromGithub } from '@/http';
import { Logger } from '@/utils';

function downloadFiles(promises: Promise<{ path: string; data: any }>[], basePath: string, isSingleFile?: boolean) {
  const admZip = new AdmZip();
  return Promise.all(promises).then(async (result) => {
    const files = result.filter((r) => !!r);
    if (files.length !== result.length) {
      Logger.warn(`部分文件获取失败,可能是与 raw.githubusercontent.com 的连接不畅,
      您可选择如下方式之一进行重试
        1. hosts内调整raw.githubusercontent.com与实际IP的对应关系
        2. 指定-T或--token参数,提供授权信息
        3. 不使用特定路径或文件拉取,直接获取仓库本身,该方式较为稳定`);
    }
    if (!files.length) {
      Logger.error('未能获取到任何文件');
      throw new Error('未能获取到任何文件');
    }
    files.forEach((file) => {
      admZip.addFile(isSingleFile ? file.path : file.path.replace(basePath, '.'), file.data);
    });
    admZip.writeZip('temp.zip');
  });
}

async function mapFileAndDirectory({
  dirs,
  repoInfo,
  promises,
  basePath,
  token,
  isNotInit,
}: {
  dirs: string[];
  promises: Promise<any>[];
  basePath: string;
  repoInfo: RepositoryInfo;
  token?: string;
  isNotInit?: boolean;
}) {
  return getRepoReleasesFromGithub(
    {
      author: repoInfo.author,
      repository: repoInfo.repository,
    },
    token,
  ).then(async (result) => {
    const data = Array.isArray(result) ? result : [result];
    const isSingleFile = !isNotInit && !Array.isArray(result);
    data.forEach((content) => {
      if (content.type === 'dir') {
        dirs.push(content.path);
      } else if (content.download_url) {
        promises.push(
          new Promise((resolve) => {
            getFile(
              content.download_url as string,
              token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : undefined,
            )
              .then((d) =>
                resolve({
                  path: content.path,
                  data: d,
                }),
              )
              .catch(() => resolve(false));
          }),
        );
      }
    });

    if (dirs.length) {
      await mapFileAndDirectory({
        dirs,
        repoInfo,
        promises,
        basePath,
        token,
        isNotInit: true,
      });
    } else {
      await downloadFiles(promises, basePath, isSingleFile);
    }
  });
}

function downloadFilesFromGithub(repoInfo: RepositoryInfo, token?: string) {
  const dirs = [];
  const promises: Promise<any>[] = [];

  dirs.push(repoInfo.repoPath as string);
  return mapFileAndDirectory({
    dirs,
    promises,
    repoInfo,
    basePath: repoInfo.repoPath as string,
    token,
  });
}

/**
 * @description 下载存储库
 * @param repoInfo
 * @param output
 */
export default async function downloadRepoFromGithub(repoInfo: RepositoryInfo, output = './', token?: string) {
  try {
    await createFolder(output);
    const zipPath = join(output, 'temp.zip');
    if (repoInfo.repoPath) {
      await downloadFilesFromGithub(repoInfo, token);
      const tempZip = new AdmZip(zipPath);
      tempZip.extractAllTo(output, true);
      fs.rmSync(zipPath);
    } else {
      const result = await getRepoFromGithub(repoInfo, token);
      fs.writeFileSync(zipPath, result);
      // fs.writeFileSync('temp.zip', Buffer.from(result, 'binary'));
      const tempZip = new AdmZip(zipPath);
      const entryFile = tempZip.getEntries()[0];
      tempZip.extractAllTo(output, true);
      const unZipPath = path.join(output, entryFile.entryName);
      fs.cpSync(unZipPath, output, { recursive: true });
      fs.rmSync(zipPath);
      fs.rmSync(unZipPath, { recursive: true });
    }
  } catch (err) {
    Logger.error(err);
    fs.unlinkSync(output);
  }
}
