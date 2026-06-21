CREATE POLICY "public_experiences_authenticated" ON club_experiences FOR SELECT
  TO authenticated USING (status = 'public');
