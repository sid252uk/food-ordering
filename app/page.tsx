import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, BarChart3, Clock, Smartphone, Star, Zap } from "lucide-react"

const features = [
  { icon: ShoppingBag, title: "Beautiful Menu Builder", description: "Create a stunning online menu with photos, customisable options, dietary labels, and category ordering." },
  { icon: Zap, title: "Real-Time Order Queue", description: "Accept and manage orders in real time. Your kitchen sees new orders the moment they come in." },
  { icon: Clock, title: "Order Tracking", description: "Customers get a live status timeline — from the moment they order to when it's ready or delivered." },
  { icon: Smartphone, title: "Mobile-First Checkout", description: "Seamless checkout for delivery or pickup. Pay online with card/Apple Pay, or cash on delivery." },
  { icon: BarChart3, title: "Analytics Dashboard", description: "Daily revenue, top items, order trends, and peak times at a glance." },
  { icon: Star, title: "Promo Codes & Reviews", description: "Create discount codes to drive orders and collect customer reviews to build trust." },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 bg-white/80 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg">FoodOrder</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link href="/onboard"><Button size="sm">Get Started Free</Button></Link>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-b from-blue-50 to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4" variant="secondary">Multi-restaurant SaaS platform</Badge>
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
            Your restaurant,<br /><span className="text-blue-600">online in minutes</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            FoodOrder gives food businesses a fully-featured online ordering system — beautiful menu, Stripe payments, real-time order management, and email notifications. No commission on orders.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/onboard"><Button size="lg" className="px-8">Start your free store</Button></Link>
            <Link href="/demo-restaurant"><Button size="lg" variant="outline" className="px-8">View live demo</Button></Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">No credit card required · Set up in under 5 minutes</p>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need to take orders online</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              One platform, zero commission. Customers order from your page at{" "}
              <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">yoursite.com/your-restaurant</code>.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <Card key={f.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <f.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{f.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-blue-600 py-16 px-4 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to start taking orders?</h2>
        <p className="text-blue-100 mb-8 max-w-xl mx-auto">
          Create your restaurant page in minutes. Add your menu, set up payments, and share your link.
        </p>
        <Link href="/onboard"><Button size="lg" variant="secondary" className="px-10">Create your restaurant</Button></Link>
      </section>

      <footer className="border-t py-8 px-4 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} FoodOrder. Built with Next.js and Supabase.</p>
      </footer>
    </div>
  )
}
