module.exports = {
  apps: [{
    name: 'swiss-consult-backend',
    cwd: '/var/www/swiss-consult-hub/server',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    error_file: '/var/log/pm2/swiss-consult-error.log',
    out_file: '/var/log/pm2/swiss-consult-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
  }]
};
