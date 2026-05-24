import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import RiverStatsView from './RiverStatsView';
import { checkPremium } from '@/lib/admin';

export const metadata = {
  title: 'River Stats',
  description: 'Your sessions, fish, and personal bests by river.',
};

export default async function StatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/journal/stats');
  }

  const isPremium = await checkPremium(supabase, user.id, user.email);

  return (
    <div className="min-h-screen bg-[#0D1117] pt-6 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <RiverStatsView isPremium={isPremium} />
      </div>
    </div>
  );
}
