// db/postgis.ts
import { customType } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Custom PostGIS geography type for Drizzle
export const postgisGeography = customType<{
  data: string;
  driverData: string;
}>({
  dataType() {
    return 'geography(Point, 4326)';
  },
  toDriver(value: string): string {
    return value;
  },
});

// Helper functions for PostGIS operations
export const postgis = {
  // Create a point from longitude and latitude (in that order for PostGIS)
  createPoint: (longitude: number, latitude: number) => {
    return sql`ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography`;
  },
  
  // Calculate distance between two points in meters
  distance: (point1: string, point2: string) => {
    return sql`ST_Distance(${point1}, ${point2})`;
  },
  
  // Find points within a certain distance (in meters)
  withinDistance: (column: string, point: string, distance: number) => {
    return sql`ST_DWithin(${column}, ${point}, ${distance})`;
  }
};