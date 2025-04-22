
import { useAuth } from "@/context/AuthContext";
import { Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { BottomNav } from "@/components/navigation/BottomNav";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import TrainingSession from "@/pages/TrainingSession";
import WorkoutComplete from "@/pages/WorkoutComplete";
import WorkoutDetailsPage from "@/pages/WorkoutDetailsPage";
import ProfilePage from "@/pages/ProfilePage";
import Auth from "@/pages/Auth";
import Training from "@/pages/Training";
import { MainMenu } from "@/components/navigation/MainMenu";
import { UserProfile } from "@/components/UserProfile";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import AllExercisesPage from "@/pages/AllExercisesPage";

const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case "/":
      return "Today";
    case "/training":
      return "Training";
    case "/profile":
      return "Profile";
    case "/training-session":
      return "Workout";
    case "/workout-complete":
      return "Workout Complete";
    case "/all-exercises":
      return "All Exercises";
    default:
      if (pathname.startsWith("/workout-details")) {
        return "Workout Details";
      }
      return "404";
  }
};

// Define pages where back navigation is safe
const safeBackNavigationPaths = [
  "/training-session",
  "/workout-complete",
  "/workout-details",
  "/all-exercises"
];

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
  const location = useLocation();
  const navigate = useNavigate();
  const title = getPageTitle(location.pathname);
  
  // Show back button on all pages except the main navigation tabs
  const showBackButton = !["/", "/training", "/profile"].includes(location.pathname);
  
  // Handle back navigation with safety checks
  const handleBackNavigation = () => {
    // For certain paths, we know it's safe to use history.back()
    const currentPath = location.pathname;
    
    // Check if we're on a path where back navigation is safe
    const isSafeBackNavigation = safeBackNavigationPaths.some(path => 
      currentPath === path || currentPath.startsWith(path + "/")
    );
    
    if (isSafeBackNavigation) {
      navigate(-1);
    } else {
      // For other paths, use predetermined navigation targets for safer UX
      if (currentPath.startsWith("/workout-details")) {
        navigate("/training");
      } else if (currentPath === "/all-exercises") {
        navigate("/training");
      } else {
        // Default to home as fallback
        navigate("/");
      }
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900 backdrop-blur-sm border-b border-gray-800/20 shadow-sm">
        <div className="flex justify-between items-center p-4 max-w-screen-xl mx-auto">
          <div className="flex items-center">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={handleBackNavigation}
                aria-label="Go back"
              >
                <ChevronLeft className="h-5 w-5 text-gray-300" />
              </Button>
            )}
            <MainMenu />
          </div>
          <h1 className="text-xl font-semibold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            {title}
          </h1>
          <UserProfile />
        </div>
      </header>
      <div className="pt-16 pb-16">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/training" element={<ProtectedRoute><Training /></ProtectedRoute>} />
          <Route path="/training-session" element={<ProtectedRoute><TrainingSession /></ProtectedRoute>} />
          <Route path="/workout-complete" element={<ProtectedRoute><WorkoutComplete /></ProtectedRoute>} />
          <Route path="/workout-details" element={<ProtectedRoute><WorkoutDetailsPage /></ProtectedRoute>} />
          <Route path="/workout-details/:workoutId" element={<ProtectedRoute><WorkoutDetailsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/all-exercises" element={<ProtectedRoute><AllExercisesPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNav />
      </div>
    </div>
  );
};
