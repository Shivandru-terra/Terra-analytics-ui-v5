import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSocket } from "@/context/SocketContext";
import { generalFunctions } from "@/lib/generalFuntion";

export function BrandMenu({ onNewAnalysis }: { onNewAnalysis: (platform: string) => void }) {
  const { setPlatform } = useSocket();
  async function handlePlatform(platform: string){
    try {
      const url = generalFunctions.createUrl(`events/mixpanel/${platform}`);
      const res = await fetch(url);
      const data = await res.json();
      console.log("data chnage platform:", data);
    } catch (error) {
      console.log("error:", error);
    }
  }

  async function handleMenuClick(platform: "ai_games" | "terra") {
    try {
      generalFunctions.setPlatform(platform);
      onNewAnalysis(platform);
      setPlatform(platform);
      await handlePlatform(platform);
    } catch (error) {
      console.log("error:", error);
    }
  }


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
        <DropdownMenuItem className="cursor-pointer" onClick={() => {handleMenuClick("terra")}}>Terra Games</DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onClick={() => {handleMenuClick("ai_games")}}>AI Games</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
