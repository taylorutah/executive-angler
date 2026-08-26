/** Opt-in discriminator on user_favorites. Hearts stay entity_type = "river". */
export const RIVER_ALERT_ENTITY = "river_alert";

export const ALERT_TYPE = "conditions";

export const KINDS = [
  "flow_move",
  "blown_fishable",
  "state_change",
  "personal_band",
  "gauge_quiet",
] as const;

export type AlertKind = (typeof KINDS)[number];

export const MOVE_FRACTION = 0.25;
export const PERSONAL_BAND_MIN_SESSIONS = 3;
export const PER_RIVER_HOURS = 24;
export const PER_USER_DAILY_CAP = 3;
