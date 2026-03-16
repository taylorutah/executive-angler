export interface UserAward {
  id: string;
  user_id: string;
  award_type: 'river_milestone' | 'species_master' | 'streak' | 'seasonal';
  award_key: string;
  river_name?: string;
  river_id?: string;
  awarded_at: string;
  expires_at?: string;
  metadata: {
    badge_icon?: string;
    badge_color?: string;
    display_name?: string;
    description?: string;
    value?: number;
    [key: string]: any;
  };
}

export interface RiverStats {
  river_name: string;
  river_id?: string;
  total_sessions: number;
  total_fish: number;
  biggest_fish?: number;
  favorite_fly?: string;
  first_session: string;
  last_session: string;
  species_caught: string[];
  avg_fish_per_session: number;
  best_session_fish_count: number;
  awards: UserAward[];
}

export interface AwardDefinition {
  key: string;
  type: UserAward['award_type'];
  display_name: string;
  description: string;
  icon: string;
  color: string;
  threshold: number;
  check: (stats: RiverStats) => boolean;
}

// Award definitions
export const RIVER_AWARDS: AwardDefinition[] = [
  {
    key: 'first_timer',
    type: 'river_milestone',
    display_name: 'First Timer',
    description: 'First session on this river',
    icon: '🎣',
    color: '#00B4D8',
    threshold: 1,
    check: (stats) => stats.total_sessions >= 1,
  },
  {
    key: 'regular',
    type: 'river_milestone',
    display_name: 'Regular',
    description: '5 sessions on this river',
    icon: '⭐',
    color: '#E8923A',
    threshold: 5,
    check: (stats) => stats.total_sessions >= 5,
  },
  {
    key: 'veteran',
    type: 'river_milestone',
    display_name: 'Veteran',
    description: '10 sessions on this river',
    icon: '🏆',
    color: '#E8923A',
    threshold: 10,
    check: (stats) => stats.total_sessions >= 10,
  },
  {
    key: 'legend',
    type: 'river_milestone',
    display_name: 'Legend',
    description: '25 sessions on this river',
    icon: '👑',
    color: '#FFD700',
    threshold: 25,
    check: (stats) => stats.total_sessions >= 25,
  },
  {
    key: 'centurion',
    type: 'river_milestone',
    display_name: 'Centurion',
    description: '100 fish caught on this river',
    icon: '💯',
    color: '#00B4D8',
    threshold: 100,
    check: (stats) => stats.total_fish >= 100,
  },
  {
    key: 'master_angler',
    type: 'river_milestone',
    display_name: 'Master Angler',
    description: '500 fish caught on this river',
    icon: '🎯',
    color: '#E8923A',
    threshold: 500,
    check: (stats) => stats.total_fish >= 500,
  },
  {
    key: 'species_hunter',
    type: 'species_master',
    display_name: 'Species Hunter',
    description: '3+ species caught on this river',
    icon: '🐟',
    color: '#00B4D8',
    threshold: 3,
    check: (stats) => stats.species_caught.length >= 3,
  },
  {
    key: 'consistent_producer',
    type: 'river_milestone',
    display_name: 'Consistent Producer',
    description: 'Average 10+ fish per session',
    icon: '📈',
    color: '#00B4D8',
    threshold: 10,
    check: (stats) => stats.avg_fish_per_session >= 10,
  },
];
