import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
const pkg = require('./package.json')
const { camelCase } = require('lodash')

const libraryName = 'termix'

export default {
  input: `compiled/${libraryName}.js`,
  output: [
		{ file: pkg.main, name: camelCase(libraryName), format: 'umd' },
		{ file: pkg.module, format: 'es' }
  ],
  sourcemap: true,
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [
    'rxjs/BehaviorSubject'
  ],
  globals: {
    'rxjs/BehaviorSubject': 'Rx'
  },
  plugins: [
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
     // Allow node_modules resolution, so you can use 'external' to control
     // which external modules to include in the bundle
     // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve()
  ]
}
