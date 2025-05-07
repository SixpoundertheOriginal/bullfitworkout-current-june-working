
import React, { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLayout } from "@/context/LayoutContext";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";

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

  return (
    <div className="flex flex-col h-screen bg-gray-900 will-change-transform">
      {!noHeader && <Header />}
      
      <main className="flex-grow overflow-y-auto pt-16 pb-16 will-change-transform">
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
};
