/**
 * Fly model — single source of truth for the canonical-with-options + per-user
 * configurations architecture introduced 2026-05-15.
 *
 * Three concepts, three tables:
 *   Fly                  — a row in `flies`. Library encyclopedia, one URL
 *                          per fly. Options envelope describes what's standard.
 *   FlyConfiguration     — a row in `user_fly_configurations`. The user's
 *                          version of a fly (size + slot overrides). Holds
 *                          inventory, favorite, tie-next state.
 *   FlyBoxEntryV3        — a row in `fly_box_entries_v3`. Configurations in
 *                          named boxes.
 *
 * UI never says "configuration" — call them "versions" in copy.
 *
 * Replaces Pattern / Variant / VariantStock / VariantInBox from fly-v2.ts.
 * fly-v2.ts is preserved during the transition because Workbench, Tie-Next,
 * and catch logging still read from the old tables — Commit 3 of the
 * fly-reset plan migrates those surfaces.
 */
import type { FlyBoxV2 } from "./fly-v2";
export type { FlyBoxV2 } from "./fly-v2";

export type FlyStatus = "approved" | "pending" | "rejected" | "private";
export type TieNextStatus = "none" | "wanted" | "at_vise" | "done";
export type FlyCategory =
  | "nymph" | "dry" | "streamer" | "emerger" | "wet"
  | "terrestrial" | "egg" | "midge" | "other";

/** A single slot in a fly's recipe. Slot vocabulary is fixed; the `material`
 *  field is a free-form display string so flies can use whatever
 *  brand/model/size combination is right. */
export interface MaterialSlot {
  slot: "bead" | "hook" | "thread" | "body" | "rib" | "tail"
      | "wing" | "thorax" | "collar" | "hackle" | "head" | "other" | string;
  material: string;
  description?: string;
  brand?: string;
  is_optional?: boolean;
}

/** Recommended options for a fly — informational, never enforced.
 *  UI uses these as autocomplete suggestions; free text always accepted. */
export interface OptionEnvelope {
  sizes?: number[];                 // [12, 14, 16, 18, 20]
  bead?: {
    sizes_mm?: number[];            // [2.5, 3.0, 3.3, 3.8]
    colors?: string[];              // ["copper","silver","gold","black"]
    materials?: string[];           // ["tungsten","brass"]
  };
  colors?: {
    body?: string[];
    rib?: string[];
    tail?: string[];
    wing?: string[];
    thorax?: string[];
    collar?: string[];
  };
}

/** A fly. One row per fly in the `flies` table. */
export interface Fly {
  id: string;
  slug: string;
  name: string;
  category: FlyCategory | string | null;

  description: string | null;
  history: string | null;
  tying_overview: string | null;
  fishing_tips: string | null;
  recipe_notes: string | null;

  hero_image_url: string | null;
  gallery_image_urls: string[];
  video_url: string | null;

  materials_list: MaterialSlot[];
  option_envelope: OptionEnvelope;

  status: FlyStatus;
  submitted_by_user_id: string | null;
  approved_by_user_id: string | null;
  approved_at: string | null;
  reject_reason: string | null;

  inspired_by_fly_id: string | null;
  origin_credit: string | null;

  imitates: string[];
  effective_species_ids: string[];
  water_types: string[];

  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

/** Per-slot override on a configuration. Missing slots inherit the fly's
 *  materials_list default. Each value is a free-form object so a user can
 *  capture the brand/model they actually tie with. */
export type SlotOverride = {
  size_mm?: number;
  color?: string;
  material?: string;
  brand?: string;
  model?: string;
  style?: string;
  [k: string]: unknown;
};

export interface SlotOverrides {
  bead?: SlotOverride;
  hook?: SlotOverride;
  thread?: SlotOverride;
  body?: SlotOverride;
  rib?: SlotOverride;
  tail?: SlotOverride;
  wing?: SlotOverride;
  thorax?: SlotOverride;
  collar?: SlotOverride;
  [k: string]: SlotOverride | undefined;
}

/** A user's saved version of a fly. */
export interface FlyConfiguration {
  id: string;
  user_id: string;
  fly_id: string;
  nickname: string | null;
  size: string | null;
  slot_overrides: SlotOverrides;

  tied_count: number;
  bought_count: number;
  target_count: number;

  is_favorite: boolean;
  is_tie_next: boolean;
  tie_next_status: TieNextStatus | null;
  tie_next_target_qty: number | null;
  tie_next_notes: string | null;
  tie_next_order: number | null;

  last_used_at: string | null;
  times_used: number;
  last_loss_at: string | null;

  personal_notes: string | null;
  created_at: string;
  updated_at: string;
}

/** A configuration paired with the boxes it's currently in. */
export interface FlyConfigurationWithBoxes extends FlyConfiguration {
  in_boxes: { box_id: string; box_name: string; sort_order: number }[];
}

/** Box membership row. */
export interface FlyBoxEntryV3 {
  id: string;
  box_id: string;
  configuration_id: string;
  user_id: string;
  sort_order: number;
  added_at: string;
}

/** Input for creating/editing a configuration. */
export interface FlyConfigurationInput {
  fly_id: string;
  nickname?: string | null;
  size?: string | null;
  slot_overrides?: SlotOverrides;
  tied_count?: number;
  bought_count?: number;
  target_count?: number;
  is_favorite?: boolean;
  is_tie_next?: boolean;
  tie_next_status?: TieNextStatus;
  tie_next_target_qty?: number | null;
  tie_next_notes?: string | null;
  personal_notes?: string | null;
}

/** Useful re-export. */
export type { FlyBoxV2 as FlyBox };
