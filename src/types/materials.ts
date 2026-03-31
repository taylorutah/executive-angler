// =============================================
// Fly-Tying Workbench Types
// =============================================

export type MaterialCategory =
  | 'hook' | 'bead' | 'thread' | 'dubbing' | 'feather' | 'flash'
  | 'foam' | 'wire' | 'resin' | 'marker' | 'rubber' | 'synthetic'
  | 'tail' | 'wing' | 'ribbing' | 'chenille' | 'body' | 'eye';

export type RecipeRole =
  | 'hook' | 'bead' | 'thread' | 'tail' | 'body' | 'ribbing'
  | 'wing' | 'hackle' | 'head' | 'tag' | 'hotspot' | 'eye'
  | 'collar' | 'thorax' | 'abdomen' | 'shellback' | 'legs'
  | 'antennae' | 'post';

export interface TyingMaterial {
  id: string;
  slug: string;
  name: string;
  brand?: string;
  category: MaterialCategory;
  subcategory?: string;
  sizes?: string[];
  colors?: string[];
  material_type?: string;
  weight?: string;
  finish?: string;
  description?: string;
  image_url?: string;
  vendor_url?: string;
  is_verified: boolean;
  submitted_by?: string;
  popularity: number;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  id: string;
  fly_pattern_id?: string;
  canonical_fly_id?: string;
  material_id?: string;
  material_name?: string; // free text fallback
  step_position: number;
  role: RecipeRole;
  quantity?: string;
  notes?: string;
  color_choice?: string;
  size_choice?: string;
  is_optional: boolean;
  substitute_ids?: string[];
  created_at: string;
  // Joined
  material?: TyingMaterial;
}

export interface UserMaterialInventory {
  id: string;
  user_id: string;
  material_id: string;
  color_owned?: string;
  size_owned?: string;
  quantity?: string;
  notes?: string;
  added_at: string;
  // Joined
  material?: TyingMaterial;
}
