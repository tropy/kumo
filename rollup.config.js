import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'

export default {
  input: {
    releases: 'src/releases/index.js'
  },
  output: {
    format: 'cjs',
    dir: 'lib',
    entryFileNames: '[name]/index.js'
  },
  external: [
    'aws-sdk'
  ],
  plugins: [
    resolve({
      exportConditions: ['node'],
      preferBuiltins: true
    }),
    babel({
      babelHelpers: 'bundled'
    }),
    json(),
    commonjs()
  ]
}
