import { redirect } from 'next/navigation';

// Journal insights → redirect to dashboard insights page
// This keeps the journal nav simple while reusing the existing insights system
export default function JournalInsightsRedirect() {
  redirect('/dashboard/insights');
}
