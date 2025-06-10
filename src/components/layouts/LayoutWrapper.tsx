
import React, { useLayoutEffect } from "react";
import { MainLayout } from "./MainLayout";
import { ErrorBoundary } from "../ErrorBoundary";
import { useLocation } from "react-router-dom";

interface LayoutConfig {
  noHeader?: boolean;
  noFooter?: boolean;
  headerTitle?: string;
  headerActions?: React.ReactNode;
  preventScroll?: boolean;
  customClassName?: string;
}

interface LayoutWrapperProps {
  children: React.ReactNode;
  config?: LayoutConfig;
}

export const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ 
  children, 
  config = {} 
}) => {
  const location = useLocation();
  
  // Scroll position restoration
  useLayoutEffect(() => {
    if (!config.preventScroll) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, config.preventScroll]);

  // Prevent layout shifts during route changes
  useLayoutEffect(() => {
    const mainContent = document.querySelector('.layout-content');
    if (mainContent) {
      mainContent.classList.add('force-no-transition');
      const timer = setTimeout(() => {
        mainContent.classList.remove('force-no-transition');
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return (
    <ErrorBoundary>
      <div className="layout-content">
        <MainLayout 
          noHeader={config.noHeader}
          noFooter={config.noFooter}
        >
          <div className={config.customClassName}>
            {children}
          </div>
        </MainLayout>
      </div>
    </ErrorBoundary>
  );
};
