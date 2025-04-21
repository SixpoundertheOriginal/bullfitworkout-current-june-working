
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"

export const MainMenu = () => {
  return (
    <Sheet>
      <SheetTrigger className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors">
        <div className="w-6 h-0.5 bg-white/90 mb-1"></div>
        <div className="w-6 h-0.5 bg-white/90 mb-1"></div>
        <div className="w-6 h-0.5 bg-white/90"></div>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] bg-gray-900 border-gray-800 text-white">
        <nav className="space-y-4 mt-8">
          <a href="/" className="flex items-center space-x-2 px-4 py-2 rounded hover:bg-gray-800 transition-colors">
            <span>Home</span>
          </a>
          <a href="/training" className="flex items-center space-x-2 px-4 py-2 rounded hover:bg-gray-800 transition-colors">
            <span>Training</span>
          </a>
          <a href="/profile" className="flex items-center space-x-2 px-4 py-2 rounded hover:bg-gray-800 transition-colors">
            <span>Profile</span>
          </a>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
