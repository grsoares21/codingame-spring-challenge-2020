
import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/bundle_test.js',
    format: 'es',
    sourcemap: true
  },
  plugins: [typescript()],
  watch: {
    include: 'src/**',
    exclude: 'src/**/*.test.ts',
  },
}