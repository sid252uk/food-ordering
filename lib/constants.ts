export const ORDER_STATUSES = [
  { value: "pending", label: "Pending", color: "yellow" },
  { value: "accepted", label: "Accepted", color: "blue" },
  { value: "preparing", label: "Preparing", color: "orange" },
  { value: "ready", label: "Ready", color: "green" },
  { value: "out_for_delivery", label: "Out for Delivery", color: "purple" },
  { value: "delivered", label: "Delivered", color: "gray" },
  { value: "picked_up", label: "Picked Up", color: "gray" },
  { value: "cancelled", label: "Cancelled", color: "red" },
  { value: "refunded", label: "Refunded", color: "red" },
] as const

export type OrderStatus = typeof ORDER_STATUSES[number]["value"]

export const CUSTOMER_ORDER_STATUSES: OrderStatus[] = [
  "pending", "accepted", "preparing", "ready", "out_for_delivery", "delivered", "picked_up"
]

export const DIETARY_FLAGS = [
  { key: "is_vegetarian", label: "Vegetarian", emoji: "🥗" },
  { key: "is_vegan", label: "Vegan", emoji: "🌱" },
  { key: "is_gluten_free", label: "Gluten Free", emoji: "🌾" },
  { key: "contains_nuts", label: "Contains Nuts", emoji: "🥜" },
  { key: "is_spicy", label: "Spicy", emoji: "🌶️" },
] as const

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

export const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const

export const DEFAULT_OPERATING_HOURS = Object.fromEntries(
  DAYS_OF_WEEK.map((day) => [day, { open: "09:00", close: "22:00", closed: false }])
)

export const PAYMENT_TYPES = {
  STRIPE: "stripe",
  CASH: "cash",
} as const
