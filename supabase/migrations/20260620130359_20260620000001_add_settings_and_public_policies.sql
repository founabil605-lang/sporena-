CREATE TABLE IF NOT EXISTS club_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  website text,
  address text,
  phone text,
  logo_url text,
  description text,
  notification_reservations boolean DEFAULT true,
  notification_reviews boolean DEFAULT true,
  notification_marketing boolean DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount numeric DEFAULT 0,
  status text DEFAULT 'paid',
  date timestamptz DEFAULT now()
);

ALTER TABLE club_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_settings" ON club_settings FOR SELECT
  TO authenticated USING (club_id IN (SELECT id FROM clubs WHERE user_id = auth.uid()));
CREATE POLICY "insert_own_settings" ON club_settings FOR INSERT
  TO authenticated WITH CHECK (club_id IN (SELECT id FROM clubs WHERE user_id = auth.uid()));
CREATE POLICY "update_own_settings" ON club_settings FOR UPDATE
  TO authenticated USING (club_id IN (SELECT id FROM clubs WHERE user_id = auth.uid())) WITH CHECK (club_id IN (SELECT id FROM clubs WHERE user_id = auth.uid()));
CREATE POLICY "delete_own_settings" ON club_settings FOR DELETE
  TO authenticated USING (club_id IN (SELECT id FROM clubs WHERE user_id = auth.uid()));

CREATE POLICY "select_own_billing" ON billing_history FOR SELECT
  TO authenticated USING (club_id IN (SELECT id FROM clubs WHERE user_id = auth.uid()));
CREATE POLICY "insert_own_billing" ON billing_history FOR INSERT
  TO authenticated WITH CHECK (club_id IN (SELECT id FROM clubs WHERE user_id = auth.uid()));
CREATE POLICY "update_own_billing" ON billing_history FOR UPDATE
  TO authenticated USING (club_id IN (SELECT id FROM clubs WHERE user_id = auth.uid())) WITH CHECK (club_id IN (SELECT id FROM clubs WHERE user_id = auth.uid()));
CREATE POLICY "delete_own_billing" ON billing_history FOR DELETE
  TO authenticated USING (club_id IN (SELECT id FROM clubs WHERE user_id = auth.uid()));

-- Public policy for club_experiences (for unauthenticated users to browse)
CREATE POLICY "public_experiences" ON club_experiences FOR SELECT
  TO anon USING (status = 'public');

-- Public policy for clubs (for unauthenticated users to see club info)
CREATE POLICY "public_clubs" ON clubs FOR SELECT
  TO anon USING (true);

CREATE INDEX idx_club_settings_club_id ON club_settings(club_id);
CREATE INDEX idx_billing_history_club_id ON billing_history(club_id);
