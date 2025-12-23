/**
 * Geolocation Service
 * Handles device location and distance calculations
 */

import { Geolocation, Position } from '@capacitor/geolocation';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationResult {
  coordinates: Coordinates;
  accuracy: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

/**
 * Check if location permissions are granted
 */
export const checkLocationPermissions = async (): Promise<boolean> => {
  try {
    const result = await Geolocation.checkPermissions();
    return result.location === 'granted' || result.coarseLocation === 'granted';
  } catch (error) {
    console.error('Failed to check location permissions:', error);
    return false;
  }
};

/**
 * Request location permissions
 */
export const requestLocationPermissions = async (): Promise<boolean> => {
  try {
    const result = await Geolocation.requestPermissions();
    return result.location === 'granted' || result.coarseLocation === 'granted';
  } catch (error) {
    console.error('Failed to request location permissions:', error);
    return false;
  }
};

/**
 * Get current position
 */
export const getCurrentPosition = async (): Promise<LocationResult> => {
  try {
    const position: Position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });

    return {
      coordinates: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude || undefined,
      speed: position.coords.speed || undefined,
      heading: position.coords.heading || undefined,
      timestamp: position.timestamp,
    };
  } catch (error) {
    console.error('Failed to get current position:', error);
    throw error;
  }
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export const calculateDistance = (
  coord1: Coordinates,
  coord2: Coordinates
): number => {
  const R = 6371; // Earth's radius in km
  
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);
  
  const lat1 = toRad(coord1.latitude);
  const lat2 = toRad(coord2.latitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

/**
 * Convert degrees to radians
 */
const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Format distance for display
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`;
  } else {
    return `${Math.round(distanceKm)} km`;
  }
};

/**
 * Watch position changes
 */
export const watchPosition = (
  callback: (location: LocationResult) => void,
  errorCallback?: (error: any) => void
): Promise<string> => {
  return Geolocation.watchPosition(
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    },
    (position, error) => {
      if (error) {
        console.error('Watch position error:', error);
        if (errorCallback) {
          errorCallback(error);
        }
        return;
      }

      if (position) {
        callback({
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined,
          timestamp: position.timestamp,
        });
      }
    }
  );
};

/**
 * Clear position watch
 */
export const clearWatch = async (watchId: string): Promise<void> => {
  try {
    await Geolocation.clearWatch({ id: watchId });
  } catch (error) {
    console.error('Failed to clear watch:', error);
  }
};

/**
 * Get coordinates from address (requires geocoding service)
 * This is a placeholder - you would need to integrate with a geocoding API
 */
export const geocodeAddress = async (): Promise<Coordinates | null> => {
  // TODO: Integrate with geocoding service (Google Maps, Mapbox, etc.)
  console.warn('Geocoding not implemented yet');
  return null;
};

/**
 * Sort items by distance from current location
 */
export const sortByDistance = <T extends { location?: Coordinates }>(
  items: T[],
  userLocation: Coordinates
): (T & { distance: number })[] => {
  return items
    .filter((item) => item.location)
    .map((item) => ({
      ...item,
      distance: calculateDistance(userLocation, item.location!),
    }))
    .sort((a, b) => a.distance - b.distance);
};
