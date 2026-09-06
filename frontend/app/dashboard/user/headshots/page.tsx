'use client';

import { HeadshotHeader } from '@/components/headshot';
import { useGetHeadshots } from '@/lib/hooks/useHeadshot';

export default function HeadshotsPage() {
  const { data } = useGetHeadshots();
  return (
    <div className="space-y-8">
      <HeadshotHeader />
      {data && <div>{JSON.stringify(data, null, 2)}</div>}
    </div>
  );
}
