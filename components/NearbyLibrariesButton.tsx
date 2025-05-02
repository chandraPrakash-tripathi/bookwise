"use client";
import { useState } from "react";
import { Button } from "./ui/button";

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

const NearbyLibrariesButton = () => {
  const [libraries, setLibraries] = useState<Library[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

        try {
          const response = await fetch(`http://localhost:3000/api/libraries/nearby?lat=${latitude}&lng=${longitude}&distance=5000`);
          const data = await response.json();

          if (!response.ok) throw new Error(data.error || "Unknown error");
          setLibraries(data);
        } catch (err: unknown) {
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

  return (
    <div className="relative">
      <Button onClick={fetchNearbyLibraries} disabled={loading}>
        {loading ? "Searching..." : "Nearby Libraries"}
      </Button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {libraries && (
        <ul className="mt-4 space-y-2 bg-black p-4 rounded shadow-md max-h-60 overflow-y-auto">
          {libraries.map((lib) => (
            <li key={lib.id}>
              <strong>{lib.name}</strong> — {lib.city}, {lib.state} ({lib.distanceFormatted})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NearbyLibrariesButton;
