/**
 * Awards System Utilities
 * Helper functions for triggering award checks and calculations
 */

/**
 * Trigger award check for a specific river
 * Call this after creating/updating a fishing session
 *
 * @param riverName - Name of the river to check awards for
 * @returns Promise<void>
 *
 * @example
 * // After creating a session
 * await checkRiverAwards("Provo River");
 */
export async function checkRiverAwards(riverName: string): Promise<void> {
  try {
    // Fetch stats endpoint which auto-grants awards
    const response = await fetch(`/api/stats/river?river=${encodeURIComponent(riverName)}`);

    if (!response.ok) {
      console.warn(`Failed to check awards for ${riverName}`);
      return;
    }

    const stats = await response.json();

    // Log newly earned awards (if any)
    if (stats.awards && stats.awards.length > 0) {
      console.log(`✅ Awards for ${riverName}:`, stats.awards.map((a: any) => a.metadata.display_name));
    }
  } catch (error) {
    console.error('Error checking river awards:', error);
  }
}

/**
 * Trigger award check for all rivers
 * Use sparingly - can be slow for users with many rivers
 *
 * @returns Promise<void>
 *
 * @example
 * // After bulk import
 * await checkAllRiverAwards();
 */
export async function checkAllRiverAwards(): Promise<void> {
  try {
    const response = await fetch('/api/stats/river');

    if (!response.ok) {
      console.warn('Failed to check awards for all rivers');
      return;
    }

    const allStats = await response.json();

    // Log total awards
    const totalAwards = allStats.reduce((sum: number, s: any) => sum + (s.awards?.length || 0), 0);
    console.log(`✅ Total awards earned: ${totalAwards} across ${allStats.length} rivers`);
  } catch (error) {
    console.error('Error checking all river awards:', error);
  }
}

/**
 * Check if user has a specific award on a river
 *
 * @param riverName - River name
 * @param awardKey - Award key (e.g., 'veteran', 'centurion')
 * @returns Promise<boolean>
 *
 * @example
 * const hasVeteran = await hasAward("Provo River", "veteran");
 * if (!hasVeteran) {
 *   console.log("5 more sessions until Veteran!");
 * }
 */
export async function hasAward(riverName: string, awardKey: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/stats/river?river=${encodeURIComponent(riverName)}`);

    if (!response.ok) return false;

    const stats = await response.json();

    return stats.awards?.some((a: any) => a.award_key === awardKey) || false;
  } catch (error) {
    console.error('Error checking award:', error);
    return false;
  }
}

/**
 * Get progress towards next award on a river
 *
 * @param riverName - River name
 * @returns Promise<object> - Progress info for each award
 *
 * @example
 * const progress = await getAwardProgress("Provo River");
 * // { veteran: { current: 8, needed: 10, percent: 80 }, ... }
 */
export async function getAwardProgress(riverName: string): Promise<Record<string, any>> {
  try {
    const response = await fetch(`/api/stats/river?river=${encodeURIComponent(riverName)}`);

    if (!response.ok) return {};

    const stats = await response.json();
    const earned = new Set(stats.awards?.map((a: any) => a.award_key) || []);

    const progress: Record<string, any> = {};

    // Session-based awards
    if (!earned.has('regular') && stats.total_sessions < 5) {
      progress.regular = {
        current: stats.total_sessions,
        needed: 5,
        percent: Math.round((stats.total_sessions / 5) * 100),
        name: 'Regular',
        icon: '⭐',
      };
    }

    if (!earned.has('veteran') && stats.total_sessions < 10) {
      progress.veteran = {
        current: stats.total_sessions,
        needed: 10,
        percent: Math.round((stats.total_sessions / 10) * 100),
        name: 'Veteran',
        icon: '🏆',
      };
    }

    if (!earned.has('legend') && stats.total_sessions < 25) {
      progress.legend = {
        current: stats.total_sessions,
        needed: 25,
        percent: Math.round((stats.total_sessions / 25) * 100),
        name: 'Legend',
        icon: '👑',
      };
    }

    // Fish-based awards
    if (!earned.has('centurion') && stats.total_fish < 100) {
      progress.centurion = {
        current: stats.total_fish,
        needed: 100,
        percent: Math.round((stats.total_fish / 100) * 100),
        name: 'Centurion',
        icon: '💯',
      };
    }

    if (!earned.has('master_angler') && stats.total_fish < 500) {
      progress.master_angler = {
        current: stats.total_fish,
        needed: 500,
        percent: Math.round((stats.total_fish / 500) * 100),
        name: 'Master Angler',
        icon: '🎯',
      };
    }

    return progress;
  } catch (error) {
    console.error('Error getting award progress:', error);
    return {};
  }
}
