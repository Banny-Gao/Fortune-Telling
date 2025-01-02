import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'

const input = 'src/index.ts'
const external = [] // 添加外部依赖

const plugins = [
  nodeResolve(),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    declaration: true,
    declarationDir: 'dist',
  }),
]

export default [
  // ESM build
  {
    input,
    output: {
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true,
    },
    plugins,
    external,
  },
  // CJS build
  {
    input,
    output: {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
    },
    plugins,
    external,
  },
  // Minified ESM build
  {
    input,
    output: {
      file: 'dist/index.min.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: [...plugins, terser()],
    external,
  },
]
