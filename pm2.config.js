module.exports = {
  name: 'bot_akmal',
  script: './dist/bot.js',
  watch: true,
  ignore_watch: ['node_modules', 'logs'],
  exp_backoff_restart_delay: 100,
  combine_logs: true,
  merge_logs: true,
  error_file: 'logs/err.log',
  out_file: 'logs/out.log',
  time: true,
  env: {
    NODE_ENV: 'production'
  }
}
