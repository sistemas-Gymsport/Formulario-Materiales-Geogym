import base from './vite.config.js';

export default { ...base, preview: { port: 4181, strictPort: true, proxy: base.server.proxy } };
