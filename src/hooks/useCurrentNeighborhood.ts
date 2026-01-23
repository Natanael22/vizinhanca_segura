import { useLocation } from '../context/LocationContext';

export function useCurrentNeighborhood() {
    const { profileLocation, gpsLocation, loading } = useLocation();

    return {
        profileNeighborhood: profileLocation?.neighborhood || null,
        gpsNeighborhood: gpsLocation?.neighborhood || null,
        loading
    };
}
