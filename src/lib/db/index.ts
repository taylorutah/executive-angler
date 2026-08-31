export {
  getAllDestinations,
  getPublicDestinations,
  isCatalogDestination,
  getDestinationBySlug,
  getFeaturedDestinations,
  getDestinationById,
  getDestinationsByIds,
} from "./destinations";

export {
  getAllRivers,
  getPublicRivers,
  isCatalogRiver,
  getRiverBySlug,
  getFeaturedRivers,
  getRiversByDestination,
  getRiversByIds,
} from "./rivers";

export {
  getAllSpecies,
  getSpeciesBySlug,
  getFeaturedSpecies,
  getSpeciesByCommonNames,
} from "./species";

export {
  getAllLodges,
  getLodgeBySlug,
  getFeaturedLodges,
  getLodgesByDestination,
  getLodgesByRiver,
} from "./lodges";

export {
  getAllGuides,
  getGuideBySlug,
  getGuidesByDestination,
  getGuidesByRiver,
} from "./guides";

export {
  getAllFlyShops,
  getFlyShopBySlug,
  getFlyShopsByDestination,
} from "./fly-shops";

export {
  getAllArticles,
  getArticleBySlug,
  getFeaturedArticles,
  getArticlesByDestination,
  getArticlesByRiver,
} from "./articles";

export {
  getAllCanonicalFlies,
  getCanonicalFlyBySlug,
  getFeaturedFlies,
  getFliesByCategory,
  getFliesForRiver,
  getFliesForDestination,
  getFliesForFlyShop,
  getFliesByImitates,
  getFliesByEffectiveSpecies,
} from "./flies";

export { getApprovedPhotosByEntity } from "./photos";
export type { ApprovedPhoto } from "./photos";
export { getPublishedMediaAsset } from "./media-assets";
export type { PublishedMediaAsset } from "./media-assets";

export {
  getAllGearBrands,
  getGearBrandBySlug,
  getFeaturedGearBrands,
  getGearBrandById,
} from "./gear-brands";

export {
  getAllGearProducts,
  getGearProductBySlug,
  getGearProductsByBrand,
  getGearProductsByCategory,
  getFeaturedGearProducts,
  getGearProductById,
} from "./gear-products";
