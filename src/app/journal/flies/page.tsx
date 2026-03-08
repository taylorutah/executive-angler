import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Fish } from 'lucide-react'

export default async function FlyPatternsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: patterns, error } = await supabase
    .from('fly_patterns')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <Link
          href="/journal"
          className="inline-flex items-center text-forest hover:text-forest-dark mb-6"
        >
          ← Back to Journal
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-heading font-bold text-slate-900">My Fly Patterns</h1>
          <Link
            href="/journal/flies/new"
            className="inline-flex items-center px-6 py-3 bg-forest text-white font-semibold rounded-lg hover:bg-forest-dark transition-colors"
          >
            Add Pattern
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            Error loading patterns: {error.message}
          </div>
        )}

        {!patterns || patterns.length === 0 ? (
          <div className="text-center py-12">
            <Fish className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-600 text-lg mb-4">No fly patterns yet</p>
            <Link
              href="/journal/flies/new"
              className="inline-flex items-center px-6 py-3 bg-forest text-white font-semibold rounded-lg hover:bg-forest-dark transition-colors"
            >
              Add Your First Pattern
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {patterns.map((pattern: any) => (
              <Link
                key={pattern.id}
                href={`/journal/flies/${pattern.id}/edit`}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-slate-100 flex items-center justify-center">
                  {pattern.image_url ? (
                    <img
                      src={pattern.image_url}
                      alt={pattern.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl">🪰</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 mb-1">{pattern.name}</h3>
                  <p className="text-sm text-slate-500 mb-2">{pattern.type}</p>
                  {pattern.hook_sizes && (
                    <p className="text-sm text-slate-600">Sizes: {pattern.hook_sizes}</p>
                  )}
                  {(pattern.bead_size || pattern.bead_color) && (
                    <p className="text-sm text-slate-600">
                      Bead: {[pattern.bead_size, pattern.bead_color].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
