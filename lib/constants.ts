export const APP_CONFIG = {
  name: 'Nexus',
  description: 'Beautiful communication for modern teams',
  version: '1.0.0',
} as const;

export const AUTH_ROUTES = {
  login: '/auth/login',
  register: '/auth/register',
  forgot: '/auth/forgot-password',
} as const;

export const APP_ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  settings: '/settings',
} as const;
