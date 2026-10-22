import base from './vite.config.js';

export default {
  ...base,
  preview: {
    port: 4182,
    strictPort: true,
    proxy: base.server.proxy,
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'"
    }
  }
};
