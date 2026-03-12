export type GearType = 'rod' | 'reel' | 'line' | 'leader' | 'tippet' | 'net' | 'waders' | 'other';

// Specs per gear type (stored in JSONB)
export interface RodSpecs {
  length_ft?: number;
  weight_wt?: number;   // line weight e.g. 3, 5, 7
  action?: 'extra-fast' | 'fast' | 'medium-fast' | 'medium';
  pieces?: number;
}

export interface ReelSpecs {
  size?: string;         // e.g. "3-5"
  drag?: 'click-pawl' | 'disc';
}

export interface LineSpecs {
  weight?: number;
  taper?: 'WF' | 'DT' | 'SH' | 'running';
  density?: 'floating' | 'intermediate' | 'sinking' | 'sink-tip';
}

export interface LeaderSpecs {
  length_ft?: number;
  tippet_x?: string;     // e.g. "5X"
  style?: 'knotless' | 'knotted' | 'furled' | 'euro';
  // Euro leader sections
  sections?: EuroLeaderSection[];
}

export interface EuroLeaderSection {
  material: 'mono' | 'fluoro' | 'bicolor-mono' | 'coated';
  color?: string;         // e.g. "hot pink", "yellow", "clear"
  role: 'butt' | 'sighter' | 'tippet-ring-section' | 'tippet';
  length_ft: number;
  diameter_mm?: number;
  x_size?: string;        // e.g. "3X"
}

export interface TippetSpecs {
  material?: 'fluorocarbon' | 'nylon' | 'bicolor';
  x_size?: string;        // e.g. "5X"
  diameter_mm?: number;
  lb_test?: number;
}

export type GearSpecs = RodSpecs | ReelSpecs | LineSpecs | LeaderSpecs | TippetSpecs | Record<string, unknown>;

export interface GearItem {
  id: string;
  user_id: string;
  type: GearType;
  name: string;          // user-defined short name e.g. "Sage R8 5wt 9ft"
  maker?: string;        // e.g. "Sage", "Orvis", "Rio"
  model?: string;        // e.g. "R8", "Helios 3D"
  specs: GearSpecs;
  is_default: boolean;   // auto-attach to new sessions
  is_active: boolean;    // soft delete
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GearDefaults {
  rod?: string;     // gear item id
  reel?: string;
  line?: string;
  leader?: string;
  tippet?: string;
}

export interface SessionGear {
  rod?: GearItem;
  reel?: GearItem;
  line?: GearItem;
  leader?: GearItem;
  tippet?: GearItem;
}
