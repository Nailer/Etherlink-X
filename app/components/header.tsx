import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import Link from "next/link"

export function Header() {
  return (
    <header className="flex items-center justify-between p-6 lg:px-8">
      <div className="flex items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
          </div>
          <span className="text-xl font-bold text-gray-900">JUMPER</span>
        </Link>
      </div>

      <nav className="hidden md:flex items-center space-x-8">
        <Link href="#" className="text-gray-700 hover:text-purple-600 transition-colors">
          Exchange
        </Link>
        <Link href="#" className="text-gray-700 hover:text-purple-600 transition-colors">
          Bridge
        </Link>
        <Link href="#" className="text-gray-700 hover:text-purple-600 transition-colors">
          Gas
        </Link>
        <Link href="#" className="text-gray-700 hover:text-purple-600 transition-colors">
          Docs
        </Link>
      </nav>

      <div className="flex items-center space-x-4">
        <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full">Connect</Button>
        <Button variant="ghost" size="icon" className="md:hidden">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
