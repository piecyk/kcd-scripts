const spawn = require('cross-spawn')
const yargsParser = require('yargs-parser')
const {
  hasPkgProp,
  resolveBin,
  hasFile,
  fromRoot,
  fromConfigRelative,
} = require('../utils')

let args = process.argv.slice(2)
const parsedArgs = yargsParser(args)

const useBuiltinConfig =
  !args.includes('--config') &&
  !hasFile('.eslintrc') &&
  !hasFile('.eslintrc.js') &&
  !hasPkgProp('eslintConfig')

const config = useBuiltinConfig
  ? ['--config', fromConfigRelative('eslintrc.js')]
  : []

const useBuiltinIgnore =
  !args.includes('--ignore-path') &&
  !hasFile('.eslintignore') &&
  !hasPkgProp('eslintIgnore')

const ignore = useBuiltinIgnore
  ? ['--ignore-path', fromConfigRelative('eslintignore')]
  : []

const cache = args.includes('--no-cache')
  ? []
  : [
      '--cache',
      '--cache-location',
      fromRoot('node_modules/.cache/.eslintcache'),
    ]

const filesGiven = parsedArgs._.length > 0

const filesToApply = filesGiven ? [] : ['.']

if (filesGiven) {
  // we need to take all the flag-less arguments (the files that should be linted)
  // and filter out the ones that aren't js files. Otherwise json or css files
  // may be passed through
  args = args.filter(a => !parsedArgs._.includes(a) || /\.jsx?$/.test(a))
}

const result = spawn.sync(
  resolveBin('eslint'),
  [...config, ...ignore, ...cache, ...args, ...filesToApply],
  {stdio: 'inherit'},
)

process.exit(result.status)
