module.exports = {
  apps: [
    {
      name: 'fraternity-base-backend',
      script: 'dist/server-enhanced.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      autorestart: true,
      kill_timeout: 5000,
      listen_timeout: 8000,
      shutdown_with_message: true,
      wait_ready: true,
      instance_var: 'INSTANCE_ID'
    }
  ],

  deploy: {
    production: {
      user: 'node',
      host: 'your-production-server',
      ref: 'origin/main',
      repo: 'git@github.com:username/fraternity-base.git',
      path: '/var/www/production',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};