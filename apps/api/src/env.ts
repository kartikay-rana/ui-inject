export function config() {
  return {
    adminUsername: process.env.ADMIN_USERNAME ?? 'admin',
    adminPassword: process.env.ADMIN_PASSWORD ?? '',
    apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:3001',
  };
}