
import React from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import { MainMenu } from "./MainMenu";
import { UserProfile } from "../UserProfile";

// Logic for when to show back button
const navTabPaths = ["/", "/training", "/profile", "/all-exercises"];

export interface PageHeaderProps {
  title: string;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, className = "" }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Only show back if not in main tabs
  const showBackButton = !navTabPaths.includes(location.pathname);

  // Smart logic: if user lands on a page directly via tab, don't offer "back"
  // If they navigated deeper, offer back
  const handleBack = () => {
    // If user is on a details page, go back.
    if (location.pathname.startsWith("/workout-details")) {
      navigate("/training");
    } else if (location.pathname !== "/" && location.pathname !== "/training" && location.pathname !== "/profile" && location.pathname !== "/all-exercises") {
      navigate(-1);
    } else {
      // fallback
      navigate("/");
    }
  };

  return (
    <header className={"fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800/20 shadow-sm " + className}>
      <div className="flex justify-between items-center p-4 max-w-screen-xl mx-auto">
        <div className="flex items-center">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2"
              onClick={handleBack}
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5 text-gray-300" />
            </Button>
          )}
          <MainMenu />
        </div>
        <h1 className="text-xl font-semibold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
          {title}
        </h1>
        <UserProfile />
      </div>
    </header>
  );
};

