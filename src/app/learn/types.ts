export type LearnFly = {
  id: string;
  slug: string;
  name: string;
  category: string;
  heroImageUrl?: string;
  sizes: string[];
  imitates: string[];
  job: string;
};

export type LearnRiver = {
  id: string;
  slug: string;
  name: string;
  place: string;
  flowType: string;
  wadingType: string;
  species: string[];
  excerpt: string;
  latitude: number;
  longitude: number;
  /** Primary USGS site when the river has a gauge — used to pin My Rivers. */
  usgsSiteId: string | null;
};
