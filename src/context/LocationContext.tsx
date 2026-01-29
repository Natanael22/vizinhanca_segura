import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { fetchAddressByCoords } from '../services/geocoding';
import { logError } from '../services/logger';
import { useNotification } from './NotificationContext';
import { translateError } from '../utils/errors';

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
    const { profile } = useAuth();
    const { showNotification } = useNotification();
    const [gpsLocation, setGpsLocation] = useState<LocationInfo | null>(null);
    const [gpsCoords, setGpsCoords] = useState<[number, number] | null>(null);
    const [gpsLoading, setGpsLoading] = useState(false);
    const [initialGpsAttemptDone, setInitialGpsAttemptDone] = useState(false);

    // Derived from global profile - available immediately once AuthContext loads profile
    const profileLocation: LocationInfo | null = profile ? {
        neighborhood: profile.neighborhood || '',
        city: profile.city || ''
    } : null;

    useEffect(() => {
        startGpsTracking();
    }, []);

    const startGpsTracking = () => {
        if (!navigator.geolocation) {
            setInitialGpsAttemptDone(true);
            return;
        }

        // Check for secure context (HTTPS)
        if (!window.isSecureContext) {
            const { title, message } = translateError('Only secure origins are allowed');
            showNotification({ title, message, type: 'warning' });
            setInitialGpsAttemptDone(true);
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
                    //console.error('GPS Geocoding error:', error);
                    await logError({
                        message: error.message,
                        context: 'LocationContext.startGpsTracking.geocoding',
                        metadata: { latitude: position.coords.latitude, longitude: position.coords.longitude }
                    });
                } finally {
                    setGpsLoading(false);
                    setInitialGpsAttemptDone(true);
                }
            },
            (error) => {
                //console.error('GPS Tracking error:', error);

                // User-friendly notification
                let errorType = 'User denied Geolocation';
                if (error.code === error.TIMEOUT) errorType = 'Position acquisition timed out';

                const { title, message } = translateError(errorType);
                showNotification({ title, message, type: 'error' });

                logError({
                    message: error.message,
                    context: 'LocationContext.startGpsTracking.navigator',
                    metadata: { code: error.code }
                });
                setGpsLoading(false);
                setInitialGpsAttemptDone(true);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <LocationContext.Provider value={{
            profileLocation,
            gpsLocation,
            gpsCoords,
            loading: gpsLoading && !initialGpsAttemptDone, // Loading only during the first GPS lock
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
