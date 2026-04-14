-- ============================================================
-- 003_functions.sql
-- Trigger functions, triggers, and realtime configuration
-- ============================================================

-- ============================================================
-- 1. updated_at auto-stamp trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach the trigger to every table that has an updated_at column

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_menu_categories_updated_at
  BEFORE UPDATE ON menu_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_menu_items_updated_at
  BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 2. Auto-create profile on new auth user
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger that fires handle_new_user on auth.users INSERT
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 4. Increment promo code usage on order placement
-- ============================================================
CREATE OR REPLACE FUNCTION increment_promo_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment when a promo code was actually used
  IF NEW.promo_code_id IS NOT NULL THEN
    UPDATE promo_codes
    SET current_uses = current_uses + 1
    WHERE id = NEW.promo_code_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_increment_promo_usage
  AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION increment_promo_usage();

-- ============================================================
-- 5. Enable Realtime for orders and payments
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE payments;
