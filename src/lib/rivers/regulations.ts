/** Agency link + retrieved-on date. Static catalog copy is not a live regs API. */

export const REGULATIONS_RETRIEVED_ON = "2026-08-31";

const PARK_RIVER_SLUGS = new Set([
  "firehole-river",
  "gibbon-river",
  "lamar-river",
  "slough-creek",
]);

export type RegulationSource = {
  label: string;
  url: string;
  retrievedOn: string;
};

export function regulationSource(opts: {
  riverSlug?: string;
  destinationSlug?: string;
  destinationState?: string;
  destinationCountry?: string;
}): RegulationSource {
  if (opts.riverSlug && PARK_RIVER_SLUGS.has(opts.riverSlug)) {
    return {
      label: "Yellowstone National Park fishing regulations",
      url: "https://www.nps.gov/yell/planyourvisit/fishing.htm",
      retrievedOn: REGULATIONS_RETRIEVED_ON,
    };
  }

  const state = (opts.destinationState ?? "").toLowerCase();
  const dest = (opts.destinationSlug ?? "").toLowerCase();
  const country = (opts.destinationCountry ?? "").toLowerCase();

  if (state.includes("montana") || dest === "montana") {
    return {
      label: "Montana Fish, Wildlife & Parks",
      url: "https://fwp.mt.gov/fish",
      retrievedOn: REGULATIONS_RETRIEVED_ON,
    };
  }
  if (state.includes("wyoming") || dest === "wyoming") {
    return {
      label: "Wyoming Game and Fish",
      url: "https://wgfd.wyo.gov",
      retrievedOn: REGULATIONS_RETRIEVED_ON,
    };
  }
  if (state.includes("idaho") || dest === "idaho") {
    return {
      label: "Idaho Fish and Game",
      url: "https://idfg.idaho.gov",
      retrievedOn: REGULATIONS_RETRIEVED_ON,
    };
  }
  if (state.includes("utah") || dest === "utah") {
    return {
      label: "Utah Division of Wildlife Resources",
      url: "https://wildlife.utah.gov",
      retrievedOn: REGULATIONS_RETRIEVED_ON,
    };
  }
  if (state.includes("colorado") || dest === "colorado") {
    return {
      label: "Colorado Parks and Wildlife",
      url: "https://cpw.state.co.us",
      retrievedOn: REGULATIONS_RETRIEVED_ON,
    };
  }
  if (country && !country.includes("united states")) {
    return {
      label: "Verify with the local licensing agency",
      url: "https://www.executiveangler.com/about",
      retrievedOn: REGULATIONS_RETRIEVED_ON,
    };
  }
  return {
    label: "Verify with the local fish and wildlife agency",
    url: "https://www.fws.gov/program/national-fish-habitat-partnership",
    retrievedOn: REGULATIONS_RETRIEVED_ON,
  };
}
