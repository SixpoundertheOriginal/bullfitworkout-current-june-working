
import React from "react";
import { BottomNav } from "@/components/navigation/BottomNav";
import { PageHeader } from "@/components/navigation/PageHeader";
import { WorkoutBanner } from "@/components/training/WorkoutBanner";
import { useLocation } from "react-router-dom";

// Function to get page title based on the current route
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

interface MainLayoutProps {
  children: React.ReactNode;
  noHeader?: boolean;
  noFooter?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  noHeader = false, 
  noFooter = false 
}) => {
  const location = useLocation();
  const title = getPageTitle(location.pathname);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      {!noHeader && <PageHeader title={title} />}
      <WorkoutBanner />
      
      <main className="flex-grow pt-16 pb-16">
        {children}
      </main>
      
      {!noFooter && <BottomNav />}
    </div>
  );
};
