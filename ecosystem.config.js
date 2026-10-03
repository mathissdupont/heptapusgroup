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

const path = require("node:path");
require("@next/env").loadEnvConfig(__dirname, false);

module.exports = {
  apps: [
    {
      name: "heptapus",
      script: ".next/standalone/server.js",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || "3000",
        DATABASE_URL: process.env.DATABASE_URL,
        AUTH_SECRET: process.env.AUTH_SECRET,
        AUTH_COOKIE_DOMAIN: process.env.AUTH_COOKIE_DOMAIN || "",
        TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
        APP_ORIGIN: process.env.APP_ORIGIN || "https://heptapusgroup.com",
        TRUSTED_PROXY_IP_HEADER: process.env.TRUSTED_PROXY_IP_HEADER || "",
        UPLOAD_DIR: path.join(__dirname, "data", "uploads"),
        APP_LOG_PATH: "/var/log/heptapus/out.log",
        ERROR_LOG_PATH: "/var/log/heptapus/error.log",
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
