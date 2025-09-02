import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AllRoutes from "./routes/AllRoutes";



const App = () => (
  
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AllRoutes/>
    </TooltipProvider>
);

export default App;
