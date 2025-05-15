"use client";
import { useState } from "react";
import { MapPin, X, Navigation, Library } from "lucide-react";
import { Button } from "./ui/button";
import MapWithDirections from "./MapWithDirections";

type Library = {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  distance: number;
  distanceFormatted: string;
};

export default function NearbyLibrariesDialog() {
  const [libraries, setLibraries] = useState<Library[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState<{latitude: string, longitude: string} | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchNearbyLibraries = () => {
    setLoading(true);
    setError("");

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Store user's location for map
        setUserLocation({
          latitude: latitude.toString(),
          longitude: longitude.toString()
        });

        try {
          const response = await fetch(`http://localhost:3000/api/libraries/nearby?lat=${latitude}&lng=${longitude}&distance=5000`);
          const data = await response.json();

          if (!response.ok) throw new Error(data.error || "Unknown error");
          setLibraries(data);
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("An unknown error occurred.");
          }
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Unable to retrieve your location.");
        setLoading(false);
      }
    );
  };

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    if (!libraries) {
      fetchNearbyLibraries();
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleSelectLibrary = (library: Library) => {
    // Implement navigation or selection logic here
    console.log("Selected library:", library);
  };

  return (
    <div className="relative">
      {/* Map Icon Button */}
      <Button 
        onClick={handleOpenDialog}
        variant="outline" 
        size="icon"
        className="rounded-full bg-white hover:bg-gray-100 border border-gray-200 shadow-md"
      >
        <MapPin className="h-5 w-5 text-blue-600" />
      </Button>

      {/* Dialog Overlay */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          {/* Dialog Content */}
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto overflow-hidden">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <Library className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-lg">Nearby Libraries</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={handleCloseDialog} className="rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Dialog Body */}
            <div className="p-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  <p>{error}</p>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Finding libraries near you...</p>
                </div>
              )}

              {/* Map Display */}
              {userLocation && !loading && (
                <div className="mb-4 rounded-lg overflow-hidden border border-gray-200 h-64">
                  <MapWithDirections 
                    latitude={userLocation.latitude} 
                    longitude={userLocation.longitude} 
                  />
                </div>
              )}

              {/* Libraries List */}
              {libraries && !loading && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">
                    {libraries.length} {libraries.length === 1 ? 'Library' : 'Libraries'} Found
                  </h4>
                  
                  <ul className="space-y-2 max-h-64 overflow-y-auto">
                    {libraries.map((lib) => (
                      <li 
                        key={lib.id}
                        className="bg-gray-50 hover:bg-gray-100 rounded-lg p-3 cursor-pointer transition"
                        onClick={() => handleSelectLibrary(lib)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-blue-700">{lib.name}</p>
                            <p className="text-sm text-gray-600">{lib.city}, {lib.state}</p>
                          </div>
                          <div className="flex items-center text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            <Navigation className="h-3 w-3 mr-1" />
                            {lib.distanceFormatted}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Dialog Footer */}
            <div className="bg-gray-50 px-4 py-3 flex justify-between border-t">
              <Button variant="outline" className="text-black" onClick={handleCloseDialog}>
                Close
              </Button>
              
              {!loading && (
                <Button 
                  onClick={fetchNearbyLibraries}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Refresh Results
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}