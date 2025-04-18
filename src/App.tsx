import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TrainingSession from "./pages/TrainingSession";
import WorkoutComplete from "./pages/WorkoutComplete";
import WorkoutDetailsPage from "./pages/WorkoutDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import Auth from "./pages/Auth";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { WeightUnitProvider } from "@/context/WeightUnitContext";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    // You could add a loading spinner here
    return <div className="flex items-center justify-center h-screen bg-black text-white">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/training-session" element={<ProtectedRoute><TrainingSession /></ProtectedRoute>} />
      <Route path="/workout-complete" element={<ProtectedRoute><WorkoutComplete /></ProtectedRoute>} />
      <Route path="/workout-details" element={<ProtectedRoute><WorkoutDetailsPage /></ProtectedRoute>} />
      <Route path="/workout-details/:workoutId" element={<ProtectedRoute><WorkoutDetailsPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <WeightUnitProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </WeightUnitProvider>
    </AuthProvider>
  );
}

export default App;
