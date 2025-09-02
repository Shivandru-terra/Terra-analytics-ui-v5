import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSocket } from "@/context/SocketContext"

export function BrandMenu() {
  const { setPlatform } = useSocket();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 pt-4 cursor-pointer outline-none">
          <img
            src="/letsterra_logo.jpg"
            alt="brandLogo"
            className="w-5 h-5"
          />
          <span className="font-semibold text-lg bg-gradient-primary bg-clip-text text-transparent">
            Analytics AI
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-48">
        <DropdownMenuLabel>Analytics</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={() => setPlatform("terra") }>Terra Games</DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => setPlatform("ai_games") }>AI Games</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
