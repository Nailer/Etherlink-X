"use client"
import { Button } from "./ui/Button"
import { MoreHorizontal } from "lucide-react"

interface HeaderProps {
  onNavigate: (page: string) => void
}

export function Header({ onNavigate }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-6 lg:px-8">
      <div className="flex items-center">
        <button onClick={() => onNavigate("home")} className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-sm transform rotate-45"></div>
          </div>
          <span className="text-xl font-bold text-gray-900">ETHERLINK-X</span>
        </button>
      </div>

      <nav className="hidden md:flex items-center space-x-8">
        <button
          onClick={() => onNavigate("exchange")}
          className="text-gray-700 hover:text-purple-600 transition-colors"
        >
          Exchange
        </button>
        <button className="text-gray-700 hover:text-purple-600 transition-colors">Bridge</button>
        <button className="text-gray-700 hover:text-purple-600 transition-colors">Gas</button>
        <button className="text-gray-700 hover:text-purple-600 transition-colors">Docs</button>
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
