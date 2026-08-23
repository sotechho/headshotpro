export * from './server-auth';

export function getUserDashboardPath(role: string): string {
  if (role.toLowerCase().trim() === 'admin') {
    return '/dashboard/admin';
  }
  return '/dashboard/user';
}
