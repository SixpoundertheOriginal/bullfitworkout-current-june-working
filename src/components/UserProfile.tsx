
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { LogOut, User, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function UserProfile() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  if (!user) return null;
  
  // Extract user's initials for the avatar fallback
  const getInitials = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase();
    }
    
    return user.email?.substring(0, 2).toUpperCase() || 'U';
  };
  
  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  const goToProfilePage = () => {
    setOpen(false);
    navigate('/profile');
  };
  
  return (
    <>
      <button onClick={() => setOpen(true)} className="p-2">
        <Avatar>
          <AvatarImage src={user.user_metadata?.avatar_url} />
          <AvatarFallback className="bg-purple-800">{getInitials()}</AvatarFallback>
        </Avatar>
      </button>
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="bg-gray-900 text-white border-gray-800">
          <SheetHeader className="pb-6">
            <SheetTitle className="text-white">Your Profile</SheetTitle>
            <SheetDescription className="text-gray-400">
              Manage your account settings
            </SheetDescription>
          </SheetHeader>
          
          <div className="flex flex-col items-center py-6">
            <Avatar className="h-20 w-20 mb-4">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-purple-800 text-xl">{getInitials()}</AvatarFallback>
            </Avatar>
            
            <h3 className="text-xl font-semibold">
              {user.user_metadata?.full_name || 'User'}
            </h3>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>
          
          <div className="space-y-4 mt-6">
            <Button 
              variant="outline" 
              className="w-full justify-start text-white bg-gray-800 border-gray-700 hover:bg-gray-700"
              onClick={goToProfilePage}
            >
              <User className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start text-white bg-gray-800 border-gray-700 hover:bg-gray-700"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-400 bg-gray-800 border-gray-700 hover:bg-gray-700 hover:text-red-300"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
