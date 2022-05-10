#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

import minimist from 'minimist';
import prompts from 'prompts';
import { red, green, bold } from 'kolorist';

import renderTemplate from './utils/renderTemplate.js';
import { preOrderDirectoryTraverse } from './utils/directoryTraverse.js';
import generateReadme from './utils/generateReadme.js';
import getCommand from './utils/getCommand.js';

function isValidPackageName(projectName) {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
    projectName
  );
}

function toValidPackageName(projectName) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-') // 空格换为 -
    .replace(/^[._]/, '') // 消灭 _
    .replace(/[^a-z0-9-~]+/g, '-'); // 把不是数字,字母,-,~的全部变成 -
}

async function init() {
  const cwd = process.cwd(); // get the current working directory of the node.js process
  // possible options:
  // --default
  // --typescript / --ts
  const argv = minimist(process.argv.slice(2), {
    alias: {
      typescript: ['ts'],
    },
    boolean: true, // all arguments are treated as booleans
  });

  // if any of the feature flags is set, we would skip the feature prompts
  const isFeatureFlagsUsed = typeof (argv.default ?? argv.ts) === 'boolean';

  let targetDir = argv._[0]; // node example/parse.js foo bar  _: ['foo', 'bar']
  const defaultProjectName = !targetDir ? 'default-project' : targetDir;

  let result = {};

  try {
    // Prompts:
    // - Project name:
    //   - enter a valid package name for package.json
    // - Project language: JavaScript / TypeScript
    result = await prompts(
      [
        {
          name: 'projectName',
          type: targetDir ? null : 'text',
          message: 'Project name:',
          initial: defaultProjectName,
          onState: state =>
            (targetDir = String(state.value).trim() || defaultProjectName),
        },
        {
          name: 'packageName',
          type: () => (isValidPackageName(targetDir) ? null : 'text'),
          message: 'Package name:',
          initial: () => toValidPackageName(targetDir),
          validate: dir =>
            isValidPackageName(dir) || 'Invalid package.json name',
        },
        {
          name: 'needsTypeScript',
          type: () => (isFeatureFlagsUsed ? null : 'toggle'),
          message: 'Add TypeScript?',
          initial: false,
          active: 'Yes',
          inactive: 'No',
        },
      ],
      {
        onCancel: () => {
          throw new Error(red('✖') + ' Operation cancelled');
        },
      }
    );
  } catch (canceled) {
    console.log(canceled.message);
    process.exit(1);
  }

  // `initial` won't take effect if the prompt type is null
  // so we still have to assign the default values here
  const {
    packageName = result.projectName ?? defaultProjectName,
    needsTypeScript = argv.typescript,
  } = result;
  const root = path.join(cwd, targetDir);

  console.log(`\nScaffolding project in ${root}...`);

  const pkg = { name: packageName, version: '0.0.0' };
  fs.writeFileSync(
    path.resolve(root, 'package.json'),
    JSON.stringify(pkg, null, 2)
  );

  // todo:
  // work around the esbuild issue that `import.meta.url` cannot be correctly transpiled
  // when bundling for node and the format is cjs
  // const templateRoot = new URL('./template', import.meta.url).pathname
  const templateRoot = path.resolve(__dirname, 'template');
  const render = function render(templateName) {
    const templateDir = path.resolve(templateRoot, templateName);
    renderTemplate(templateDir, root);
  };

  // Render base template
  render('base');

  // Add configs.
  if (needsTypeScript) {
    render('config/typescript');
  }

  const TemplateName = (needsTypeScript ? 'typescript-' : '') + 'default';

  // Render code template.
  render(`code/${TemplateName}`);

  // Render entry file (app.js/ts).
  render(`entry/${TemplateName}`);

  // Cleanup.

  if (needsTypeScript) {
    // rename all `.js` files to `.ts`
    // rename jsconfig.json to tsconfig.json
    preOrderDirectoryTraverse(
      root,
      () => {},
      filepath => {
        if (filepath.endsWith('.js')) {
          fs.renameSync(filepath, filepath.replace(/\.js$/, '.ts'));
        } else if (path.basename(filepath) === 'jsconfig.json') {
          fs.renameSync(
            filepath,
            filepath.replace(/jsconfig\.json$/, 'tsconfig.json')
          );
        }
      }
    );

    // Rename entry in `index.html`
    const indexHtmlPath = path.resolve(root, 'index.html');
    const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
    fs.writeFileSync(
      indexHtmlPath,
      indexHtmlContent.replace('src/app.js', 'src/app.ts')
    );
  }

  // Instructions:
  // Supported package managers: pnpm > yarn > npm
  // Note: until <https://github.com/pnpm/pnpm/issues/3505> is resolved,
  // it is not possible to tell if the command is called by `pnpm init`.
  const packageManager = /pnpm/.test(process.env.npm_execpath)
    ? 'pnpm'
    : /yarn/.test(process.env.npm_execpath)
    ? 'yarn'
    : 'npm';

  // README generation
  fs.writeFileSync(
    path.resolve(root, 'README.md'),
    generateReadme({
      projectName: result.projectName || defaultProjectName,
      packageManager,
      needsTypeScript,
    })
  );

  console.log(`\nDone. Now run:\n`);
  if (root !== cwd) {
    console.log(`  ${bold(green(`cd ${path.relative(cwd, root)}`))}`);
  }
  console.log(`  ${bold(green(getCommand(packageManager, 'install')))}`);
  console.log(`  ${bold(green(getCommand(packageManager, 'dev')))}`);
  console.log();
}

init().catch(e => console.error(e));
