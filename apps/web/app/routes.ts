import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from '@react-router/dev/routes';

export default [
  index('routes/index.tsx'),

  ...prefix('/:nameSlug', [
    layout('routes/profile/layout.tsx', [
      index('routes/profile/index.tsx'),
      route('/auth', 'routes/profile/auth.tsx'),
      route('/payment', 'routes/profile/payment.tsx'),
    ]),
  ]),

  route('/auth/login', 'routes/auth/index.tsx'),

  ...prefix('/me', [
    layout('routes/me/layout.tsx', [
      index('routes/me/profile.tsx'),
      route('/interviews', 'routes/me/interviews.tsx'),
      route('/wallet', 'routes/me/wallet.tsx'),
      route('/edit-profile', 'routes/me/profile-edit.tsx'),
    ]),
  ]),
] satisfies RouteConfig;
