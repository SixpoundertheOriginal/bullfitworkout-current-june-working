
import React, { useLayoutEffect } from "react";
import { BottomNav } from "@/components/navigation/BottomNav";
import { PageHeader } from "@/components/navigation/PageHeader";
import { WorkoutBanner } from "@/components/training/WorkoutBanner";
import { useLocation } from "react-router-dom";
import { useLayout } from "@/context/LayoutContext";
import { DateRangeFilter } from "@/components/date-filters/DateRangeFilter";
import { MainMenu } from "@/components/navigation/MainMenu";
import { DevOnly } from "@/components/debug/DevOnly";

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
    case "/developer":
      return "Developer Tools";
    default:
      if (pathname.startsWith("/workout-details")) {
        return "Workout Details";
      }
      return "404";
  }
};

// Determine if page should use scroll-responsive header
const shouldUseScrollResponsiveHeader = (pathname: string): boolean => {
  return ['/all-exercises', '/overview', '/workouts'].includes(pathname);
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
  const useScrollResponsive = shouldUseScrollResponsiveHeader(location.pathname);
  
  // Prevent layout shifts during route changes
  useLayoutEffect(() => {
    const mainContent = document.querySelector('.content-container');
    if (mainContent) {
      mainContent.classList.add('force-no-transition');
      setTimeout(() => mainContent.classList.remove('force-no-transition'), 100);
    }
    if (location.pathname === '/overview') {
      document.body.style.overflow = 'hidden';
      setTimeout(() => { document.body.style.overflow = '' }, 50);
    }
    return () => { document.body.style.overflow = '' };
  }, [location.pathname]);

  // Hide global bottom nav only on workout complete page
  const hideGlobalNavOn = ['/workout-complete'];
  const shouldShowGlobalNav = !noFooter && !hideGlobalNavOn.some(route => location.pathname.startsWith(route));

  return (
    <div className="page-container bg-gray-900 will-change-transform">
      {!noHeader && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <PageHeader 
            title={title} 
            showBackButton={location.pathname !== '/' && location.pathname !== '/overview'}
            scrollResponsive={useScrollResponsive}
          >
            <MainMenu />
            {isFilterVisible && (
              <div className="h-[36px] overflow-hidden">
                <DateRangeFilter />
              </div>
            )}
          </PageHeader>
          <WorkoutBanner />
        </div>
      )}
      
      <main className="flex-grow overflow-y-auto safe-header safe-nav will-change-transform">
        <div className="content-container w-full">
          {children}
        </div>
      </main>
      
      {shouldShowGlobalNav && (
        <div className="nav-fixed">
          <BottomNav />
        </div>
      )}
      
      <DevOnly>
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
      </DevOnly>
    </div>
  );
};
