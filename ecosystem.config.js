// ecosystem.config.js — PM2 process manager config
// ⚠️  Docker Compose kullanılıyorsa bu dosyaya gerek yoktur.
//     Eğer PM2 ile doğrudan sunucuda çalıştırmak istiyorsanız kullanın.
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
        DATABASE_URL: "postgresql://heptapus:heptapus_secret_2026@localhost:5432/heptapus",
        // AUTH_SECRET .env dosyasından okunur
      },
      instances: 2,            // PostgreSQL birden fazla instance destekler
      exec_mode: "cluster",    // Cluster mode ile yük dağılımı
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
