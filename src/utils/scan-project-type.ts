import { compareVersion } from '@compass-aiden/helpers/cjs';
import getLibraryVersionFromNpmRegisty from './get-library-version-from-npm-registy';

export default function scanProjectType(options?: {
  cwd?: string;
}): 'vue3' | 'vue2' | 'react' | 'angular' | 'next' | 'uniapp' | 'electron' | 'nest' | 'unknown' {
  const { cwd } = { cwd: process.cwd(), ...options };
  const electronVersion = getLibraryVersionFromNpmRegisty('electron', { cwd });
  if (electronVersion) {
    return 'electron';
  }
  const uniappVersion = getLibraryVersionFromNpmRegisty('@dcloudio/uni-app', { cwd });
  if (uniappVersion) {
    return 'uniapp';
  }
  const vueVersion = getLibraryVersionFromNpmRegisty('vue', { cwd });
  if (vueVersion) {
    const isVue3 = compareVersion(vueVersion, '3.0.0', /\^|~/gi) >= 0;
    return isVue3 ? 'vue3' : 'vue2';
  }
  const nextVersion = getLibraryVersionFromNpmRegisty('next', { cwd });
  if (nextVersion) {
    return 'next';
  }
  const reactVersion = getLibraryVersionFromNpmRegisty('react', { cwd });
  if (reactVersion) {
    return 'react';
  }
  const angularVersion = getLibraryVersionFromNpmRegisty('@angular/core', { cwd });
  if (angularVersion) {
    return 'angular';
  }
  const nestVersion = getLibraryVersionFromNpmRegisty('@nestjs/core', { cwd });
  if (nestVersion) {
    return 'nest';
  }
  return 'unknown';
}
