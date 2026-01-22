import { useState, useEffect } from 'react';

export function useUserLocation() {
    const [position, setPosition] = useState<[number, number] | null>(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setPosition([pos.coords.latitude, pos.coords.longitude]);
                },
                (err) => {
                    console.error("Error getting location", err);
                    // Default to Sao Paulo downtown if error
                    setPosition([-23.550520, -46.633308]);
                }
            );
        } else {
            // Default fallback
            setPosition([-23.550520, -46.633308]);
        }
    }, []);

    return position;
}
