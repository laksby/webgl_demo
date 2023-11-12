const { resolve } = require('path');
const esbuild = require('esbuild');

esbuild
  .build({
    entryPoints: {
      app: resolve(__dirname, './src/main.ts'),
    },
    bundle: true,
    sourcemap: true,
    minify: true,
    outdir: resolve(__dirname, './build'),
    loader: {
      '.glsl': 'text',
      '.png': 'dataurl',
      '.woff': 'dataurl',
      '.woff2': 'dataurl',
      '.eot': 'dataurl',
      '.ttf': 'dataurl',
      '.svg': 'dataurl',
    },
  })
  .catch(reason => {
    console.error(reason);
    process.exit(1);
  });
