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
    case "/design-system":
      return "Design System";
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
  
  // Enhanced layout optimization for App Store quality
  useLayoutEffect(() => {
    const pageContainer = document.querySelector('.page-container');
    if (pageContainer) {
      pageContainer.classList.add('layout-optimized');
      
      // Prevent layout shifts during route changes
      const handleTransitionStart = () => {
        pageContainer.classList.add('transition-lock');
      };
      
      const handleTransitionEnd = () => {
        setTimeout(() => {
          pageContainer.classList.remove('transition-lock');
        }, 100);
      };
      
      handleTransitionStart();
      handleTransitionEnd();
    }
    
    // Safe area handling for mobile devices
    if (location.pathname === '/overview') {
      document.body.style.overflow = 'hidden';
      setTimeout(() => { document.body.style.overflow = '' }, 50);
    }
    
    return () => { 
      document.body.style.overflow = '';
      if (pageContainer) {
        pageContainer.classList.remove('transition-lock', 'layout-optimized');
      }
    };
  }, [location.pathname]);

  // Optimized footer visibility logic
  const shouldShowFooter = !noFooter;

  return (
    <div className="page-container bg-gray-900 will-change-transform min-h-screen flex flex-col">
      {!noHeader && (
        <div className="fixed top-0 left-0 right-0 z-header">
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
      
      <main className={`flex-1 will-change-transform ${noHeader ? '' : 'safe-header'} ${shouldShowFooter ? 'pb-16' : ''}`}>
        <div className="content-container w-full min-h-full">
          {children}
        </div>
      </main>
      
      {shouldShowFooter && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <BottomNav />
        </div>
      )}
      
      <DevOnly>
        <style>
          {`
          .layout-optimized {
            contain: layout style paint;
          }
          .transition-lock * {
            transition: none !important;
            animation: none !important;
          }
          .force-no-transition * {
            transition: none !important;
            animation: none !important;
          }
          .content-container {
            min-height: calc(100vh - 48px);
          }
          
          /* App Store quality optimizations */
          .page-container {
            transform: translateZ(0);
            backface-visibility: hidden;
          }
          
          /* Safe area support for notched devices */
          .safe-header {
            padding-top: calc(env(safe-area-inset-top) + 64px);
          }
          
          /* Battery-efficient scroll handling */
          .content-container {
            -webkit-overflow-scrolling: touch;
            scroll-behavior: smooth;
          }
          
          /* Gesture-friendly navigation zones */
          .footer-stable {
            touch-action: manipulation;
            user-select: none;
            -webkit-user-select: none;
            -webkit-touch-callout: none;
          }
          `}
        </style>
      </DevOnly>
    </div>
  );
};

export default MainLayout;
