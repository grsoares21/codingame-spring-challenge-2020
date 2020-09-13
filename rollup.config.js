
import typescript from '@rollup/plugin-typescript'
import commonjs from "rollup-plugin-commonjs";
import nodeResolve from "rollup-plugin-node-resolve";
import json from '@rollup/plugin-json';

export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [typescript(),  commonjs({
    // non-CommonJS modules will be ignored, but you can also
    // specifically include/exclude files
    include: [ "./index.js", "node_modules/**" ], // Default: undefined

    // if true then uses of `global` won't be dealt with by this plugin
    ignoreGlobal: false, // Default: false

    // if false then skip sourceMap generation for CommonJS modules
    sourceMap: false // Default: true
  }),

  nodeResolve({
    jsnext: true,
    main: false
  }),
  json()],
  watch: {
    include: 'src/**',
    exclude: 'src/**/*.test.ts',
  },
}