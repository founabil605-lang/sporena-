CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  type text DEFAULT 'card',
  brand text DEFAULT 'visa',
  last4 text,
  expiry text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_payments" ON payment_methods FOR SELECT
  TO authenticated USING (club_id IN (SELECT id FROM clubs WHERE user_id = auth.uid()));
CREATE POLICY "insert_own_payments" ON payment_methods FOR INSERT
  TO authenticated WITH CHECK (club_id IN (SELECT id FROM clubs WHERE user_id = auth.uid()));
CREATE POLICY "update_own_payments" ON payment_methods FOR UPDATE
  TO authenticated USING (club_id IN (SELECT id FROM clubs WHERE user_id = auth.uid())) WITH CHECK (club_id IN (SELECT id FROM clubs WHERE user_id = auth.uid()));
CREATE POLICY "delete_own_payments" ON payment_methods FOR DELETE
  TO authenticated USING (club_id IN (SELECT id FROM clubs WHERE user_id = auth.uid()));

CREATE INDEX idx_payment_methods_club_id ON payment_methods(club_id);
