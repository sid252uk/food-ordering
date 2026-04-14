-- ============================================================
-- 001_initial_schema.sql
-- Multi-restaurant food ordering SaaS platform - initial schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- profiles: extends auth.users
-- ============================================================
CREATE TABLE profiles (
  id                UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role              TEXT        NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'restaurant_owner')),
  first_name        TEXT,
  last_name         TEXT,
  phone             TEXT,
  email             TEXT        NOT NULL,
  marketing_opt_in  BOOLEAN     NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- restaurants
-- ============================================================
CREATE TABLE restaurants (
  id                             UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_user_id                  UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                           TEXT         NOT NULL,
  slug                           TEXT         UNIQUE NOT NULL,
  description                    TEXT,
  logo_url                       TEXT,
  banner_url                     TEXT,
  phone                          TEXT,
  email                          TEXT,
  address_line1                  TEXT,
  address_line2                  TEXT,
  city                           TEXT,
  state                          TEXT,
  postal_code                    TEXT,
  country                        TEXT         DEFAULT 'US',
  operating_hours                JSONB        NOT NULL DEFAULT '{}',
  accepts_delivery               BOOLEAN      NOT NULL DEFAULT true,
  accepts_pickup                 BOOLEAN      NOT NULL DEFAULT true,
  delivery_fee                   NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  min_order_amount               NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  estimated_delivery_minutes     INT          NOT NULL DEFAULT 45,
  estimated_pickup_minutes       INT          NOT NULL DEFAULT 20,
  stripe_secret_key_encrypted    TEXT,
  stripe_publishable_key         TEXT,
  stripe_webhook_secret_encrypted TEXT,
  is_active                      BOOLEAN      NOT NULL DEFAULT true,
  timezone                       TEXT         NOT NULL DEFAULT 'America/New_York',
  tax_rate                       NUMERIC(5,4) NOT NULL DEFAULT 0.0800,
  created_at                     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at                     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_restaurants_slug  ON restaurants(slug);
CREATE INDEX idx_restaurants_owner ON restaurants(owner_user_id);

-- ============================================================
-- menu_categories
-- ============================================================
CREATE TABLE menu_categories (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID        NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  description   TEXT,
  display_order INT         NOT NULL DEFAULT 0,
  is_active     BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_menu_categories_restaurant ON menu_categories(restaurant_id, display_order);

-- ============================================================
-- menu_items
-- ============================================================
CREATE TABLE menu_items (
  id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID         NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id   UUID         NOT NULL REFERENCES menu_categories(id) ON DELETE CASCADE,
  name          TEXT         NOT NULL,
  description   TEXT,
  base_price    NUMERIC(10,2) NOT NULL,
  image_url     TEXT,
  display_order INT          NOT NULL DEFAULT 0,
  is_vegetarian BOOLEAN      NOT NULL DEFAULT false,
  is_vegan      BOOLEAN      NOT NULL DEFAULT false,
  is_gluten_free BOOLEAN     NOT NULL DEFAULT false,
  contains_nuts BOOLEAN      NOT NULL DEFAULT false,
  is_spicy      BOOLEAN      NOT NULL DEFAULT false,
  is_active     BOOLEAN      NOT NULL DEFAULT true,
  is_featured   BOOLEAN      NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_menu_items_category   ON menu_items(category_id, display_order);
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);

-- ============================================================
-- menu_item_options
-- ============================================================
CREATE TABLE menu_item_options (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id   UUID        NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name           TEXT        NOT NULL,
  description    TEXT,
  selection_type TEXT        NOT NULL DEFAULT 'single' CHECK (selection_type IN ('single', 'multiple')),
  is_required    BOOLEAN     NOT NULL DEFAULT false,
  min_selections INT         NOT NULL DEFAULT 0,
  max_selections INT,
  display_order  INT         NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_menu_item_options_item ON menu_item_options(menu_item_id);

-- ============================================================
-- menu_item_option_choices
-- ============================================================
CREATE TABLE menu_item_option_choices (
  id             UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_id      UUID         NOT NULL REFERENCES menu_item_options(id) ON DELETE CASCADE,
  name           TEXT         NOT NULL,
  price_modifier NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  display_order  INT          NOT NULL DEFAULT 0,
  is_active      BOOLEAN      NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_option_choices_option ON menu_item_option_choices(option_id);

-- ============================================================
-- addresses
-- ============================================================
CREATE TABLE addresses (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label          TEXT,
  address_line1  TEXT        NOT NULL,
  address_line2  TEXT,
  city           TEXT        NOT NULL,
  state          TEXT        NOT NULL,
  postal_code    TEXT        NOT NULL,
  country        TEXT        NOT NULL DEFAULT 'US',
  delivery_notes TEXT,
  is_default     BOOLEAN     NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_customer ON addresses(customer_id);

-- ============================================================
-- promo_codes
-- ============================================================
CREATE TABLE promo_codes (
  id                     UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id          UUID         NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  code                   TEXT         NOT NULL,
  description            TEXT,
  promo_type             TEXT         NOT NULL CHECK (promo_type IN ('percentage', 'fixed_amount')),
  discount_value         NUMERIC(10,2) NOT NULL,
  min_order_amount       NUMERIC(10,2),
  max_uses               INT,
  current_uses           INT          NOT NULL DEFAULT 0,
  max_uses_per_customer  INT,
  is_active              BOOLEAN      NOT NULL DEFAULT true,
  starts_at              TIMESTAMPTZ,
  expires_at             TIMESTAMPTZ,
  created_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE(restaurant_id, code)
);

CREATE INDEX idx_promo_codes_restaurant ON promo_codes(restaurant_id, code);

-- ============================================================
-- orders
-- ============================================================
CREATE TABLE orders (
  id                        UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id             UUID         NOT NULL REFERENCES restaurants(id),
  customer_id               UUID         REFERENCES profiles(id),
  order_number              SERIAL,
  guest_email               TEXT,
  guest_phone               TEXT,
  guest_name                TEXT,
  order_type                TEXT         NOT NULL DEFAULT 'delivery' CHECK (order_type IN ('delivery', 'pickup')),
  status                    TEXT         NOT NULL DEFAULT 'pending' CHECK (status IN (
                              'pending','accepted','preparing','ready',
                              'out_for_delivery','delivered','picked_up',
                              'cancelled','refunded'
                            )),
  delivery_address_id       UUID         REFERENCES addresses(id),
  delivery_address_snapshot JSONB,
  delivery_notes            TEXT,
  subtotal                  NUMERIC(10,2) NOT NULL,
  delivery_fee              NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  discount_amount           NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  tax_amount                NUMERIC(10,2) NOT NULL,
  tip_amount                NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  total_amount              NUMERIC(10,2) NOT NULL,
  promo_code_id             UUID         REFERENCES promo_codes(id),
  promo_code_used           TEXT,
  payment_type              TEXT         NOT NULL DEFAULT 'stripe' CHECK (payment_type IN ('stripe', 'cash')),
  payment_status            TEXT         NOT NULL DEFAULT 'pending' CHECK (payment_status IN (
                              'pending','pending_cash','completed','failed','refunded'
                            )),
  estimated_ready_at        TIMESTAMPTZ,
  accepted_at               TIMESTAMPTZ,
  ready_at                  TIMESTAMPTZ,
  completed_at              TIMESTAMPTZ,
  special_instructions      TEXT,
  created_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_restaurant ON orders(restaurant_id, created_at DESC);
CREATE INDEX idx_orders_customer   ON orders(customer_id, created_at DESC);
CREATE INDEX idx_orders_status     ON orders(restaurant_id, status);

-- ============================================================
-- order_items
-- ============================================================
CREATE TABLE order_items (
  id                   UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id             UUID         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id         UUID         NOT NULL REFERENCES menu_items(id),
  menu_item_snapshot   JSONB        NOT NULL,
  quantity             INT          NOT NULL DEFAULT 1,
  unit_price           NUMERIC(10,2) NOT NULL,
  total_price          NUMERIC(10,2) NOT NULL,
  special_instructions TEXT,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================================
-- order_item_choices
-- ============================================================
CREATE TABLE order_item_choices (
  id             UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_item_id  UUID         NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  option_id      UUID         NOT NULL REFERENCES menu_item_options(id),
  choice_id      UUID         NOT NULL REFERENCES menu_item_option_choices(id),
  choice_name    TEXT         NOT NULL,
  price_modifier NUMERIC(10,2) NOT NULL DEFAULT 0.00
);

-- ============================================================
-- payments
-- ============================================================
CREATE TABLE payments (
  id                       UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id                 UUID         REFERENCES orders(id),
  restaurant_id            UUID         NOT NULL REFERENCES restaurants(id),
  stripe_payment_intent_id TEXT         UNIQUE,
  stripe_charge_id         TEXT,
  amount                   NUMERIC(10,2) NOT NULL,
  currency                 TEXT         NOT NULL DEFAULT 'usd',
  status                   TEXT         NOT NULL DEFAULT 'pending',
  payment_method_type      TEXT,
  last_four                TEXT,
  receipt_url              TEXT,
  created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order  ON payments(order_id);
CREATE INDEX idx_payments_intent ON payments(stripe_payment_intent_id);

-- ============================================================
-- reviews
-- ============================================================
CREATE TABLE reviews (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID        NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  order_id      UUID        NOT NULL REFERENCES orders(id),
  customer_id   UUID        NOT NULL REFERENCES profiles(id),
  rating        INT         NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT,
  is_published  BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(order_id, customer_id)
);
