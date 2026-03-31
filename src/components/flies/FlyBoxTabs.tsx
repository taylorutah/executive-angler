'use client';

import { useState } from 'react';
import { Heart, ListChecks, Layers } from 'lucide-react';

type Tab = 'all' | 'favorites' | 'tie-next';

interface FlyBoxTabsProps {
  children: (activeTab: Tab) => React.ReactNode;
  favCount: number;
  tieNextCount: number;
}

export function FlyBoxTabs({ children, favCount, tieNextCount }: FlyBoxTabsProps) {
  const [tab, setTab] = useState<Tab>('all');

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'all', label: 'My Box', icon: <Layers className="h-3.5 w-3.5" /> },
    { key: 'favorites', label: 'Favorites', icon: <Heart className="h-3.5 w-3.5" />, count: favCount },
    { key: 'tie-next', label: 'Tie Next', icon: <ListChecks className="h-3.5 w-3.5" />, count: tieNextCount },
  ];

  return (
    <div>
      <div className="flex gap-1 mb-6 bg-[#161B22] border border-[#21262D] rounded-lg p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-[#E8923A] text-white'
                : 'text-[#A8B2BD] hover:text-[#F0F6FC] hover:bg-[#0D1117]'
            }`}
          >
            {t.icon}
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`text-xs rounded-full px-1.5 ${tab === t.key ? 'bg-white/20' : 'bg-[#21262D]'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>
      {children(tab)}
    </div>
  );
}
