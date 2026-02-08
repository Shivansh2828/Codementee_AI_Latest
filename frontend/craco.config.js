// Simple craco config without complex plugins
const path = require("path");

module.exports = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  eslint: {
    enable: false, // Disable ESLint to avoid missing rule warnings
  },
};