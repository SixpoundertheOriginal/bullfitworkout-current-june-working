
import { MainMenu } from "./MainMenu";
import { UserProfile } from "@/components/UserProfile";
import { useLocation } from "react-router-dom";

const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case "/":
      return "Today";
    case "/training":
      return "Training";
    case "/profile":
      return "Profile";
    case "/training-session":
      return "Workout";
    case "/workout-complete":
      return "Workout Complete";
    default:
      if (pathname.startsWith("/workout-details")) {
        return "Workout Details";
      }
      return "404";
  }
};

export const HeaderBar = () => {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800/50">
      <MainMenu />
      <h1 className="text-xl font-semibold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
        {title}
      </h1>
      <UserProfile />
    </header>
  );
};
