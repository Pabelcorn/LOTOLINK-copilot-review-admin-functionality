/**
 * Sucursal Context
 * Provides sucursal selection state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Preferences } from '@capacitor/preferences';
import { getNearbyBancas, Banca } from '../services/bancas.service';
import { getCurrentPosition } from '../services/geolocation.service';

// Configuration constants
const DEFAULT_LOCATION = { latitude: 18.4861, longitude: -69.9312 }; // Santo Domingo
const DEFAULT_SEARCH_RADIUS_KM = 25;

interface Sucursal {
  id: string;
  bancaId: string;
  bancaName: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  city?: string;
  province?: string;
  distance?: number;
}

interface SucursalContextType {
  selectedSucursal: Sucursal | null;
  setSelectedSucursal: (sucursal: Sucursal) => Promise<void>;
  nearbyBancas: Banca[];
  loadNearbyBancas: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const SucursalContext = createContext<SucursalContextType | undefined>(undefined);

const STORAGE_KEY = 'lotolink_selected_sucursal';

interface SucursalProviderProps {
  children: ReactNode;
}

export const SucursalProvider: React.FC<SucursalProviderProps> = ({ children }) => {
  const [selectedSucursal, setSelectedSucursalState] = useState<Sucursal | null>(null);
  const [nearbyBancas, setNearbyBancas] = useState<Banca[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load selected sucursal from storage on mount
  useEffect(() => {
    loadStoredSucursal();
  }, []);

  const loadStoredSucursal = async () => {
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEY });
      if (value) {
        const sucursal = JSON.parse(value);
        setSelectedSucursalState(sucursal);
      }
    } catch (error) {
      console.error('Failed to load stored sucursal:', error);
    }
  };

  const setSelectedSucursal = async (sucursal: Sucursal) => {
    try {
      await Preferences.set({
        key: STORAGE_KEY,
        value: JSON.stringify(sucursal),
      });
      setSelectedSucursalState(sucursal);
    } catch (error) {
      console.error('Failed to save sucursal:', error);
      throw error;
    }
  };

  const loadNearbyBancas = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get user location
      let latitude = DEFAULT_LOCATION.latitude;
      let longitude = DEFAULT_LOCATION.longitude;

      try {
        const position = await getCurrentPosition();
        latitude = position.coordinates.latitude;
        longitude = position.coordinates.longitude;
      } catch (err) {
        console.log('Could not get user location, using default:', err);
      }

      // Fetch nearby bancas
      const response = await getNearbyBancas(latitude, longitude, DEFAULT_SEARCH_RADIUS_KM);
      setNearbyBancas(response.bancas);

      // If no sucursal is selected and we have bancas, auto-select the nearest one
      if (!selectedSucursal && response.bancas.length > 0) {
        const nearestBanca = response.bancas[0];
        const defaultSucursal: Sucursal = {
          id: nearestBanca.id,
          bancaId: nearestBanca.id,
          bancaName: nearestBanca.name,
          name: 'Principal',
          code: '0001',
          address: nearestBanca.address,
          phone: nearestBanca.phone,
          city: nearestBanca.city,
          province: nearestBanca.region,
        };
        await setSelectedSucursal(defaultSucursal);
      }
    } catch (err) {
      console.error('Failed to load nearby bancas:', err);
      setError('No se pudieron cargar las bancas cercanas');
    } finally {
      setIsLoading(false);
    }
  };

  const value: SucursalContextType = {
    selectedSucursal,
    setSelectedSucursal,
    nearbyBancas,
    loadNearbyBancas,
    isLoading,
    error,
  };

  return <SucursalContext.Provider value={value}>{children}</SucursalContext.Provider>;
};

export const useSucursal = (): SucursalContextType => {
  const context = useContext(SucursalContext);
  if (context === undefined) {
    throw new Error('useSucursal must be used within a SucursalProvider');
  }
  return context;
};
