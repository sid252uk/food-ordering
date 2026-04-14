// POST /api/stripe/create-payment-intent/[slug]
export type CreatePaymentIntentRequest = {
  items: Array<{
    menu_item_id: string
    quantity: number
    choices: Array<{ choice_id: string; option_id: string }>
    special_instructions?: string
  }>
  promo_code?: string
  order_type: "delivery" | "pickup"
  tip_amount?: number
  contact: { name: string; email: string; phone: string }
  delivery_address?: {
    address_line1: string
    address_line2?: string
    city: string
    state: string
    postal_code: string
    country: string
    delivery_notes?: string
  }
  special_instructions?: string
}

export type CreatePaymentIntentResponse = {
  client_secret: string
  payment_intent_id: string
  amount: number
  publishable_key: string
  breakdown: {
    subtotal: number
    delivery_fee: number
    discount_amount: number
    tax_amount: number
    tip_amount: number
    total: number
  }
}

// POST /api/orders (cash on delivery)
export type CreateCashOrderRequest = {
  restaurant_id: string
  items: Array<{
    menu_item_id: string
    quantity: number
    choices: Array<{ choice_id: string; option_id: string }>
    special_instructions?: string
  }>
  promo_code?: string
  order_type: "delivery" | "pickup"
  delivery_address?: {
    address_line1: string
    address_line2?: string
    city: string
    state: string
    postal_code: string
    country: string
    delivery_notes?: string
  }
  contact: { name: string; email: string; phone: string }
  special_instructions?: string
  tip_amount?: number
}

export type CreateCashOrderResponse = {
  order_id: string
  order_number: number
}

// POST /api/promo/validate
export type ValidatePromoRequest = {
  code: string
  restaurant_id: string
  subtotal: number
}

export type ValidatePromoResponse = {
  valid: boolean
  discount_amount: number
  promo_code_id?: string
  error?: string
}

// Admin order status update
export type UpdateOrderStatusRequest = {
  order_id: string
  status: string
}
