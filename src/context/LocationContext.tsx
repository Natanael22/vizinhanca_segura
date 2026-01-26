import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { fetchAddressByCoords } from '../services/geocoding';
import { logError } from '../services/logger';

interface LocationInfo {
    neighborhood: string;
    city: string;
}

interface LocationContextType {
    profileLocation: LocationInfo | null;
    gpsLocation: LocationInfo | null;
    gpsCoords: [number, number] | null;
    loading: boolean;
    gpsLoading: boolean;
    refreshGps: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [profileLocation, setProfileLocation] = useState<LocationInfo | null>(null);
    const [gpsLocation, setGpsLocation] = useState<LocationInfo | null>(null);
    const [gpsCoords, setGpsCoords] = useState<[number, number] | null>(null);
    const [loading, setLoading] = useState(true);
    const [gpsLoading, setGpsLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchProfileLocation();
        } else {
            setProfileLocation(null);
        }
    }, [user]);

    useEffect(() => {
        startGpsTracking();
    }, []);

    const fetchProfileLocation = async () => {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('neighborhood, city')
                .eq('id', user?.id)
                .single();
            if (data) {
                setProfileLocation({
                    neighborhood: data.neighborhood || '',
                    city: data.city || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile location:', error);
        } finally {
            setLoading(false);
        }
    };

    const startGpsTracking = () => {
        if (!navigator.geolocation) {
            setLoading(false);
            return;
        }

        setGpsLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    setGpsCoords([latitude, longitude]);
                    const address = await fetchAddressByCoords(latitude, longitude);
                    setGpsLocation({
                        neighborhood: address.neighborhood,
                        city: address.city
                    });
                } catch (error: any) {
                    console.error('GPS Geocoding error:', error);
                    await logError({
                        message: error.message,
                        context: 'LocationContext.startGpsTracking.geocoding',
                        metadata: { latitude: position.coords.latitude, longitude: position.coords.longitude }
                    });
                } finally {
                    setGpsLoading(false);
                    setLoading(false);
                }
            },
            (error) => {
                console.error('GPS Tracking error:', error);
                logError({
                    message: error.message,
                    context: 'LocationContext.startGpsTracking.navigator',
                    metadata: { code: error.code }
                });
                setGpsLoading(false);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <LocationContext.Provider value={{
            profileLocation,
            gpsLocation,
            gpsCoords,
            loading,
            gpsLoading,
            refreshGps: startGpsTracking
        }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
}
