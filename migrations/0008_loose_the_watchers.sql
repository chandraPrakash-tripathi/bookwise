
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add geography column to libraries table
ALTER TABLE libraries 
ADD COLUMN geog_location geography(Point, 4326);

-- Populate geog_location from existing latitude/longitude columns
UPDATE libraries 
SET geog_location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create a spatial index for faster queries
CREATE INDEX idx_libraries_geog_location ON libraries USING GIST (geog_location);

-- You might want to create a trigger to keep geog_location in sync with lat/long
CREATE OR REPLACE FUNCTION update_geog_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.geog_location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_update_geog_location
BEFORE INSERT OR UPDATE OF latitude, longitude ON libraries
FOR EACH ROW
EXECUTE FUNCTION update_geog_location();