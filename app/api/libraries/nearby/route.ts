// app/api/libraries/nearby/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { libraries } from "@/db/schema";
import { postgis } from "@/db/postgis";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Get query parameters
    const latitude = parseFloat(searchParams.get("lat") || "0");
    const longitude = parseFloat(searchParams.get("lng") || "0");
    const distance = parseInt(searchParams.get("distance") || "5000"); // Default 5km radius
    
    // Validate parameters
    if (isNaN(latitude) || isNaN(longitude) || latitude === 0 || longitude === 0) {
      return NextResponse.json({ error: "Valid latitude and longitude required" }, { status: 400 });
    }
    
    // Create a PostGIS point from the user's coordinates
    const userLocation = postgis.createPoint(longitude, latitude);
    
    // Query nearby libraries
    const nearbyLibraries = await db.select({
      id: libraries.id,
      name: libraries.name,
      address: libraries.address,
      city: libraries.city,
      state: libraries.state,
      latitude: libraries.latitude,
      longitude: libraries.longitude,
      // Calculate distance in meters
      distance: sql<number>`ST_Distance(${libraries.geog_location}, ${userLocation})`.as('distance'),
    })
    .from(libraries)
    .where(sql`ST_DWithin(${libraries.geog_location}, ${userLocation}, ${distance})`)
    .orderBy(sql`ST_Distance(${libraries.geog_location}, ${userLocation})`)
    .limit(10);
    
    // Format distances for display
    const formattedLibraries = nearbyLibraries.map(lib => ({
      ...lib,
      distance: Math.round(lib.distance),
      distanceFormatted: formatDistance(lib.distance)
    }));
    
    return NextResponse.json(formattedLibraries);
  } catch (error) {
    console.error("Error fetching nearby libraries:", error);
    return NextResponse.json({ error: "Failed to fetch nearby libraries" }, { status: 500 });
  }
}

// Helper function to format distance in a user-friendly way
function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  } else {
    return `${(meters / 1000).toFixed(1)} km`;
  }
}