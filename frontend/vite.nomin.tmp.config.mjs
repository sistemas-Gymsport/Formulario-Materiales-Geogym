import base from './vite.config.js';

export default {
  ...base,
  build: { ...base.build, minify: false, outDir: 'dist-nomin' },
  preview: { port: 4183, strictPort: true, proxy: base.server.proxy }
};
