"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"

export function useRealtimeOrder(orderId: string | null) {
  const queryClient = useQueryClient()
  useEffect(() => {
    if (!orderId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        (payload) => {
          queryClient.setQueryData(["order", orderId], (old: unknown) =>
            old ? { ...(old as object), ...payload.new } : payload.new
          )
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [orderId, queryClient])
}
