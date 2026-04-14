"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export function useRealtimeOrderQueue(restaurantId: string | null) {
  const queryClient = useQueryClient()
  useEffect(() => {
    if (!restaurantId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`restaurant-orders-${restaurantId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${restaurantId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-orders", restaurantId] })
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [restaurantId, queryClient])
}
