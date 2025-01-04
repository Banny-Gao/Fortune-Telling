import typescript from '@rollup/plugin-typescript'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'

const input = 'src/index.ts'
const external = ['dayjs', '@amap/amap-jsapi-loader']

// 基础插件配置
const basePlugins = [nodeResolve(), commonjs()]

export default [
  // ESM build
  {
    input,
    output: {
      dir: 'dist/esm',
      format: 'es',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    plugins: [
      ...basePlugins,
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist/esm/types',
        outDir: 'dist/esm',
        exclude: ['**/*.test.ts'],
      }),
    ],
    external,
  },
  // CJS build
  {
    input,
    output: {
      dir: 'dist/cjs',
      format: 'cjs',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    plugins: [
      ...basePlugins,
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        outDir: 'dist/cjs',
        exclude: ['**/*.test.ts'],
      }),
    ],
    external,
  },
  // Minified bundle
  {
    input,
    output: {
      file: 'dist/index.min.js',
      format: 'es',
      sourcemap: true,
    },
    plugins: [
      ...basePlugins,
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        exclude: ['**/*.test.ts'],
      }),
      terser(),
    ],
    external,
  },
]
