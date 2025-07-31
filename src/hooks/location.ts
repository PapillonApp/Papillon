import { LocationPermission, getLocationPermission, requestLocationPermission } from "@/utils/native/location";
import { useEffect, useState } from "react";

export const useLocationPermission = () => {
  const [permission, setPermission] = useState<LocationPermission | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const permission = await getLocationPermission();
    setPermission(permission);
    setLoading(false);
  };

  useEffect(() => {
    void fetch();
  }, []);

  const refetch = async () => {
    setLoading(true);
    await fetch();
  };

  /**
   * Request location permission to user.
   */
  const request = async () => {
    setLoading(true);

    const permission = await requestLocationPermission();
    setPermission(permission);

    setLoading(false);
  };

  return [permission, { loading, refetch, request }] as const;
};
