import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { appFetch } from "@/utils/network/fetch";
import { GeographicSearchCities } from "@/utils/native/georeverse";

jest.mock("@/utils/network/fetch", () => ({ appFetch: jest.fn() }));
jest.mock("@/utils/logger/logger", () => ({ error: jest.fn((message: string) => new Error(message)) }));

const mockedAppFetch = jest.mocked(appFetch);

describe("PRONOTE city search mapping", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("preserves a city name returned as a string and maps its location", async () => {
    mockedAppFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        features: [{
          properties: {
            banId: "75056_paris",
            city: "Paris",
            citycode: "75056",
            context: "75, Paris, Île-de-France",
            score: 0.98,
            postcode: "75001",
          },
          geometry: { coordinates: [2.3522, 48.8566] },
        }],
      }),
    } as Response);

    const result = await GeographicSearchCities("Paris");

    expect(result).toEqual([expect.objectContaining({
      id: "75056_paris",
      city: "Paris",
      citycode: "75056",
      postalCode: 75001,
      longitude: 2.3522,
      latitude: 48.8566,
    })]);
  });

  it("returns an empty list when the geocoding response has no features", async () => {
    mockedAppFetch.mockResolvedValue({ ok: true, json: async () => ({ features: null }) } as Response);

    await expect(GeographicSearchCities("Paris")).resolves.toEqual([]);
  });
});
