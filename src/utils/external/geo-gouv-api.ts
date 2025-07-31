export interface GeographicMunicipality {
  geometry: {
    coordinates: [longitude: number, latitude: number]
  }

  properties: {
    name: string
    /** Score from 0 to 1. */
    score: number
    postcode: string
    citycode: string
    population: number
    context: string
  }
}

/**
 * Get a municipality from a search query using the French government API.
 *
 * @param searchQuery The search query.
 * @param limit The maximum number of results.
 * @see https://adresse.data.gouv.fr/api-doc/adresse
 */
export const getGeographicMunicipalities = async (searchQuery: string, limit = 5): Promise<GeographicMunicipality[]> => {
  const uri = new URL("https://api-adresse.data.gouv.fr/search/?type=municipality");
  uri.searchParams.set("q", searchQuery);
  uri.searchParams.set("limit", limit.toString());

  const response = await fetch(uri.href);
  const data = await response.json() as (
    | { features: GeographicMunicipality[] }
    | { code: number, message: string }
  );

  if ("code" in data) {
    throw new Error(data.message);
  }

  return data.features;
};
