// =============================================
// Executive Angler — Unified Fishing Log Types
// =============================================
// Aligned with iOS app + Supabase schema
// as of 2026-03-18 schema unification migration.
// =============================================

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
  title?: string;
  location?: string;
  section?: string;               // River section: Upper, Middle, Lower, Tailwater
  weather?: string;
  water_temp_f?: number;
  water_clarity?: string;
  total_fish: number;
  notes?: string;
  flies_notes?: string;
  tags?: string[];
  trip_tags?: string[];            // Trip categorization tags
  privacy?: 'public' | 'private'; // Default: private
  // GPS data (from iOS session tracking)
  latitude?: number;
  longitude?: number;
  route_points?: number[][];       // [[lat, lon], ...] GPS track
  // Gear tracking
  gear_rod_id?: string;
  gear_reel_id?: string;
  gear_line_id?: string;
  gear_leader_id?: string;
  gear_tippet_id?: string;
  gear_snapshot?: Record<string, { name: string; maker?: string; model?: string }>;
  // Meta
  notion_id?: string;
  created_at: string;
  updated_at: string;
  // Joined data (populated by queries, not stored)
  catches?: Catch[];
  author_profile?: Profile;
}

export interface Catch {
  id: string;
  session_id: string;
  user_id?: string;
  species?: string;
  length_inches?: number;
  fly_pattern_id?: string;
  fly_name?: string;                // Denormalized fly pattern name
  fly_size?: string;                // Fly size designation
  fly_position?: string;            // Position on line (point, dropper, etc.)
  bead_size?: string;
  time?: string;                    // Legacy web field (TIME type)
  time_caught?: string;             // iOS timestamp of catch
  quantities?: number;              // Multi-catch count (default 1)
  notes?: string;                   // Legacy web notes
  catch_note?: string;              // iOS catch notes
  catch_tags?: string[];            // Catch-level tags
  // Location (from iOS GPS)
  latitude?: number;
  longitude?: number;
  // Photos
  fish_image_url?: string;          // Primary catch photo
  fish_location_image_url?: string; // Location/scenery photo
  fly_image_url?: string;           // Fly pattern photo
  photo_urls?: string[];            // Additional photo URLs (iOS multi-photo)
  // Meta
  notion_id?: string;
  created_at: string;
  // Joined data
  fly_pattern?: FlyPattern;
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

// =============================================
// Unified Profile — single source of truth
// =============================================
// Table: profiles (PK: user_id)
// Used by both iOS and Web.
// Replaces: angler_profiles, user_profiles
// =============================================

export interface Profile {
  user_id: string;
  display_name?: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  is_private: boolean;
  home_location?: string;
  home_state?: string;
  experience_level?: string;
  feed_display?: 'collage' | 'map';
  total_sessions?: number;
  total_fish?: number;
  created_at: string;
  updated_at: string;
}

/** @deprecated Use Profile instead. Kept for backward compatibility. */
export type AnglerProfile = Profile;

// =============================================
// Gear Items
// =============================================

export type GearType = 'rod' | 'reel' | 'line' | 'leader' | 'tippet' | 'net' | 'waders' | 'other';

export interface GearItem {
  id: string;
  user_id: string;
  type: GearType;
  name: string;
  maker?: string;
  model?: string;
  specs: Record<string, unknown>;
  is_default: boolean;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// =============================================
// Social Features
// =============================================

export type FollowStatus = 'pending' | 'accepted';

export interface FollowRecord {
  id: string;
  follower_id: string;
  following_id: string;
  status: FollowStatus;
  created_at: string;
}

export interface SessionComment {
  id: string;
  session_id: string;
  user_id: string;
  text: string;
  created_at: string;
  // Joined
  profile?: Pick<Profile, 'display_name' | 'username' | 'avatar_url'>;
}

export interface SessionLike {
  id: string;
  session_id: string;
  user_id: string;
  created_at: string;
}

// =============================================
// Direct Messages
// =============================================
// Tables: dm_threads, dm_messages
// Shared with iOS app.
// =============================================

export interface DMThread {
  id: string;
  participant_a: string;
  participant_b: string;
  last_message_at: string;
  created_at: string;
  // Joined data (not stored)
  other_profile?: {
    user_id: string;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  last_message_body?: string;
  unread_count?: number;
}

export interface DMMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
  deleted_at: string | null;
  // Joined data
  sender_profile?: Pick<Profile, 'display_name' | 'username' | 'avatar_url'>;
}

// =============================================
// Awards & Gamification
// =============================================

export type AwardType = 'river_milestone' | 'species_master' | 'streak' | 'seasonal';

export interface UserAward {
  id: string;
  user_id: string;
  award_type: AwardType;
  award_key: string;
  river_name?: string;
  river_id?: string;
  awarded_at: string;
  expires_at?: string;
  metadata?: {
    badge_icon?: string;
    badge_color?: string;
    display_name?: string;
    description?: string;
    value?: number;
  };
}
