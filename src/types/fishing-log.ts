export interface FlyPattern {
  id: string;
  user_id: string;
  name: string;
  type?: string;
  size?: string;
  hook?: string;
  bead_size?: string;
  bead_color?: string;
  fly_color?: string;
  materials?: string;
  description?: string;
  video_url?: string;
  tags?: string[];
  image_url?: string;
  notes?: string;
  notion_id?: string;
  created_at: string;
  updated_at: string;
}

export interface FishingSession {
  id: string;
  user_id: string;
  river_id?: string;
  river_name?: string;
  date: string;
  weather?: string;
  water_temp_f?: number;
  water_clarity?: string;
  total_fish: number;
  notes?: string;
  flies_notes?: string;
  tags?: string[];
  notion_id?: string;
  latitude?: number;
  longitude?: number;
  // Gear tracking
  gear_rod_id?: string;
  gear_reel_id?: string;
  gear_line_id?: string;
  gear_leader_id?: string;
  gear_tippet_id?: string;
  gear_snapshot?: Record<string, { name: string; maker?: string; model?: string }>;
  created_at: string;
  updated_at: string;
}

export interface SessionRig {
  id: string;
  session_id: string;
  fly_pattern_id?: string;
  fly_name?: string;
  position: number;
  notion_id?: string;
  created_at: string;
  fly_pattern?: FlyPattern;
}

export interface Catch {
  id: string;
  session_id: string;
  species?: string;
  length_inches?: number;
  fly_pattern_id?: string;
  fly_name?: string;
  time?: string;
  notes?: string;
  notion_id?: string;
  created_at: string;
  fly_pattern?: FlyPattern;
}

export interface FishingSpot {
  id: string;
  river_id?: string;
  name: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  notion_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AnglerProfile {
  id: string;
  user_id: string;
  display_name?: string;
  home_location?: string;
  created_at: string;
  updated_at: string;
}
