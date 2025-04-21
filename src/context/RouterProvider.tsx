
import { useAuth } from "@/context/AuthContext";
import { Navigate, Route, Routes } from "react-router-dom";
import { BottomNav } from "@/components/navigation/BottomNav";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import TrainingSession from "@/pages/TrainingSession";
import WorkoutComplete from "@/pages/WorkoutComplete";
import WorkoutDetailsPage from "@/pages/WorkoutDetailsPage";
import ProfilePage from "@/pages/ProfilePage";
import Auth from "@/pages/Auth";
import Training from "@/pages/Training";

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-black text-white">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return <>{children}</>;
};

export const RouterProvider = () => {
  return (
    <div className="pb-16">
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
        <Route path="/training" element={<ProtectedRoute><Training /></ProtectedRoute>} />
        <Route path="/training-session" element={<ProtectedRoute><TrainingSession /></ProtectedRoute>} />
        <Route path="/workout-complete" element={<ProtectedRoute><WorkoutComplete /></ProtectedRoute>} />
        <Route path="/workout-details" element={<ProtectedRoute><WorkoutDetailsPage /></ProtectedRoute>} />
        <Route path="/workout-details/:workoutId" element={<ProtectedRoute><WorkoutDetailsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <BottomNav />
    </div>
  );
};
