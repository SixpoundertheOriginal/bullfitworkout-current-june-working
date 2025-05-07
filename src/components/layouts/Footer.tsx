
import React, { memo } from "react";
import { BottomNav } from "@/components/navigation/BottomNav";
import { useLocation } from "react-router-dom";

const Footer: React.FC = () => {
  const location = useLocation();
  
  // Hide global bottom nav on certain pages
  const hideGlobalNavOn = ['/workout-complete'];
  const shouldShowGlobalNav = !hideGlobalNavOn.some(route => location.pathname.startsWith(route));
  
  if (!shouldShowGlobalNav) {
    return null;
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <BottomNav />
    </div>
  );
};

export default memo(Footer);
