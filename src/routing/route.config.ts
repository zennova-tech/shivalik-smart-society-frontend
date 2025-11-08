export const ROLE_DEFAULTS: Record<string, string> = {
  SuperAdmin: '/society-management',
  Manager: "/dashboard"
};

export const ROLE_ROUTES: Record<string, string[]> = {
  SuperAdmin: [
    '/dashboard',
    '/society-management',
    '/building-details',
  ],
  Manager: [
    '/dashboard',
    '/building-details',
  ],
};