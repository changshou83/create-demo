import getCommand from './getCommand.js';

export default function generateReadme({
  projectName,
  packageManager,
  needsTypeScript,
}) {
  let readme = `# ${projectName}

## Project Setup

`;

  let npmScriptsDescriptions = `\`\`\`sh
${getCommand(packageManager, 'install')}
\`\`\`

### Compile and Hot-Reload for Development

\`\`\`sh
${getCommand(packageManager, 'dev')}
\`\`\`

### ${needsTypeScript ? 'Type-Check, ' : ''}Compile and Minify for Production

\`\`\`sh
${getCommand(packageManager, 'build')}
\`\`\`
`;

  readme += npmScriptsDescriptions;

  return readme;
}
