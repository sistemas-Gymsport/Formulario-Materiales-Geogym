module.exports = {
  apps: [
    {
      name: 'geogym-backend',
      cwd: '/opt/geogym-materiales/backend',
      script: 'src/server.js',
      node_args: '--env-file=.env',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '700M',
      autorestart: true,
      time: true
    }
  ]
};
