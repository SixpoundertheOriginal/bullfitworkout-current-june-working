
import React, { memo } from "react";
import { useLocation } from "react-router-dom";
import { PageHeader } from "@/components/navigation/PageHeader";
import { DateRangeFilter } from "@/components/date-filters/DateRangeFilter";
import { MainMenu } from "@/components/navigation/MainMenu";
import { WorkoutBanner } from "@/components/training/WorkoutBanner";
import { useLayout } from "@/context/LayoutContext";

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

const Header: React.FC = () => {
  const location = useLocation();
  const { isFilterVisible } = useLayout();
  const title = getPageTitle(location.pathname);
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <PageHeader title={title} showBackButton={location.pathname !== '/' && location.pathname !== '/overview'}>
        <MainMenu />
        {isFilterVisible && (
          <div className="h-[36px] overflow-hidden">
            <DateRangeFilter />
          </div>
        )}
      </PageHeader>
      <WorkoutBanner />
    </div>
  );
};

export default memo(Header);
