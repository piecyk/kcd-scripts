const spawn = require('cross-spawn')
const yargsParser = require('yargs-parser')
const {
  resolveBin,
  hasFile,
  hasLocalConfig,
  fromConfigRelative,
} = require('../utils')

const args = process.argv.slice(2)
const parsedArgs = yargsParser(args)

const useBuiltinConfig =
  !args.includes('--config') && !hasLocalConfig('prettier')
const config = useBuiltinConfig
  ? ['--config', fromConfigRelative('prettierrc.js')]
  : []

const useBuiltinIgnore =
  !args.includes('--ignore-path') && !hasFile('.prettierignore')
const ignore = useBuiltinIgnore
  ? ['--ignore-path', fromConfigRelative('prettierignore')]
  : []

const write = args.includes('--no-write') ? [] : ['--write']

// this ensures that when running format as a pre-commit hook and we get
// the full file path, we make that non-absolute so it is treated as a glob,
// This way the prettierignore will be applied
const relativeArgs = args.map(a => a.replace(`${process.cwd()}/`, ''))

const filesToApply = parsedArgs._.length
  ? []
  : ['**/*.+(js|json|less|css|ts|tsx|md)']

const result = spawn.sync(
  resolveBin('prettier'),
  [...config, ...ignore, ...write, ...filesToApply].concat(relativeArgs),
  {stdio: 'inherit'},
)

process.exit(result.status)
