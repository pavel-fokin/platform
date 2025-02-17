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
    layout('routes/profile-public/layout.tsx', [
      index('routes/profile-public/profile-public.tsx'),
      route('/recruiter-auth', 'routes/profile-public/recruiter-auth.tsx'),
    ]),
  ]),

  route('/auth/magic-link', 'routes/auth/magic-link.tsx'),

  ...prefix('/me', [
    layout('routes/me/layout.tsx', [
      index('routes/me/profile.tsx'),
      route('/interviews', 'routes/me/interviews.tsx'),
      route('/wallet', 'routes/me/wallet.tsx'),
      route('/edit-profile', 'routes/me/profile-edit.tsx'),
    ]),
  ]),
] satisfies RouteConfig;
