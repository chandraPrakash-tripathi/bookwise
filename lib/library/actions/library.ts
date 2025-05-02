'use server'
import { db } from "@/db/drizzle";
import { postgis } from "@/db/postgis";
import { libraries } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function findNearbyLibraries(
    latitude: number, 
    longitude: number, 
    distanceInMeters: number = 5000
  ) {
    try {
      const userLocation = postgis.createPoint(longitude, latitude);
      
      const nearbyLibraries = await db.select({
        id: libraries.id,
        name: libraries.name,
        address: libraries.address,
        city: libraries.city,
        state: libraries.state,
        latitude: libraries.latitude,
        longitude: libraries.longitude,
        distance: sql<number>`ST_Distance(${libraries.geog_location}, ${userLocation})`.as('distance'),
      })
      .from(libraries)
      .where(sql`ST_DWithin(${libraries.geog_location}, ${userLocation}, ${distanceInMeters})`)
      .orderBy(sql`ST_Distance(${libraries.geog_location}, ${userLocation})`)
      .limit(10);
      
      return { success: true, libraries: nearbyLibraries };
    } catch (error) {
      console.error("Error finding nearby libraries:", error);
      return { success: false, error: "Failed to find nearby libraries" };
    }
  }