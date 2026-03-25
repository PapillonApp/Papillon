import { geolocation } from "pawnote";
import { School as SkolengoSkool,SearchSchools } from "skolengojs";

import { Services } from "@/stores/account/types";
import { useAlert } from "@/ui/components/AlertProvider";
import { GeographicQuerying, GeographicReverse } from "@/utils/native/georeverse";
import { calculateDistanceBetweenPositions, getCurrentPosition } from "@/utils/native/position";

export interface School {
  name: string,
  distance: number,
  url: string,
  ref?: SkolengoSkool
}

export async function fetchSchools(service: Services, alert: ReturnType<typeof useAlert>, city?: string): Promise<School[]> {
  let pos = null;
  if (!city) {
    pos = await getCurrentPosition();

    if (pos === null) {
      alert.showAlert({
        title: "Impossible de récuperer la position",
        description: "Nous n'avons pas pu récupérer ta position. Vérifie que le mode avion est désactivé et que l'application dispose des autorisations nécessaires.",
        icon: "TriangleAlert",
        color: "#D60046",
        withoutNavbar: true,
      });
    }
  }

  if (city && service !== Services.SKOLENGO) {
    pos = await GeographicQuerying(city);
  }

  if (service === Services.PRONOTE) {
    const schools = await geolocation({ latitude: pos?.latitude ?? 0, longitude: pos?.longitude ?? 0 });
    return schools.map(item => ({
      name: item.name,
      distance: item.distance / 10,
      url: item.url,
    }));
  }

  if (service === Services.SKOLENGO) {
    let cityName: string | undefined;

    if (city) {
      cityName = city;
    }
    else if (pos?.latitude && pos?.longitude) {
      cityName = (await GeographicReverse(pos.latitude, pos.longitude)).city;
    }
    else {
      return [];
    }

    const schools = await SearchSchools(cityName, 50);
    const list: School[] = [];

    for (const school of schools) {
      let distance = 0;

      if (pos?.latitude && pos?.longitude) {
        if (school.location.addressLine?.trim() && school.location.city?.trim() && school.location.zipCode?.trim()) {
          const position = await GeographicQuerying(
            `${school.location.addressLine} ${school.location.city} ${school.location.zipCode}`
          );
          distance = calculateDistanceBetweenPositions(
            pos.latitude,
            pos.longitude,
            position.longitude,
            position.latitude
          );
        }
      }

      list.push({
        name: school.name,
        distance: distance / 1000,
        url: "",
        ref: school,
      });
    }

    return list;
  }


  return [];
}

type SchoolItem = {
  title: string,
  description: string,
  initials: string,
  distance: number,
  onPress: () => void
}
