CREATE TABLE IF NOT EXISTS fan_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pseudo text,
  favorite_sport text,
  avatar_url text,
  member_since timestamptz DEFAULT now(),
  sport_score integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fan_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experience_id uuid NOT NULL REFERENCES club_experiences(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fan_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experience_id uuid NOT NULL REFERENCES club_experiences(id) ON DELETE CASCADE,
  rating numeric DEFAULT 5,
  comment text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fan_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notif boolean DEFAULT true,
  push_notif boolean DEFAULT true,
  sms_notif boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE fan_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_profile" ON fan_profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_profile" ON fan_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_profile" ON fan_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "select_own_favorites" ON fan_favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_favorites" ON fan_favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_favorites" ON fan_favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "select_own_reviews" ON fan_reviews FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_reviews" ON fan_reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_reviews" ON fan_reviews FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_reviews" ON fan_reviews FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "select_own_settings" ON fan_settings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_settings" ON fan_settings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_settings" ON fan_settings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_fan_profiles_user_id ON fan_profiles(user_id);
CREATE INDEX idx_fan_favorites_user_id ON fan_favorites(user_id);
CREATE INDEX idx_fan_favorites_experience_id ON fan_favorites(experience_id);
CREATE INDEX idx_fan_reviews_user_id ON fan_reviews(user_id);
CREATE INDEX idx_fan_reviews_experience_id ON fan_reviews(experience_id);
CREATE INDEX idx_fan_settings_user_id ON fan_settings(user_id);
