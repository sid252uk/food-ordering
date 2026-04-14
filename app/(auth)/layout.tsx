import { ShoppingBag } from "lucide-react"
import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <ShoppingBag className="h-7 w-7 text-blue-600" />
        <span className="font-bold text-xl">FoodOrder</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
