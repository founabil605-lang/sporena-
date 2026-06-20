ALTER TABLE club_experiences
ADD COLUMN IF NOT EXISTS date text,
ADD COLUMN IF NOT EXISTS time text,
ADD COLUMN IF NOT EXISTS organizer text,
ADD COLUMN IF NOT EXISTS organizer_rating numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS organizer_experiences integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS club_name text;

-- Update existing rows with default date format
UPDATE club_experiences
SET date = COALESCE(date, 'Date à définir'),
    time = COALESCE(time, 'Heure à définir');
