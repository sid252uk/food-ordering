// =============================================================================
// database.types.ts
// Hand-written Supabase Database type definitions for the multi-restaurant
// food ordering SaaS platform.
//
// This is a manual placeholder generated to match 001_initial_schema.sql.
// Replace the contents of this file with the output of:
//   supabase gen types typescript --project-id <your-project-id>
// once your Supabase project is live.
// =============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      // ------------------------------------------------------------------
      // profiles
      // ------------------------------------------------------------------
      profiles: {
        Row: {
          id: string
          role: "customer" | "restaurant_owner"
          first_name: string | null
          last_name: string | null
          phone: string | null
          email: string
          marketing_opt_in: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: "customer" | "restaurant_owner"
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          email: string
          marketing_opt_in?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: "customer" | "restaurant_owner"
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          email?: string
          marketing_opt_in?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      // ------------------------------------------------------------------
      // restaurants
      // ------------------------------------------------------------------
      restaurants: {
        Row: {
          id: string
          owner_user_id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          banner_url: string | null
          phone: string | null
          email: string | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          country: string | null
          operating_hours: Json
          accepts_delivery: boolean
          accepts_pickup: boolean
          delivery_fee: number
          min_order_amount: number
          estimated_delivery_minutes: number
          estimated_pickup_minutes: number
          stripe_secret_key_encrypted: string | null
          stripe_publishable_key: string | null
          stripe_webhook_secret_encrypted: string | null
          is_active: boolean
          timezone: string
          tax_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_user_id: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          banner_url?: string | null
          phone?: string | null
          email?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          operating_hours?: Json
          accepts_delivery?: boolean
          accepts_pickup?: boolean
          delivery_fee?: number
          min_order_amount?: number
          estimated_delivery_minutes?: number
          estimated_pickup_minutes?: number
          stripe_secret_key_encrypted?: string | null
          stripe_publishable_key?: string | null
          stripe_webhook_secret_encrypted?: string | null
          is_active?: boolean
          timezone?: string
          tax_rate?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_user_id?: string
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          banner_url?: string | null
          phone?: string | null
          email?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          operating_hours?: Json
          accepts_delivery?: boolean
          accepts_pickup?: boolean
          delivery_fee?: number
          min_order_amount?: number
          estimated_delivery_minutes?: number
          estimated_pickup_minutes?: number
          stripe_secret_key_encrypted?: string | null
          stripe_publishable_key?: string | null
          stripe_webhook_secret_encrypted?: string | null
          is_active?: boolean
          timezone?: string
          tax_rate?: number
          created_at?: string
          updated_at?: string
        }
      }

      // ------------------------------------------------------------------
      // menu_categories
      // ------------------------------------------------------------------
      menu_categories: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          description: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          description?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          description?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      // ------------------------------------------------------------------
      // menu_items
      // ------------------------------------------------------------------
      menu_items: {
        Row: {
          id: string
          restaurant_id: string
          category_id: string
          name: string
          description: string | null
          base_price: number
          image_url: string | null
          display_order: number
          is_vegetarian: boolean
          is_vegan: boolean
          is_gluten_free: boolean
          contains_nuts: boolean
          is_spicy: boolean
          is_active: boolean
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          category_id: string
          name: string
          description?: string | null
          base_price: number
          image_url?: string | null
          display_order?: number
          is_vegetarian?: boolean
          is_vegan?: boolean
          is_gluten_free?: boolean
          contains_nuts?: boolean
          is_spicy?: boolean
          is_active?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          category_id?: string
          name?: string
          description?: string | null
          base_price?: number
          image_url?: string | null
          display_order?: number
          is_vegetarian?: boolean
          is_vegan?: boolean
          is_gluten_free?: boolean
          contains_nuts?: boolean
          is_spicy?: boolean
          is_active?: boolean
          is_featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      // ------------------------------------------------------------------
      // menu_item_options
      // ------------------------------------------------------------------
      menu_item_options: {
        Row: {
          id: string
          menu_item_id: string
          name: string
          description: string | null
          selection_type: "single" | "multiple"
          is_required: boolean
          min_selections: number
          max_selections: number | null
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          menu_item_id: string
          name: string
          description?: string | null
          selection_type?: "single" | "multiple"
          is_required?: boolean
          min_selections?: number
          max_selections?: number | null
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          menu_item_id?: string
          name?: string
          description?: string | null
          selection_type?: "single" | "multiple"
          is_required?: boolean
          min_selections?: number
          max_selections?: number | null
          display_order?: number
          created_at?: string
        }
      }

      // ------------------------------------------------------------------
      // menu_item_option_choices
      // ------------------------------------------------------------------
      menu_item_option_choices: {
        Row: {
          id: string
          option_id: string
          name: string
          price_modifier: number
          display_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          option_id: string
          name: string
          price_modifier?: number
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          option_id?: string
          name?: string
          price_modifier?: number
          display_order?: number
          is_active?: boolean
          created_at?: string
        }
      }

      // ------------------------------------------------------------------
      // addresses
      // ------------------------------------------------------------------
      addresses: {
        Row: {
          id: string
          customer_id: string
          label: string | null
          address_line1: string
          address_line2: string | null
          city: string
          state: string
          postal_code: string
          country: string
          delivery_notes: string | null
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          label?: string | null
          address_line1: string
          address_line2?: string | null
          city: string
          state: string
          postal_code: string
          country?: string
          delivery_notes?: string | null
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          label?: string | null
          address_line1?: string
          address_line2?: string | null
          city?: string
          state?: string
          postal_code?: string
          country?: string
          delivery_notes?: string | null
          is_default?: boolean
          created_at?: string
        }
      }

      // ------------------------------------------------------------------
      // promo_codes
      // ------------------------------------------------------------------
      promo_codes: {
        Row: {
          id: string
          restaurant_id: string
          code: string
          description: string | null
          promo_type: "percentage" | "fixed_amount"
          discount_value: number
          min_order_amount: number | null
          max_uses: number | null
          current_uses: number
          max_uses_per_customer: number | null
          is_active: boolean
          starts_at: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          code: string
          description?: string | null
          promo_type: "percentage" | "fixed_amount"
          discount_value: number
          min_order_amount?: number | null
          max_uses?: number | null
          current_uses?: number
          max_uses_per_customer?: number | null
          is_active?: boolean
          starts_at?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          code?: string
          description?: string | null
          promo_type?: "percentage" | "fixed_amount"
          discount_value?: number
          min_order_amount?: number | null
          max_uses?: number | null
          current_uses?: number
          max_uses_per_customer?: number | null
          is_active?: boolean
          starts_at?: string | null
          expires_at?: string | null
          created_at?: string
        }
      }

      // ------------------------------------------------------------------
      // orders
      // ------------------------------------------------------------------
      orders: {
        Row: {
          id: string
          restaurant_id: string
          customer_id: string | null
          order_number: number
          guest_email: string | null
          guest_phone: string | null
          guest_name: string | null
          order_type: "delivery" | "pickup"
          status:
            | "pending"
            | "accepted"
            | "preparing"
            | "ready"
            | "out_for_delivery"
            | "delivered"
            | "picked_up"
            | "cancelled"
            | "refunded"
          delivery_address_id: string | null
          delivery_address_snapshot: Json | null
          delivery_notes: string | null
          subtotal: number
          delivery_fee: number
          discount_amount: number
          tax_amount: number
          tip_amount: number
          total_amount: number
          promo_code_id: string | null
          promo_code_used: string | null
          payment_type: "stripe" | "cash"
          payment_status: "pending" | "pending_cash" | "completed" | "failed" | "refunded"
          estimated_ready_at: string | null
          accepted_at: string | null
          ready_at: string | null
          completed_at: string | null
          special_instructions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          customer_id?: string | null
          order_number?: number
          guest_email?: string | null
          guest_phone?: string | null
          guest_name?: string | null
          order_type?: "delivery" | "pickup"
          status?:
            | "pending"
            | "accepted"
            | "preparing"
            | "ready"
            | "out_for_delivery"
            | "delivered"
            | "picked_up"
            | "cancelled"
            | "refunded"
          delivery_address_id?: string | null
          delivery_address_snapshot?: Json | null
          delivery_notes?: string | null
          subtotal: number
          delivery_fee?: number
          discount_amount?: number
          tax_amount: number
          tip_amount?: number
          total_amount: number
          promo_code_id?: string | null
          promo_code_used?: string | null
          payment_type?: "stripe" | "cash"
          payment_status?: "pending" | "pending_cash" | "completed" | "failed" | "refunded"
          estimated_ready_at?: string | null
          accepted_at?: string | null
          ready_at?: string | null
          completed_at?: string | null
          special_instructions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          customer_id?: string | null
          order_number?: number
          guest_email?: string | null
          guest_phone?: string | null
          guest_name?: string | null
          order_type?: "delivery" | "pickup"
          status?:
            | "pending"
            | "accepted"
            | "preparing"
            | "ready"
            | "out_for_delivery"
            | "delivered"
            | "picked_up"
            | "cancelled"
            | "refunded"
          delivery_address_id?: string | null
          delivery_address_snapshot?: Json | null
          delivery_notes?: string | null
          subtotal?: number
          delivery_fee?: number
          discount_amount?: number
          tax_amount?: number
          tip_amount?: number
          total_amount?: number
          promo_code_id?: string | null
          promo_code_used?: string | null
          payment_type?: "stripe" | "cash"
          payment_status?: "pending" | "pending_cash" | "completed" | "failed" | "refunded"
          estimated_ready_at?: string | null
          accepted_at?: string | null
          ready_at?: string | null
          completed_at?: string | null
          special_instructions?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // ------------------------------------------------------------------
      // order_items
      // ------------------------------------------------------------------
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string
          menu_item_snapshot: Json
          quantity: number
          unit_price: number
          total_price: number
          special_instructions: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          menu_item_id: string
          menu_item_snapshot: Json
          quantity?: number
          unit_price: number
          total_price: number
          special_instructions?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          menu_item_id?: string
          menu_item_snapshot?: Json
          quantity?: number
          unit_price?: number
          total_price?: number
          special_instructions?: string | null
          created_at?: string
        }
      }

      // ------------------------------------------------------------------
      // order_item_choices
      // ------------------------------------------------------------------
      order_item_choices: {
        Row: {
          id: string
          order_item_id: string
          option_id: string
          choice_id: string
          choice_name: string
          price_modifier: number
        }
        Insert: {
          id?: string
          order_item_id: string
          option_id: string
          choice_id: string
          choice_name: string
          price_modifier?: number
        }
        Update: {
          id?: string
          order_item_id?: string
          option_id?: string
          choice_id?: string
          choice_name?: string
          price_modifier?: number
        }
      }

      // ------------------------------------------------------------------
      // payments
      // ------------------------------------------------------------------
      payments: {
        Row: {
          id: string
          order_id: string | null
          restaurant_id: string
          stripe_payment_intent_id: string | null
          stripe_charge_id: string | null
          amount: number
          currency: string
          status: string
          payment_method_type: string | null
          last_four: string | null
          receipt_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id?: string | null
          restaurant_id: string
          stripe_payment_intent_id?: string | null
          stripe_charge_id?: string | null
          amount: number
          currency?: string
          status?: string
          payment_method_type?: string | null
          last_four?: string | null
          receipt_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string | null
          restaurant_id?: string
          stripe_payment_intent_id?: string | null
          stripe_charge_id?: string | null
          amount?: number
          currency?: string
          status?: string
          payment_method_type?: string | null
          last_four?: string | null
          receipt_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      // ------------------------------------------------------------------
      // reviews
      // ------------------------------------------------------------------
      reviews: {
        Row: {
          id: string
          restaurant_id: string
          order_id: string
          customer_id: string
          rating: number
          comment: string | null
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          order_id: string
          customer_id: string
          rating: number
          comment?: string | null
          is_published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          order_id?: string
          customer_id?: string
          rating?: number
          comment?: string | null
          is_published?: boolean
          created_at?: string
        }
      }
    }

    Views: Record<string, never>

    Functions: {
      is_restaurant_owner: {
        Args: { rid: string }
        Returns: boolean
      }
      increment_promo_usage: {
        Args: Record<string, never>
        Returns: undefined
      }
    }

    Enums: {
      order_status:
        | "pending"
        | "accepted"
        | "preparing"
        | "ready"
        | "out_for_delivery"
        | "delivered"
        | "picked_up"
        | "cancelled"
        | "refunded"
      order_type: "delivery" | "pickup"
      promo_type: "percentage" | "fixed_amount"
      payment_type: "stripe" | "cash"
      payment_status: "pending" | "pending_cash" | "completed" | "failed" | "refunded"
      selection_type: "single" | "multiple"
      user_role: "customer" | "restaurant_owner"
    }
  }
}

// Convenience helper for extracting table Row/Insert/Update shapes
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]
