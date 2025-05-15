'use client';

import { GoogleMap, useJsApiLoader, DirectionsRenderer, DirectionsService } from '@react-google-maps/api';
import { useState, useCallback } from 'react';

interface Props {
  latitude: string;
  longitude: string;
  origin?: string;
}

const containerStyle = {
  width: '100%',
  height: '500px',
};

const MapWithDirections = ({ latitude, longitude, origin = 'Majestic, Bangalore' }: Props) => {
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  
  // Convert string props to numbers for the center
  const center = {
    lat: parseFloat(latitude),
    lng: parseFloat(longitude),
  };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ['places'],
  });

  const directionsCallback = useCallback(
    (result: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
      if (status === 'OK' && result) {
        setDirectionsResponse(result);
      } else {
        console.error('Directions request failed due to ', status);
      }
    },
    []
  );

  // Create destination from lat/long
  const destination = `${latitude},${longitude}`;

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
      {!directionsResponse && (
        <DirectionsService
          options={{
            destination,
            origin,
            travelMode: google.maps.TravelMode.DRIVING,
          }}
          callback={directionsCallback}
        />
      )}

      {directionsResponse && <DirectionsRenderer directions={directionsResponse} />}
    </GoogleMap>
  );
};

export default MapWithDirections;