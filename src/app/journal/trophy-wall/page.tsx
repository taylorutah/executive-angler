import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TrophyWallClient from './TrophyWallClient';
import PageHeader from '@/components/ui/PageHeader';

export const metadata = {
  title: 'Trophy Wall',
  description: 'Your personal bests — biggest fish by species, by river, and top sessions',
};

export default async function TrophyWallPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/journal/trophy-wall');
  }

  // Fetch all catches with session data (include fish_image_urls for gallery)
  const { data: catches } = await supabase
    .from('catches')
    .select('id, session_id, species, length_inches, fly_name, fly_size, fish_image_url, fish_image_urls, time_caught, created_at')
    .eq('user_id', user.id)
    .not('length_inches', 'is', null)
    .order('length_inches', { ascending: false });

  // Fetch all catches with photos (including those without length)
  const { data: photoCatches } = await supabase
    .from('catches')
    .select('id, session_id, species, length_inches, fly_name, fly_size, fish_image_url, fish_image_urls, time_caught, created_at')
    .eq('user_id', user.id)
    .or('fish_image_url.neq.,fish_image_urls.neq.{}')
    .order('created_at', { ascending: false });

  // Fetch all sessions for context
  const { data: sessions } = await supabase
    .from('fishing_sessions')
    .select('id, date, river_name, total_fish, title')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  return (
    <div className="min-h-screen bg-[var(--paper)] pt-6 pb-12">
      <div className="max-w-[var(--container)] mx-auto px-4 sm:px-6">
        <PageHeader eyebrow="Journal" title="Trophy wall" />
        <TrophyWallClient catches={catches || []} sessions={sessions || []} photoCatches={photoCatches || []} />
      </div>
    </div>
  );
}
