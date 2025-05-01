import React, { useLayoutEffect } from "react";
import { BottomNav } from "@/components/navigation/BottomNav";
import { PageHeader } from "@/components/navigation/PageHeader";
import { WorkoutBanner } from "@/components/training/WorkoutBanner";
import { useLocation } from "react-router-dom";
import { useLayout } from "@/context/LayoutContext";
import { DateRangeFilter } from "@/components/date-filters/DateRangeFilter";

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
  const { isFilterVisible } = useLayout();
  const title = getPageTitle(location.pathname);
  
  // Prevent content shifts and flickering by disabling overflow during UI transitions
  useLayoutEffect(() => {
    // Prevent layout shifts by disabling animations on initial render
    const mainContent = document.querySelector('.content-container');
    if (mainContent) {
      // Temporarily disable transitions
      mainContent.classList.add('force-no-transition');
      
      // Re-enable transitions after a short delay
      setTimeout(() => {
        mainContent.classList.remove('force-no-transition');
      }, 100);
    }
    
    // Lock scroll momentarily when navigating to the overview page
    if (location.pathname === '/overview') {
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        document.body.style.overflow = '';
      }, 50);
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [location.pathname]);
  
  return (
    <div className="flex flex-col h-screen bg-gray-900 will-change-transform">
      {!noHeader && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <PageHeader title={title}>
            {isFilterVisible && (
              <div className="h-[36px] overflow-hidden">
                <DateRangeFilter />
              </div>
            )}
          </PageHeader>
          <WorkoutBanner />
        </div>
      )}
      
      <main className="flex-grow overflow-y-auto pt-16 pb-16 will-change-transform">
        <div className="content-container w-full">
          {children}
        </div>
      </main>
      
      {!noFooter && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <BottomNav />
        </div>
      )}
      
      <style>
        {`
        .force-no-transition * {
          transition: none !important;
          animation: none !important;
        }
        
        .content-container {
          min-height: calc(100vh - 48px);
        }
        `}
      </style>
    </div>
  );
};
