import { execSync } from 'child_process';

export default function getLibraryVersionFromNpmRegisty(libraryName: string, options?: { cwd?: string }) {
  const cwd = options?.cwd || process.cwd();
  const hasDevDep = execSync(`npm pkg get devDependencies.${libraryName}`, { cwd }).toString().trim();
  if (hasDevDep === '{}' || hasDevDep === '') {
    const hasDep = execSync(`npm pkg get dependencies.${libraryName}`, { cwd }).toString().trim();
    if (hasDep === '{}' || hasDep === '') {
      return null;
    }
    return hasDep.replace(/"/g, '');
  }
  return hasDevDep.replace(/"/g, '');
}
