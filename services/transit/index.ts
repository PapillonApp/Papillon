import { Suggestions } from "@/services/transit/models/Suggestions";

import { BGTFS_PLAN, TRIP_SUGGESTION } from "./fetcher/endpoints";
import {Fetcher} from "./fetcher/Fetcher";
import {PlanResult} from "./models/PlanResult";

class Transit {
  private fetcher: Fetcher = new Fetcher();

  public async plan(
    fromLat: number,
    fromLon: number,
    toLat: number,
    toLon: number,
    options: { mode?: string; considerDowntimes?: boolean; locale?: string }
  ): Promise<{ results: PlanResult[] }> {
    const params = {
      fromLat,
      fromLon,
      toLat,
      toLon,
      mode: options.mode ?? "transit",
      considerDowntimes: options.considerDowntimes ?? true,
      locale: options.locale ?? "fr",
    };
    return await this.fetcher.get(
      BGTFS_PLAN(
        params.fromLat,
        params.fromLon,
        params.toLat,
        params.toLon,
        params.mode,
        params.considerDowntimes,
        params.locale
      )
    );
  }

  public async suggestions(
    latitude: number,
    longitude: number,
    query: string,
  ): Promise<{ suggestions: Suggestions }> {
    return await this.fetcher.get(TRIP_SUGGESTION(latitude, longitude, query), {
      headers: {
        Referer: 'https://transitapp.com/trip',
      },
    });
  }
}

export default Transit;