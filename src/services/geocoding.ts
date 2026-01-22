export async function fetchAddressByCoords(lat: number, lng: number) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'VizinhancaSeguraApp/1.0' // Good practice for Nominatim
                }
            }
        );

        if (!response.ok) throw new Error('Erro na geocodificação');

        const data = await response.json();
        const address = data.address;

        return {
            neighborhood: address.suburb || address.neighbourhood || address.residential || 'Bairro Desconhecido',
            city: address.city || address.town || address.village || address.municipality,
            state: address.state,
            street: address.road || address.pedestrian
        };
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        throw error;
    }
}
