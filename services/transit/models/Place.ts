import { Location } from "@/services/transit/models/Location";

export interface Place {
  address_components: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
  adr_address: string;
  formatted_address: string;
  geometry: {
    location: Location;
    viewport: {
      northeast: Location;
      southwest: Location;
    };
  };
  name: string;
  types: string[];
  status: string;
}