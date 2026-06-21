CREATE TABLE IF NOT EXISTS fan_cart (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experience_id uuid NOT NULL REFERENCES club_experiences(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fan_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'general',
  read boolean DEFAULT false,
  experience_id uuid REFERENCES club_experiences(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fan_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_cart" ON fan_cart FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_cart" ON fan_cart FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_cart" ON fan_cart FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_cart" ON fan_cart FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "select_own_notifications" ON fan_notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_notifications" ON fan_notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_notifications" ON fan_notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_notifications" ON fan_notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_fan_cart_user_id ON fan_cart(user_id);
CREATE INDEX idx_fan_cart_experience_id ON fan_cart(experience_id);
CREATE INDEX idx_fan_notifications_user_id ON fan_notifications(user_id);
CREATE INDEX idx_fan_notifications_read ON fan_notifications(user_id, read);
