import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import RiverStatsView from './RiverStatsView';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'River Stats | Executive Angler',
  description: 'View your fishing statistics and achievements by river',
};

export default async function StatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/journal/stats');
  }

  return (
    <div className="min-h-screen bg-[#0D1117] pt-4 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-cream transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Journal
          </Link>
          <h1 className="font-heading text-4xl text-cream">River Statistics</h1>
          <p className="text-slate-400 mt-2">
            Track your progress, earn achievements, and see how you&apos;re doing on each river
          </p>
        </div>

        {/* Stats View */}
        <RiverStatsView />
      </div>
    </div>
  );
}
