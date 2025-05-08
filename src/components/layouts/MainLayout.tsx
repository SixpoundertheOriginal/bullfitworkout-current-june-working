
import React, { useLayoutEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useLayout } from "@/context/LayoutContext";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
  noHeader?: boolean;
  noFooter?: boolean;
  className?: string;
  contentClassName?: string;
}

/**
 * Main layout component that handles application structure and scroll behavior
 */
export const MainLayout = React.memo<MainLayoutProps>(({ 
  children, 
  noHeader = false, 
  noFooter = false,
  className = '',
  contentClassName = ''
}) => {
  const location = useLocation();
  
  // Handle layout transitions and scroll behavior
  useLayoutEffect(() => {
    const mainContent = document.querySelector('.content-container');
    if (mainContent) {
      mainContent.classList.add('force-no-transition');
      setTimeout(() => mainContent.classList.remove('force-no-transition'), 100);
    }
    
    // Special handling for overview page scrolling
    if (location.pathname === '/overview') {
      document.body.style.overflow = 'hidden';
      setTimeout(() => { document.body.style.overflow = '' }, 50);
    }
    
    // Cleanup function to reset overflow
    return () => { document.body.style.overflow = '' };
  }, [location.pathname]);
  
  // Build class names with proper memoization
  const containerClasses = useMemo(() => 
    `flex flex-col h-screen bg-gray-900 will-change-transform ${className}`,
  [className]);
  
  const contentClasses = useMemo(() => 
    `flex-grow overflow-y-auto pt-16 pb-16 will-change-transform ${contentClassName}`,
  [contentClassName]);

  return (
    <div className={containerClasses}>
      {!noHeader && <Header />}
      
      <main className={contentClasses}>
        <div className="content-container w-full">
          {children}
        </div>
      </main>
      
      {!noFooter && <Footer />}
      
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
});

MainLayout.displayName = 'MainLayout';
