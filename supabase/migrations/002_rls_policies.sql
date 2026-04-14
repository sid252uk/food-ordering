-- ============================================================
-- 002_rls_policies.sql
-- Row Level Security policies for all tables
-- ============================================================

-- ============================================================
-- Helper function: check if current user owns a restaurant
-- ============================================================
CREATE OR REPLACE FUNCTION is_restaurant_owner(rid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM restaurants WHERE id = rid AND owner_user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE profiles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants              ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items               ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_options        ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_option_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses                ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items              ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_choices       ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews                  ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- profiles
-- ============================================================
-- Users can read their own profile
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Users can insert their own profile (row must match their uid)
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================
-- restaurants
-- ============================================================
-- Public can read any active restaurant
CREATE POLICY "restaurants_select_active_public"
  ON restaurants FOR SELECT
  USING (is_active = true);

-- Owner can also read their own inactive restaurants
CREATE POLICY "restaurants_select_own"
  ON restaurants FOR SELECT
  USING (owner_user_id = auth.uid());

-- Owner can insert a restaurant (owner_user_id must be themselves)
CREATE POLICY "restaurants_insert_owner"
  ON restaurants FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

-- Owner can update their own restaurant
CREATE POLICY "restaurants_update_owner"
  ON restaurants FOR UPDATE
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

-- Owner can delete their own restaurant
CREATE POLICY "restaurants_delete_owner"
  ON restaurants FOR DELETE
  USING (owner_user_id = auth.uid());

-- ============================================================
-- menu_categories
-- ============================================================
-- Public can read active categories
CREATE POLICY "menu_categories_select_active_public"
  ON menu_categories FOR SELECT
  USING (is_active = true);

-- Owner can read all categories (including inactive) for their restaurant
CREATE POLICY "menu_categories_select_owner"
  ON menu_categories FOR SELECT
  USING (is_restaurant_owner(restaurant_id));

-- Owner can insert categories for their restaurant
CREATE POLICY "menu_categories_insert_owner"
  ON menu_categories FOR INSERT
  WITH CHECK (is_restaurant_owner(restaurant_id));

-- Owner can update categories for their restaurant
CREATE POLICY "menu_categories_update_owner"
  ON menu_categories FOR UPDATE
  USING (is_restaurant_owner(restaurant_id))
  WITH CHECK (is_restaurant_owner(restaurant_id));

-- Owner can delete categories for their restaurant
CREATE POLICY "menu_categories_delete_owner"
  ON menu_categories FOR DELETE
  USING (is_restaurant_owner(restaurant_id));

-- ============================================================
-- menu_items
-- ============================================================
-- Public can read active items
CREATE POLICY "menu_items_select_active_public"
  ON menu_items FOR SELECT
  USING (is_active = true);

-- Owner can read all items (including inactive) for their restaurant
CREATE POLICY "menu_items_select_owner"
  ON menu_items FOR SELECT
  USING (is_restaurant_owner(restaurant_id));

-- Owner can insert items for their restaurant
CREATE POLICY "menu_items_insert_owner"
  ON menu_items FOR INSERT
  WITH CHECK (is_restaurant_owner(restaurant_id));

-- Owner can update items for their restaurant
CREATE POLICY "menu_items_update_owner"
  ON menu_items FOR UPDATE
  USING (is_restaurant_owner(restaurant_id))
  WITH CHECK (is_restaurant_owner(restaurant_id));

-- Owner can delete items for their restaurant
CREATE POLICY "menu_items_delete_owner"
  ON menu_items FOR DELETE
  USING (is_restaurant_owner(restaurant_id));

-- ============================================================
-- menu_item_options
-- ============================================================
-- Public can read all options (options themselves have no active flag)
CREATE POLICY "menu_item_options_select_public"
  ON menu_item_options FOR SELECT
  USING (true);

-- Owner can insert options for items in their restaurants
CREATE POLICY "menu_item_options_insert_owner"
  ON menu_item_options FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM menu_items mi
      WHERE mi.id = menu_item_id
        AND is_restaurant_owner(mi.restaurant_id)
    )
  );

-- Owner can update options for items in their restaurants
CREATE POLICY "menu_item_options_update_owner"
  ON menu_item_options FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM menu_items mi
      WHERE mi.id = menu_item_id
        AND is_restaurant_owner(mi.restaurant_id)
    )
  );

-- Owner can delete options for items in their restaurants
CREATE POLICY "menu_item_options_delete_owner"
  ON menu_item_options FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM menu_items mi
      WHERE mi.id = menu_item_id
        AND is_restaurant_owner(mi.restaurant_id)
    )
  );

-- ============================================================
-- menu_item_option_choices
-- ============================================================
-- Public can read all active choices
CREATE POLICY "menu_item_option_choices_select_public"
  ON menu_item_option_choices FOR SELECT
  USING (is_active = true);

-- Owner can read all choices (including inactive) for their restaurants
CREATE POLICY "menu_item_option_choices_select_owner"
  ON menu_item_option_choices FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM menu_item_options mio
      JOIN menu_items mi ON mi.id = mio.menu_item_id
      WHERE mio.id = option_id
        AND is_restaurant_owner(mi.restaurant_id)
    )
  );

-- Owner can insert choices
CREATE POLICY "menu_item_option_choices_insert_owner"
  ON menu_item_option_choices FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM menu_item_options mio
      JOIN menu_items mi ON mi.id = mio.menu_item_id
      WHERE mio.id = option_id
        AND is_restaurant_owner(mi.restaurant_id)
    )
  );

-- Owner can update choices
CREATE POLICY "menu_item_option_choices_update_owner"
  ON menu_item_option_choices FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM menu_item_options mio
      JOIN menu_items mi ON mi.id = mio.menu_item_id
      WHERE mio.id = option_id
        AND is_restaurant_owner(mi.restaurant_id)
    )
  );

-- Owner can delete choices
CREATE POLICY "menu_item_option_choices_delete_owner"
  ON menu_item_option_choices FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM menu_item_options mio
      JOIN menu_items mi ON mi.id = mio.menu_item_id
      WHERE mio.id = option_id
        AND is_restaurant_owner(mi.restaurant_id)
    )
  );

-- ============================================================
-- addresses
-- ============================================================
-- Users can read their own saved addresses
CREATE POLICY "addresses_select_own"
  ON addresses FOR SELECT
  USING (customer_id = auth.uid());

-- Users can insert addresses for themselves
CREATE POLICY "addresses_insert_own"
  ON addresses FOR INSERT
  WITH CHECK (customer_id = auth.uid());

-- Users can update their own addresses
CREATE POLICY "addresses_update_own"
  ON addresses FOR UPDATE
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- Users can delete their own addresses
CREATE POLICY "addresses_delete_own"
  ON addresses FOR DELETE
  USING (customer_id = auth.uid());

-- ============================================================
-- promo_codes
-- ============================================================
-- Active promo codes can be read by anyone (needed to validate at checkout)
CREATE POLICY "promo_codes_select_active_public"
  ON promo_codes FOR SELECT
  USING (is_active = true);

-- Owner can read all promo codes (including inactive) for their restaurant
CREATE POLICY "promo_codes_select_owner"
  ON promo_codes FOR SELECT
  USING (is_restaurant_owner(restaurant_id));

-- Owner can insert promo codes
CREATE POLICY "promo_codes_insert_owner"
  ON promo_codes FOR INSERT
  WITH CHECK (is_restaurant_owner(restaurant_id));

-- Owner can update promo codes
CREATE POLICY "promo_codes_update_owner"
  ON promo_codes FOR UPDATE
  USING (is_restaurant_owner(restaurant_id))
  WITH CHECK (is_restaurant_owner(restaurant_id));

-- Owner can delete promo codes
CREATE POLICY "promo_codes_delete_owner"
  ON promo_codes FOR DELETE
  USING (is_restaurant_owner(restaurant_id));

-- ============================================================
-- orders
-- ============================================================
-- Authenticated customers can read their own orders
CREATE POLICY "orders_select_customer"
  ON orders FOR SELECT
  USING (customer_id = auth.uid());

-- Restaurant owner can read all orders for their restaurant
CREATE POLICY "orders_select_owner"
  ON orders FOR SELECT
  USING (is_restaurant_owner(restaurant_id));

-- Any user (including anonymous via guest fields) can place a new order
-- The service role is used by the API route which handles guest orders
CREATE POLICY "orders_insert_customer"
  ON orders FOR INSERT
  WITH CHECK (
    -- Either the customer_id matches the logged-in user, or it's a guest order (customer_id IS NULL)
    customer_id = auth.uid() OR customer_id IS NULL
  );

-- Restaurant owner can update order status
CREATE POLICY "orders_update_owner"
  ON orders FOR UPDATE
  USING (is_restaurant_owner(restaurant_id));

-- Customers can update their own orders (e.g. adding special instructions before accepted)
CREATE POLICY "orders_update_customer"
  ON orders FOR UPDATE
  USING (customer_id = auth.uid() AND status = 'pending');

-- ============================================================
-- order_items
-- ============================================================
-- Customers can read items for their own orders
CREATE POLICY "order_items_select_customer"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
        AND o.customer_id = auth.uid()
    )
  );

-- Restaurant owner can read all items for their restaurant's orders
CREATE POLICY "order_items_select_owner"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
        AND is_restaurant_owner(o.restaurant_id)
    )
  );

-- Order items are inserted by the service role (API routes bypass RLS via service key).
-- This policy allows the insert if the parent order belongs to the current user or is a guest order.
CREATE POLICY "order_items_insert_via_order"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
        AND (o.customer_id = auth.uid() OR o.customer_id IS NULL)
    )
  );

-- ============================================================
-- order_item_choices
-- ============================================================
-- Customers can read choices for their own order items
CREATE POLICY "order_item_choices_select_customer"
  ON order_item_choices FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE oi.id = order_item_id
        AND o.customer_id = auth.uid()
    )
  );

-- Restaurant owner can read choices for their restaurant's orders
CREATE POLICY "order_item_choices_select_owner"
  ON order_item_choices FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE oi.id = order_item_id
        AND is_restaurant_owner(o.restaurant_id)
    )
  );

-- Choices are inserted via the API route (service role), but also allow direct insert
-- when the parent order belongs to the current user
CREATE POLICY "order_item_choices_insert_via_order"
  ON order_item_choices FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE oi.id = order_item_id
        AND (o.customer_id = auth.uid() OR o.customer_id IS NULL)
    )
  );

-- ============================================================
-- payments
-- ============================================================
-- Restaurant owner can read payment records for their restaurant
CREATE POLICY "payments_select_owner"
  ON payments FOR SELECT
  USING (is_restaurant_owner(restaurant_id));

-- Customers can read their own payment records
CREATE POLICY "payments_select_customer"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
        AND o.customer_id = auth.uid()
    )
  );

-- Payments are created and updated exclusively by the service role (Stripe webhook handler)
-- No INSERT/UPDATE policies for regular users

-- ============================================================
-- reviews
-- ============================================================
-- Published reviews are readable by everyone
CREATE POLICY "reviews_select_published_public"
  ON reviews FOR SELECT
  USING (is_published = true);

-- Customers can read their own unpublished reviews
CREATE POLICY "reviews_select_own"
  ON reviews FOR SELECT
  USING (customer_id = auth.uid());

-- Customers can create a review for an order they placed
CREATE POLICY "reviews_insert_customer"
  ON reviews FOR INSERT
  WITH CHECK (
    customer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id
        AND o.customer_id = auth.uid()
        AND o.status IN ('delivered', 'picked_up')
    )
  );

-- Customers can update (edit) their own review
CREATE POLICY "reviews_update_own"
  ON reviews FOR UPDATE
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

-- Restaurant owner can read all reviews for their restaurant
CREATE POLICY "reviews_select_owner"
  ON reviews FOR SELECT
  USING (is_restaurant_owner(restaurant_id));

-- Restaurant owner can update reviews for their restaurant (e.g. publish/unpublish)
CREATE POLICY "reviews_update_owner"
  ON reviews FOR UPDATE
  USING (is_restaurant_owner(restaurant_id));

-- Restaurant owner can delete reviews for their restaurant
CREATE POLICY "reviews_delete_owner"
  ON reviews FOR DELETE
  USING (is_restaurant_owner(restaurant_id));
