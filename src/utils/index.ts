// create utils
export { default as createTurbo } from './create-turbo';
export { default as selectPkgManager } from './select-pkg-manager';
export { default as createUniapp } from './create-uniapp';
export { default as createVue } from './create-vue';
export { default as createReact } from './create-react';
export { default as createElectron } from './create-electron';
export { default as createNest } from './create-nest';
export { default as createNext } from './create-next';
export { default as createAngular } from './create-angular';

// tools
export { default as batchCompileTemplates } from './batch-compile-templates';
export { default as Logger } from './logger';
export { default as getLibraryVersionFromNpmRegisty } from './get-library-version-from-npm-registy';
export { default as downloadRepoFromGithub } from './download-repo-from-github';
export { default as getFilePathsInFolder } from './get-file-paths-in-folder';
export { default as deleteFoldersSync } from './delete-folder-sync';
export * from './delete-files-sync';

// plugin utils
export * from './githooks.plugin';
export * from './prettier.plugin';
export * from './prettyquick.plugin';
export * from './commitlint.plugin';
export * from './eslint.plugin';

// pull templates
export { default as pullUtilsTemplate } from './pull-utils.template';
