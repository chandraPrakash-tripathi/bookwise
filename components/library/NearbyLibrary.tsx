'use client';

import { findNearbyLibraries } from '@/lib/library/actions/library';
import { useState, useEffect } from 'react';

type Library = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  distance: number;
  distanceFormatted: string;
};

export default function NearbyLibrariesComponent() {
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(5000); // Default 5km radius
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Function to get user's current location
  const getUserLocation = () => {
    setLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        fetchNearbyLibraries(latitude, longitude, radius);
      },
      (error) => {
        setError(`Unable to retrieve your location: ${error.message}`);
        setLoading(false);
      }
    );
  };

  // Function to fetch nearby libraries using the server action
  const fetchNearbyLibraries = async (latitude: number, longitude: number, distance: number) => {
    try {
      setLoading(true);
      const result = await findNearbyLibraries(latitude, longitude, distance);
      
      if (result.success && result.libraries) {
        // Format distances for display
        const formattedLibraries = result.libraries.map(lib => ({
          ...lib,
          distanceFormatted: formatDistance(lib.distance)
        }));
        
        setLibraries(formattedLibraries);
      } else {
        setError(result.error || 'Failed to fetch libraries');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format distance in a user-friendly way
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      return `${(meters / 1000).toFixed(1)} km`;
    }
  };

  // Update libraries when radius changes and user location is available
  useEffect(() => {
    if (userLocation) {
      fetchNearbyLibraries(userLocation.lat, userLocation.lng, radius);
    }
  }, [radius]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Find Nearby Libraries</h1>
      
      <div className="mb-6">
        <button 
          onClick={getUserLocation}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          disabled={loading}
        >
          {loading ? 'Finding Libraries...' : 'Find Nearby Libraries'}
        </button>
        
        <div className="mt-4">
          <label className="block text-sm font-medium mb-2">
            Search Radius: {radius / 1000} km
          </label>
          <input
            type="range"
            min="1000"
            max="50000"
            step="1000"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="w-full"
            disabled={loading || !userLocation}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {userLocation && (
        <div className="mb-4 text-sm">
          Your location: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
        </div>
      )}

      {libraries.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {libraries.map((library) => (
            <div key={library.id} className="border rounded-lg p-4 shadow-sm">
              <h2 className="font-bold text-lg">{library.name}</h2>
              <p className="text-gray-600">{library.address}</p>
              <p className="text-gray-600">{library.city}, {library.state}</p>
              <p className="mt-2 text-blue-600 font-medium">
                Distance: {library.distanceFormatted}
              </p>
            </div>
          ))}
        </div>
      ) : (
        !loading && userLocation && (
          <p className="text-gray-600">No libraries found within {radius / 1000} km of your location.</p>
        )
      )}
    </div>
  );
}