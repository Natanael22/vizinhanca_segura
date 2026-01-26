import { useLocation } from '../context/LocationContext';

export function useUserLocation() {
    const { gpsCoords } = useLocation();

    // If no coordinates yet, we can return the default SP coordinates
    // or null. To keep consistency with previous behavior, let's return default if null.
    return gpsCoords || ([-23.550520, -46.633308] as [number, number]);
}
