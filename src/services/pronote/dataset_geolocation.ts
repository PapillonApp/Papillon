import pronote from "pawnote";
import datasets from "../../consts/datasets.json";

const getInstancesFromDataset = async (longitude: number, latitude: number): Promise<pronote.GeolocatedInstance[]> => {
  let adress_api_fetch = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lon=${longitude}&lat=${latitude}&limit=1`);
  try {
    let adress_api = await adress_api_fetch.json();
    if (adress_api.features.length === 0) {
      return [];
    }
    let postcode = adress_api.features[0].properties.postcode;
    postcode = postcode[0] + postcode[1] + "000";

    let instances_fetch = await fetch(datasets.establishment.replace("[postcode]", postcode));

    try {
      let instances = await instances_fetch.json();
      console.log("Fetched instances:", instances);

      const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const toRadians = (degrees: number) => degrees * (Math.PI / 180);
        const R = 6371; // Earth's radius in kilometers

        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
      };

      return instances.map((instance: any) => {
        const distance = calculateHaversineDistance(
          latitude,
          longitude,
          instance.lat,
          instance.long
        );

        console.log("User location:", { latitude, longitude });
        console.log("Instance location:", { latitude: instance.lat, longitude: instance.long });
        console.log("Calculated distance:", distance);

        return {
          name: instance.name.toUpperCase(),
          url: instance.url,
          distance,
          longitude: instance.long,
          latitude: instance.lat,
        };
      });
    } catch (error) {
      console.error("Error fetching instances:", error);
      return [];
    }
  } catch (error) {
    console.error("Error fetching address:", error);
    return [];
  }
};

export default getInstancesFromDataset;