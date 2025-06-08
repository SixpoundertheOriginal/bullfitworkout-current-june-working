
import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useScroll } from "@/hooks/useScroll";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  children?: React.ReactNode;
  scrollResponsive?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  showBackButton = false, 
  onBack,
  children,
  scrollResponsive = false
}) => {
  const navigate = useNavigate();
  const { isScrolled, scrollDirection } = useScroll(20);
  
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const shouldHideOnScroll = scrollResponsive && isScrolled && scrollDirection === 'down';

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 h-16 flex items-center px-4 bg-gray-900/95 backdrop-blur-sm z-10 border-b border-gray-800/50",
      "transition-transform duration-300 ease-out",
      shouldHideOnScroll ? "-translate-y-full" : "translate-y-0"
    )}>
      <div className="flex-1 flex items-center min-w-0">
        {showBackButton && (
          <button 
            onClick={handleBack} 
            className="mr-2 p-2 -ml-2 hover:bg-gray-800/50 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <h1 className="text-xl font-bold truncate">{title}</h1>
      </div>
      {children && (
        <div className="flex items-center ml-2">
          {children}
        </div>
      )}
    </header>
  );
};
