import sucrase from '@rollup/plugin-sucrase';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from "rollup-plugin-terser";
import commonjs from '@rollup/plugin-commonjs';

const production = !process.env.ROLLUP_WATCH;

const plugins = [
  resolve({ extensions: ['.ts', '.js'] }),
  commonjs(),
  sucrase({ transforms: ['typescript'] }),
  terser({ output: { comments: false } }),
]

export default [
  {
    input: ['./packageB/pages/arKit/behavior.ts'],
    treeshake: true,
    output: {
      format: 'cjs',
      dir: 'packageB/pages',
      chunkFileNames: 'chunks/[name]2.js',
      entryFileNames: 'arKit/[name].js',
      manualChunks: {
        'three-platformize': ['three-platformize']
      }
    },
    plugins
  },
]