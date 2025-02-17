const esbuild = require('esbuild');
const { replace } = require('esbuild-plugin-replace');
const pkg = require('./package.json');

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
`;

async function build() {
  await esbuild.build({
    entryPoints: ['./src/frontend/frontend.ts'],
    outfile: `./${pkg.main}`,
    format: 'iife',
    bundle: true,
    banner: { js: bannerText },
    sourcemap: "inline",
    minify: true,
    plugins: [
      replace({
        __VERSION__: JSON.stringify(pkg.version),
      }),
    ],
  });

  await esbuild.build({
    entryPoints: ['./src/backend/backend.ts'],
    outfile: './node_helper.js',
    format: 'cjs',
    bundle: true,
    banner: { js: bannerText },
    external: ['node_helper', 'logger', '@matter/main', 'express', 'node-persist'],
    platform: 'node',
    sourcemap: "inline",
    minify: true,
    plugins: [
      replace({
        __VERSION__: JSON.stringify(pkg.version),
      }),
    ],
    legalComments: "inline",
    charset: "utf8",
  });

  console.log('✅ Build complete!');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});