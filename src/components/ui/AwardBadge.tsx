import type { UserAward } from '@/types/awards';

interface AwardBadgeProps {
  award: UserAward;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export function AwardBadge({ award, size = 'md', showDetails = false }: AwardBadgeProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
  };

  const containerClasses = showDetails ? 'flex items-start gap-3' : 'inline-flex';

  return (
    <div className={containerClasses}>
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center shadow-lg border-2`}
        style={{
          backgroundColor: award.metadata.badge_color || '#E8923A',
          borderColor: award.metadata.badge_color || '#E8923A',
        }}
        title={award.metadata.display_name}
      >
        <span className="filter drop-shadow-sm">{award.metadata.badge_icon || '🏆'}</span>
      </div>
      {showDetails && (
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-cream">{award.metadata.display_name}</div>
          <div className="text-sm text-slate-400">{award.metadata.description}</div>
          {award.awarded_at && (
            <div className="text-xs text-slate-500 mt-1">
              Earned {new Date(award.awarded_at).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
