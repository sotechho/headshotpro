import { getCurrentUserServer, getUserDashboardPath } from '@/lib/util/index';
import { redirect } from 'next/navigation';
export default async function DashboardPage() {
  const user = await getCurrentUserServer();
  const redirectPath = getUserDashboardPath(user?.role as any);
  redirect(redirectPath, 'replace');
}
