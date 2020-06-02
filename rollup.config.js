import externals from 'rollup-plugin-node-externals';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';

const plugins = (target) => [
  externals({ deps: true }),
  typescript({
    clean: true,
    tsconfigOverride: {
      compilerOptions: {
        target,
      },
    },
  }),
  terser(),
];

export default [
  {
    input: 'src/index.ts',
    output: {
      file: `build/${pkg.main}`,
      format: 'cjs',
    },
    plugins: plugins('ES2019'),
  },
  {
    input: 'src/scraper.config.js',
    output: {
      file: 'build/scraper.config.js',
      format: 'cjs',
    },
    plugins: plugins('ES2019'),
  },
];
