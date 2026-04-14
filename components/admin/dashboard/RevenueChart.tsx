"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export function RevenueChart({ data }: { data: Array<{ date: string; revenue: number }> }) {
  if (data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">No data yet</div>
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
          <Tooltip formatter={(v) => [`$${Number(v).toFixed(2)}`, "Revenue"]} />
          <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
