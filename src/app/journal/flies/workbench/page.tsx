import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import WorkbenchClient from './WorkbenchClient';

export const metadata = {
  title: 'Tying Workbench | Executive Angler',
  description: 'Manage your fly-tying materials inventory, see what you can tie, and browse the materials catalog.',
};

export default async function WorkbenchPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/journal/flies/workbench');
  }

  return <WorkbenchClient />;
}
