// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Evitar que webpack intente resolver módulos de Node que solo son para entorno server.
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      canvas: false,
      fs: false,
      path: false,
      os: false,
      stream: false,
      util: false,
    };

    // (Opcional) Si quieres ver warnings en vez de errores, puedes agregar:
    // config.ignoreWarnings = [{ message: /critical dependency:/i }];

    return config;
  },
};

module.exports = nextConfig;
