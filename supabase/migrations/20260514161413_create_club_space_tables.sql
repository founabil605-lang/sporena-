/*
  # Create Club Space Tables

  1. New Tables
    - `clubs` - Club profiles and information
    - `club_members` - Staff members who manage clubs
    - `club_experiences` - Experiences created by clubs
    - `bookings` - Booking records
    - `analytics` - Analytics data for clubs

  2. Security
    - Enable RLS on all tables
    - Add policies for club access
    - Restrict data to authenticated users and club owners

  3. Key Features
    - Support for multi-role system (club admin, staff)
    - Track experience creation and bookings
    - Store analytics metrics
*/

CREATE TABLE IF NOT EXISTS clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  logo_url text,
  banner_url text,
  subscription_plan text DEFAULT 'basic',
  status text DEFAULT 'active',
  commission_rate integer DEFAULT 15,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS club_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS club_experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text,
  sport text,
  price numeric DEFAULT 0,
  image_url text,
  status text DEFAULT 'public',
  slots_total integer DEFAULT 0,
  slots_booked integer DEFAULT 0,
  rating numeric DEFAULT 4.5,
  review_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES club_experiences(id) ON DELETE CASCADE,
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  date_time timestamptz NOT NULL,
  participants integer DEFAULT 1,
  total_price numeric DEFAULT 0,
  status text DEFAULT 'confirmed',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  month text NOT NULL,
  revenue numeric DEFAULT 0,
  booking_count integer DEFAULT 0,
  avg_rating numeric DEFAULT 0,
  fill_rate numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Club owners can manage their club"
  ON clubs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Club members can view their club"
  ON clubs FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM club_members WHERE club_members.club_id = clubs.id AND club_members.user_id = auth.uid())
  );

CREATE POLICY "Club owners and members can access club members"
  ON club_members FOR SELECT
  TO authenticated
  USING (
    club_id IN (SELECT id FROM clubs WHERE user_id = auth.uid() OR id IN (SELECT club_id FROM club_members WHERE user_id = auth.uid()))
  );

CREATE POLICY "Club owners and members can view experiences"
  ON club_experiences FOR SELECT
  TO authenticated
  USING (
    club_id IN (SELECT id FROM clubs WHERE user_id = auth.uid() OR id IN (SELECT club_id FROM club_members WHERE user_id = auth.uid()))
  );

CREATE POLICY "Club owners and members can create experiences"
  ON club_experiences FOR INSERT
  TO authenticated
  WITH CHECK (
    club_id IN (SELECT id FROM clubs WHERE user_id = auth.uid() OR id IN (SELECT club_id FROM club_members WHERE user_id = auth.uid()))
  );

CREATE POLICY "Club owners and members can update experiences"
  ON club_experiences FOR UPDATE
  TO authenticated
  USING (
    club_id IN (SELECT id FROM clubs WHERE user_id = auth.uid() OR id IN (SELECT club_id FROM club_members WHERE user_id = auth.uid()))
  );

CREATE POLICY "Club owners and members can view bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    club_id IN (SELECT id FROM clubs WHERE user_id = auth.uid() OR id IN (SELECT club_id FROM club_members WHERE user_id = auth.uid()))
  );

CREATE POLICY "Club owners and members can view analytics"
  ON analytics FOR SELECT
  TO authenticated
  USING (
    club_id IN (SELECT id FROM clubs WHERE user_id = auth.uid() OR id IN (SELECT club_id FROM club_members WHERE user_id = auth.uid()))
  );

CREATE INDEX idx_clubs_user_id ON clubs(user_id);
CREATE INDEX idx_club_members_club_id ON club_members(club_id);
CREATE INDEX idx_club_members_user_id ON club_members(user_id);
CREATE INDEX idx_club_experiences_club_id ON club_experiences(club_id);
CREATE INDEX idx_bookings_club_id ON bookings(club_id);
CREATE INDEX idx_bookings_experience_id ON bookings(experience_id);
CREATE INDEX idx_analytics_club_id ON analytics(club_id);
