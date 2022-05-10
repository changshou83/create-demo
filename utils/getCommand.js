// 根据不同的包管理工具返回不同的命令
export default function getCommand(packageManager, scriptName) {
  if (scriptName === 'install') {
    return packageManager === 'yarn' ? 'yarn' : `${packageManager} install`;
  }

  return packageManager === 'npm'
    ? `npm run ${scriptName}`
    : `${packageManager} ${scriptName}`;
}
