-- ============================================================
-- 004_seed_data.sql
-- Development seed data for the multi-restaurant food ordering platform.
--
-- IMPORTANT: This file is intended for LOCAL DEVELOPMENT ONLY.
-- Do NOT run this against a production database.
--
-- Before running, replace the placeholder owner_user_id UUID
-- ('00000000-0000-0000-0000-000000000001') with your actual
-- Supabase auth user UUID after you have signed up in the app.
-- ============================================================

DO $$
DECLARE
  v_restaurant_id    UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
  v_owner_user_id    UUID := '00000000-0000-0000-0000-000000000001'; -- REPLACE with your auth user UUID
  v_cat_starters     UUID := 'c0000001-0000-0000-0000-000000000001';
  v_cat_mains        UUID := 'c0000002-0000-0000-0000-000000000002';
  v_cat_desserts     UUID := 'c0000003-0000-0000-0000-000000000003';
  v_item_bruschetta  UUID := 'i0000001-0000-0000-0000-000000000001';
  v_item_soup        UUID := 'i0000002-0000-0000-0000-000000000002';
  v_item_burger      UUID := 'i0000003-0000-0000-0000-000000000003';
  v_item_pasta       UUID := 'i0000004-0000-0000-0000-000000000004';
  v_item_cheesecake  UUID := 'i0000005-0000-0000-0000-000000000005';
  v_item_brownie     UUID := 'i0000006-0000-0000-0000-000000000006';
BEGIN

  -- --------------------------------------------------------
  -- Restaurant
  -- --------------------------------------------------------
  INSERT INTO restaurants (
    id,
    owner_user_id,
    name,
    slug,
    description,
    phone,
    email,
    address_line1,
    city,
    state,
    postal_code,
    country,
    delivery_fee,
    min_order_amount,
    tax_rate,
    estimated_delivery_minutes,
    estimated_pickup_minutes,
    accepts_delivery,
    accepts_pickup,
    timezone,
    is_active,
    operating_hours
  ) VALUES (
    v_restaurant_id,
    v_owner_user_id,
    'Demo Restaurant',
    'demo-restaurant',
    'A delicious demo restaurant featuring a variety of crowd-pleasing dishes.',
    '(555) 000-0000',
    'hello@demo-restaurant.com',
    '123 Main Street',
    'New York',
    'NY',
    '10001',
    'US',
    3.99,
    10.00,
    0.0800,
    45,
    20,
    true,
    true,
    'America/New_York',
    true,
    '{
      "monday":    {"open": "09:00", "close": "22:00", "is_open": true},
      "tuesday":   {"open": "09:00", "close": "22:00", "is_open": true},
      "wednesday": {"open": "09:00", "close": "22:00", "is_open": true},
      "thursday":  {"open": "09:00", "close": "22:00", "is_open": true},
      "friday":    {"open": "09:00", "close": "23:00", "is_open": true},
      "saturday":  {"open": "10:00", "close": "23:00", "is_open": true},
      "sunday":    {"open": "10:00", "close": "21:00", "is_open": true}
    }'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;

  -- --------------------------------------------------------
  -- Menu Categories
  -- --------------------------------------------------------
  INSERT INTO menu_categories (id, restaurant_id, name, description, display_order, is_active)
  VALUES
    (v_cat_starters, v_restaurant_id, 'Starters',  'Light bites to kick off your meal',       1, true),
    (v_cat_mains,    v_restaurant_id, 'Mains',      'Hearty main courses for every appetite',  2, true),
    (v_cat_desserts, v_restaurant_id, 'Desserts',   'Sweet treats to finish on a high note',   3, true)
  ON CONFLICT (id) DO NOTHING;

  -- --------------------------------------------------------
  -- Menu Items
  -- --------------------------------------------------------
  INSERT INTO menu_items (
    id, restaurant_id, category_id, name, description,
    base_price, display_order,
    is_vegetarian, is_vegan, is_gluten_free, contains_nuts, is_spicy,
    is_active, is_featured
  )
  VALUES
    -- Starters
    (
      v_item_bruschetta,
      v_restaurant_id, v_cat_starters,
      'Classic Bruschetta',
      'Toasted sourdough topped with fresh tomatoes, garlic, basil, and a drizzle of extra-virgin olive oil.',
      8.99, 1,
      true, true, false, false, false,
      true, false
    ),
    (
      v_item_soup,
      v_restaurant_id, v_cat_starters,
      'Roasted Tomato Soup',
      'Slow-roasted vine tomatoes blended with cream and fresh herbs. Served with crusty bread.',
      7.49, 2,
      true, false, false, false, false,
      true, true
    ),
    -- Mains
    (
      v_item_burger,
      v_restaurant_id, v_cat_mains,
      'Signature Smash Burger',
      'Double smash-patty with American cheese, house sauce, pickles, and caramelised onions on a brioche bun.',
      14.99, 1,
      false, false, false, false, false,
      true, true
    ),
    (
      v_item_pasta,
      v_restaurant_id, v_cat_mains,
      'Tagliatelle al Ragù',
      'Fresh egg tagliatelle with a slow-cooked beef and pork ragù, finished with Parmigiano-Reggiano.',
      15.99, 2,
      false, false, false, false, false,
      true, false
    ),
    -- Desserts
    (
      v_item_cheesecake,
      v_restaurant_id, v_cat_desserts,
      'New York Cheesecake',
      'Velvety baked vanilla cheesecake on a graham cracker base, served with fresh berry compote.',
      7.99, 1,
      true, false, false, false, false,
      true, true
    ),
    (
      v_item_brownie,
      v_restaurant_id, v_cat_desserts,
      'Warm Chocolate Brownie',
      'Rich, fudgy chocolate brownie served warm with a scoop of vanilla ice cream.',
      6.99, 2,
      true, false, false, true, false,
      true, false
    )
  ON CONFLICT (id) DO NOTHING;

  -- --------------------------------------------------------
  -- Promo Codes
  -- --------------------------------------------------------
  INSERT INTO promo_codes (
    restaurant_id,
    code,
    description,
    promo_type,
    discount_value,
    min_order_amount,
    max_uses,
    max_uses_per_customer,
    is_active,
    starts_at,
    expires_at
  )
  VALUES
    -- 10% off — no minimum order requirement
    (
      v_restaurant_id,
      'SAVE10',
      '10% off your entire order',
      'percentage',
      10.00,
      NULL,
      500,
      3,
      true,
      NOW(),
      NOW() + INTERVAL '1 year'
    ),
    -- $5 off — minimum order of $20
    (
      v_restaurant_id,
      'FIRST5',
      '$5 off your first order (min. $20)',
      'fixed_amount',
      5.00,
      20.00,
      1000,
      1,
      true,
      NOW(),
      NOW() + INTERVAL '1 year'
    )
  ON CONFLICT (restaurant_id, code) DO NOTHING;

END $$;
