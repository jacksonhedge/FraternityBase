-- First, let's see what Rutgers universities we have
SELECT id, name, city, state FROM universities WHERE name ILIKE '%rutgers%' ORDER BY name;
