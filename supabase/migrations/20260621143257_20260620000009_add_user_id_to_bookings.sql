ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);

UPDATE bookings SET user_id = (
  SELECT id FROM auth.users WHERE email = bookings.customer_email LIMIT 1
) WHERE user_id IS NULL;
