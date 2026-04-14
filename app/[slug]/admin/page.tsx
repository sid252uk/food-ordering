import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { ShoppingBag, DollarSign, Clock, TrendingUp } from "lucide-react"
import { RevenueChart } from "@/components/admin/dashboard/RevenueChart"
import { RecentOrders } from "@/components/admin/dashboard/RecentOrders"

export default async function AdminDashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id, name")
    .eq("slug", slug)
    .single()

  if (!restaurant) return null

  // Today's stats
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { data: todayOrders } = await supabase
    .from("orders")
    .select("total_amount, status, created_at")
    .eq("restaurant_id", restaurant.id)
    .gte("created_at", todayStart.toISOString())

  const totalRevenue = (todayOrders ?? []).filter((o) => !["cancelled", "refunded"].includes(o.status)).reduce((s, o) => s + o.total_amount, 0)
  const totalOrders = (todayOrders ?? []).length
  const pendingOrders = (todayOrders ?? []).filter((o) => o.status === "pending").length
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Last 7 days for chart
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const { data: weekOrders } = await supabase
    .from("orders")
    .select("total_amount, created_at, status")
    .eq("restaurant_id", restaurant.id)
    .gte("created_at", sevenDaysAgo.toISOString())
    .not("status", "in", '("cancelled","refunded")')

  // Group by day
  const revenueByDay: Record<string, number> = {}
  ;(weekOrders ?? []).forEach((o) => {
    const day = new Date(o.created_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    revenueByDay[day] = (revenueByDay[day] ?? 0) + o.total_amount
  })
  const chartData = Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue }))

  // Recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, order_number, total_amount, status, order_type, created_at, guest_name")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const stats = [
    { label: "Today's revenue", value: formatCurrency(totalRevenue), icon: DollarSign, color: "text-green-600" },
    { label: "Today's orders", value: totalOrders.toString(), icon: ShoppingBag, color: "text-blue-600" },
    { label: "Pending orders", value: pendingOrders.toString(), icon: Clock, color: "text-orange-600" },
    { label: "Avg order value", value: formatCurrency(avgOrder), icon: TrendingUp, color: "text-purple-600" },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Revenue (last 7 days)</CardTitle></CardHeader>
            <CardContent>
              <RevenueChart data={chartData} />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader><CardTitle className="text-base">Recent orders</CardTitle></CardHeader>
            <CardContent>
              <RecentOrders orders={recentOrders ?? []} restaurantSlug={slug} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
