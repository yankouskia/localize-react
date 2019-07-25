import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';
import autoExternal from 'rollup-plugin-auto-external';
import replace from 'rollup-plugin-replace';

const config = {
  input: 'src/index.js',
  output: {
    file: './dist/localize-react.js',
    format: 'umd',
    name: 'localize-react',
    globals: { 'react': 'React' },
  },
  plugins: [
    autoExternal(),
    replace({ NODE_ENV: process.env.API_KEY }),
    resolve(),
    babel({ exclude: 'node_modules/**' }),
    uglify(),
  ]
};

export default config;
