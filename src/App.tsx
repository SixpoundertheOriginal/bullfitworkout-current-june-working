
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BottomNav } from "./components/navigation/BottomNav";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TrainingSession from "./pages/TrainingSession";
import WorkoutComplete from "./pages/WorkoutComplete";
import WorkoutDetailsPage from "./pages/WorkoutDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import Auth from "./pages/Auth";
import Training from "./pages/Training";
import { AuthProvider } from "./context/AuthContext";
import { WeightUnitProvider } from "@/context/WeightUnitContext";
import { RouterProvider } from "./context/RouterProvider";

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WeightUnitProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <RouterProvider />
            </TooltipProvider>
          </QueryClientProvider>
        </WeightUnitProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
