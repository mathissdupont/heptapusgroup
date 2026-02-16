// ecosystem.config.js — PM2 process manager config
// PM2 ile Next.js production sunucusunu yönet.
//
// Kullanım:
//   pm2 start ecosystem.config.js
//   pm2 save
//   pm2 startup  (reboot'ta otomatik başlat)
//
// Loglar:
//   pm2 logs heptapus
//   pm2 monit

module.exports = {
  apps: [
    {
      name: "heptapus",
      script: "node_modules/.bin/next",
      args: "start -p 3000",
      cwd: "/var/www/heptapusgroup",
      env: {
        NODE_ENV: "production",
        DATABASE_URL: "file:./prisma/dev.db",
        // AUTH_SECRET .env dosyasından okunur
      },
      instances: 1,           // SQLite tek instance destekler
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      error_file: "/var/log/heptapus/error.log",
      out_file: "/var/log/heptapus/out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
