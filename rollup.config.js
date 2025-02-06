import banner2 from 'rollup-plugin-banner2'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import replace from '@rollup/plugin-replace';
import pkg from './package.json'

const bannerText = `/*
  ┌────────────────────────────────────────────────────────────────┐
  │                    MMM-Matter by Fabrizz <3                    │
  │              https://github.com/Fabrizz/MMM-Matter             │
  │                        (c) Fabrizio Bap                        │
  │                                                                │
  ├─ Version ${(pkg.version + " MIT License").padEnd(54, ' ')}│
  └────────────────────────────────────────────────────────────────┘
*/

// [⚠] This file is auto-generated. DO NOT EDIT.
`
export default [
  {
    input: './src/frontend/frontend.ts',
    plugins: [
      replace({
        __VERSION__: JSON.stringify(pkg.version),
        preventAssignment: true,
      }),
      typescript({ module: 'ESNext' }),
      nodeResolve(),
      commonjs(),
      terser(),
      banner2(() => bannerText)
    ],
    output: {
      file: `./${pkg.main}`,
      format: 'iife',
    }
  },
  {
    input: './src/backend/backend.ts',
    external: ['node_helper', 'logger', '@matter/main', 'express'],
    plugins: [
      replace({
        __VERSION__: JSON.stringify(pkg.version),
        preventAssignment: true,
      }),
      typescript({ module: 'ESNext' }),
      nodeResolve(),
      terser(),
      banner2(() => bannerText)
    ],
    output: {
      interop: 'auto',
      file: './node_helper.js',
      format: 'cjs'
    }
  }
]