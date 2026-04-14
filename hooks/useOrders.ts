import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import type { OrderWithItems } from "@/types"

export function useOrder(orderId: string | null) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          items:order_items(*, choices:order_item_choices(*)),
          restaurant:restaurants(id, name, logo_url, slug)
        `)
        .eq("id", orderId!)
        .single()
      if (error) throw error
      return data as OrderWithItems
    },
    enabled: !!orderId,
  })
}

export function useCustomerOrders() {
  return useQuery({
    queryKey: ["customer-orders"],
    queryFn: async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data, error } = await supabase
        .from("orders")
        .select(`*, items:order_items(*), restaurant:restaurants(id, name, logo_url, slug)`)
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)
      if (error) throw error
      return data as OrderWithItems[]
    },
  })
}

export function useAdminOrders(restaurantId: string | null) {
  return useQuery({
    queryKey: ["admin-orders", restaurantId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("orders")
        .select(`*, items:order_items(*, choices:order_item_choices(*))`)
        .eq("restaurant_id", restaurantId!)
        .order("created_at", { ascending: false })
        .limit(100)
      if (error) throw error
      return data as OrderWithItems[]
    },
    enabled: !!restaurantId,
    refetchInterval: 30000,
  })
}

export function useUpdateOrderStatus(restaurantId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const supabase = createClient()
      const updates: Record<string, unknown> = { status }
      if (status === "accepted") updates.accepted_at = new Date().toISOString()
      if (status === "ready") updates.ready_at = new Date().toISOString()
      if (status === "delivered" || status === "picked_up")
        updates.completed_at = new Date().toISOString()
      const { data, error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", orderId)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders", restaurantId] })
    },
  })
}
