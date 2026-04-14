import { z } from "zod"

// ---------------------------------------------------------------------------
// Restaurant
// ---------------------------------------------------------------------------

export const restaurantSchema = z.object({
  name: z.string().min(1, "Restaurant name is required"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address"),
  // Address fields
  address_line1: z.string().min(1, "Street address is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().optional(),
})

export type RestaurantFormValues = z.infer<typeof restaurantSchema>

// Settings form (used on /admin/settings — extends with operational fields)
export const restaurantSettingsSchema = z.object({
  name: z.string().min(1, "Restaurant name is required"),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
  accepts_delivery: z.boolean().optional(),
  accepts_pickup: z.boolean().optional(),
  delivery_fee: z.number().min(0).optional(),
  min_order_amount: z.number().min(0).optional(),
  estimated_delivery_minutes: z.number().int().positive().optional(),
  estimated_pickup_minutes: z.number().int().positive().optional(),
  tax_rate: z.number().min(0).max(100).optional(),
  stripe_publishable_key: z.string().optional(),
  timezone: z.string().optional(),
})

export type RestaurantSettingsFormValues = z.infer<typeof restaurantSettingsSchema>

// ---------------------------------------------------------------------------
// Menu Category
// ---------------------------------------------------------------------------

export const menuCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
})

export type MenuCategoryFormValues = z.infer<typeof menuCategorySchema>

// ---------------------------------------------------------------------------
// Menu Item Options
// ---------------------------------------------------------------------------

export const menuItemOptionChoiceSchema = z.object({
  name: z.string().min(1, "Choice name is required"),
  price_modifier: z.number().default(0),
  display_order: z.number().int().default(0),
})

export type MenuItemOptionChoiceFormValues = z.infer<typeof menuItemOptionChoiceSchema>

export const menuItemOptionSchema = z.object({
  name: z.string().min(1, "Option name is required"),
  selection_type: z.enum(["single", "multiple"]),
  is_required: z.boolean(),
  min_selections: z.number().int().min(0),
  max_selections: z.number().int().positive().optional(),
  choices: z.array(menuItemOptionChoiceSchema),
})

export type MenuItemOptionFormValues = z.infer<typeof menuItemOptionSchema>

// ---------------------------------------------------------------------------
// Menu Item
// ---------------------------------------------------------------------------

export const menuItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  base_price: z.number().positive("Price must be greater than 0"),
  category_id: z.string().uuid("Invalid category"),
  // Dietary flags
  is_vegetarian: z.boolean().optional(),
  is_vegan: z.boolean().optional(),
  is_gluten_free: z.boolean().optional(),
  contains_nuts: z.boolean().optional(),
  is_spicy: z.boolean().optional(),
  // Display
  is_featured: z.boolean().optional(),
  // Modifier options
  options: z.array(menuItemOptionSchema).optional(),
})

export type MenuItemFormValues = z.infer<typeof menuItemSchema>

// ---------------------------------------------------------------------------
// Address
// ---------------------------------------------------------------------------

export const addressSchema = z.object({
  label: z.string().optional(),
  address_line1: z.string().min(1, "Street address is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().optional(),
  delivery_notes: z.string().optional(),
})

export type AddressFormValues = z.infer<typeof addressSchema>

// ---------------------------------------------------------------------------
// Checkout
// ---------------------------------------------------------------------------

export const checkoutSchema = z
  .object({
    order_type: z.enum(["delivery", "pickup"]),
    delivery_address: addressSchema.optional(),
    contact: z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email("Invalid email address"),
      phone: z.string().min(1, "Phone number is required"),
    }),
    payment_type: z.enum(["stripe", "cash"]),
    special_instructions: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.order_type === "delivery" && !data.delivery_address) {
        return false
      }
      return true
    },
    {
      message: "Delivery address is required for delivery orders",
      path: ["delivery_address"],
    }
  )

export type CheckoutFormValues = z.infer<typeof checkoutSchema>

// ---------------------------------------------------------------------------
// Promo Code
// ---------------------------------------------------------------------------

export const promoCodeSchema = z.object({
  code: z
    .string()
    .min(1, "Promo code is required")
    .transform((val) => val.toUpperCase()),
  description: z.string().optional(),
  promo_type: z.enum(["percentage", "fixed_amount"]),
  discount_value: z.number().positive("Discount value must be greater than 0"),
  min_order_amount: z.number().optional(),
  max_uses: z.number().int().positive().optional(),
  starts_at: z.string().optional(),
  expires_at: z.string().optional(),
})

export type PromoCodeFormValues = z.infer<typeof promoCodeSchema>

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  marketing_opt_in: z.boolean().optional(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export type SignInFormValues = z.infer<typeof signInSchema>

export const signUpSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type SignUpFormValues = z.infer<typeof signUpSchema>
