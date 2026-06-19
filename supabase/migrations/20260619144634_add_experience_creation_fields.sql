/*
# Add Experience Creation Fields

1. Modified Tables
- `club_experiences`
  - `location` (text) - venue name for the experience
  - `address` (text) - full address of the venue
  - `duration` (text) - duration in minutes or a formatted string
  - `includes` (text[]) - list of what the experience includes
  - `images` (text[]) - array of image URLs
  - `cancellation_policy` (text) - flexible / moderate / strict
  - `date_time` (timestamptz) - scheduled date/time of the experience
  - `certified` (boolean) - whether the experience is certified
  - `tags` (text[]) - array of tags for categorization

2. Security
- No new RLS policies needed; existing club_experiences policies cover these columns.
*/

ALTER TABLE club_experiences
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS duration text,
ADD COLUMN IF NOT EXISTS includes text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cancellation_policy text DEFAULT 'moderate',
ADD COLUMN IF NOT EXISTS date_time timestamptz,
ADD COLUMN IF NOT EXISTS certified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
