import type { Database } from "./database.types"

// Base row types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Restaurant = Database["public"]["Tables"]["restaurants"]["Row"]
export type MenuCategory = Database["public"]["Tables"]["menu_categories"]["Row"]
export type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"]
export type MenuItemOption = Database["public"]["Tables"]["menu_item_options"]["Row"]
export type MenuItemOptionChoice = Database["public"]["Tables"]["menu_item_option_choices"]["Row"]
export type Order = Database["public"]["Tables"]["orders"]["Row"]
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"]
export type OrderItemChoice = Database["public"]["Tables"]["order_item_choices"]["Row"]
export type Payment = Database["public"]["Tables"]["payments"]["Row"]
export type PromoCode = Database["public"]["Tables"]["promo_codes"]["Row"]
export type Address = Database["public"]["Tables"]["addresses"]["Row"]
export type Review = Database["public"]["Tables"]["reviews"]["Row"]

// Insert types
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"]
export type RestaurantInsert = Database["public"]["Tables"]["restaurants"]["Insert"]
export type MenuCategoryInsert = Database["public"]["Tables"]["menu_categories"]["Insert"]
export type MenuItemInsert = Database["public"]["Tables"]["menu_items"]["Insert"]
export type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"]
export type OrderItemInsert = Database["public"]["Tables"]["order_items"]["Insert"]
export type AddressInsert = Database["public"]["Tables"]["addresses"]["Insert"]

// Update types
export type RestaurantUpdate = Database["public"]["Tables"]["restaurants"]["Update"]
export type MenuCategoryUpdate = Database["public"]["Tables"]["menu_categories"]["Update"]
export type MenuItemUpdate = Database["public"]["Tables"]["menu_items"]["Update"]
export type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"]

// Augmented types with relations
export type MenuItemOptionWithChoices = MenuItemOption & {
  choices: MenuItemOptionChoice[]
}

export type MenuItemWithOptions = MenuItem & {
  options: MenuItemOptionWithChoices[]
}

export type MenuCategoryWithItems = MenuCategory & {
  items: MenuItemWithOptions[]
}

export type OrderItemChoiceDetail = {
  id: string
  choice_name: string
  price_modifier: number
  option_id: string
  choice_id: string
}

export type OrderItemWithDetails = OrderItem & {
  choices: OrderItemChoiceDetail[]
}

export type OrderWithItems = Order & {
  items: OrderItemWithDetails[]
  restaurant: Pick<Restaurant, "id" | "name" | "logo_url" | "slug">
}

// Cart types (client-side only)
export type CartItemChoice = {
  option_id: string
  option_name: string
  choice_id: string
  choice_name: string
  price_modifier: number
}

export type CartItem = {
  id: string
  menu_item_id: string
  name: string
  image_url: string | null
  base_price: number
  quantity: number
  choices: CartItemChoice[]
  special_instructions?: string
  unit_price: number
  total_price: number
}

// Promo
export type PromoValidationResult = {
  valid: boolean
  discount_amount: number
  promo_code_id?: string
  error?: string
}

// Checkout
export type CheckoutFormData = {
  order_type: "delivery" | "pickup"
  delivery_address?: {
    label?: string
    address_line1: string
    address_line2?: string
    city: string
    state: string
    postal_code: string
    country: string
    delivery_notes?: string
  }
  contact: {
    name: string
    email: string
    phone: string
  }
  payment_type: "stripe" | "cash"
  special_instructions?: string
  tip_amount?: number
  save_address?: boolean
}

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "picked_up"
  | "cancelled"
  | "refunded"
