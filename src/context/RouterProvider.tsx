import { useAuth } from "@/context/AuthContext";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { BottomNav } from "@/components/navigation/BottomNav";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import TrainingSessionPage from "@/pages/TrainingSession";
import WorkoutComplete from "@/pages/WorkoutComplete";
import WorkoutDetailsPage from "@/pages/WorkoutDetailsPage";
import ProfilePage from "@/pages/ProfilePage";
import Auth from "@/pages/Auth";
import AllExercisesPage from "@/pages/AllExercisesPage";
import { PageHeader } from "@/components/navigation/PageHeader";
import { OverviewPage } from "@/pages/Overview";
import { WorkoutManagementPage } from "@/pages/WorkoutManagementPage";

const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case "/":
      return "Today";
    case "/overview":
      return "Overview";
    case "/profile":
      return "Profile";
    case "/training-session":
      return "Workout";
    case "/workout-complete":
      return "Workout Complete";
    case "/all-exercises":
      return "All Exercises";
    case "/workouts":
      return "Workouts";
    default:
      if (pathname.startsWith("/workout-details")) {
        return "Workout Details";
      }
      return "404";
  }
};

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
  const title = getPageTitle(location.pathname);
  const isAuthPage = location.pathname === "/auth";

  return (
    <div className="bg-gray-900 min-h-screen">
      {!isAuthPage && <PageHeader title={title} />}

      <div className={!isAuthPage ? "pt-16 pb-16" : ""}>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/overview" element={<ProtectedRoute><OverviewPage /></ProtectedRoute>} />
          <Route path="/workouts" element={<ProtectedRoute><WorkoutManagementPage /></ProtectedRoute>} />
          <Route path="/training-session" element={<ProtectedRoute><TrainingSessionPage /></ProtectedRoute>} />
          <Route path="/workout-complete" element={<ProtectedRoute><WorkoutComplete /></ProtectedRoute>} />
          <Route path="/workout-details" element={<ProtectedRoute><WorkoutDetailsPage /></ProtectedRoute>} />
          <Route path="/workout-details/:workoutId" element={<ProtectedRoute><WorkoutDetailsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/all-exercises" element={<ProtectedRoute><AllExercisesPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {!isAuthPage && <BottomNav />}
      </div>
    </div>
  );
};
