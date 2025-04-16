
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { UserProfileForm } from "@/components/UserProfileForm";
import { UserStats } from "@/components/UserStats";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define user profile type
export type UserProfileData = {
  full_name: string | null;
  age: number | null;
  weight: number | null;
  weight_unit: string;
  height: number | null;
  height_unit: string;
  fitness_goal: string | null;
  experience_level: string | null;
};

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching profile", error);
          toast({
            title: "Error",
            description: "Could not load profile data",
            variant: "destructive"
          });
          return;
        }

        if (data) {
          setProfileData(data);
        } else {
          // Initialize with default values
          setProfileData({
            full_name: user.user_metadata?.full_name || null,
            age: null,
            weight: null,
            weight_unit: "kg",
            height: null,
            height_unit: "cm",
            fitness_goal: null,
            experience_level: null
          });
        }
      } catch (err) {
        console.error("Error in fetchUserProfile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, navigate]);

  const handleSaveProfile = async (data: UserProfileData) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_profiles")
        .upsert({ 
          id: user.id, 
          ...data,
          updated_at: new Date().toISOString() 
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  // Extract user's initials for the avatar fallback
  const getInitials = () => {
    if (profileData?.full_name) {
      return profileData.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase();
    }
    
    return user?.email?.substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-800">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="p-2 text-white hover:bg-gray-800"
        >
          <ArrowLeft size={20} />
          <span className="ml-2">Back</span>
        </Button>
        <h1 className="text-xl font-semibold">Your Profile</h1>
        <div className="w-24"></div> {/* Spacer for alignment */}
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <>
            {/* Profile Overview */}
            <div className="mb-10 flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-purple-800 text-2xl">{getInitials()}</AvatarFallback>
              </Avatar>
              
              <h2 className="text-2xl font-bold">
                {profileData?.full_name || user?.email}
              </h2>
              
              <div className="mt-1 text-gray-400">
                {user?.email}
              </div>
              
              {profileData?.fitness_goal && (
                <div className="mt-4 inline-block px-3 py-1 bg-purple-900/50 rounded-full text-sm border border-purple-800">
                  Goal: {profileData.fitness_goal.replace('_', ' ')}
                </div>
              )}
            </div>
            
            <Tabs defaultValue="stats" className="w-full">
              <TabsList className="grid grid-cols-2 bg-gray-800 border-gray-700 mb-6">
                <TabsTrigger value="stats" className="data-[state=active]:bg-gray-700">
                  Stats
                </TabsTrigger>
                <TabsTrigger value="profile" className="data-[state=active]:bg-gray-700">
                  Edit Profile
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="stats" className="mt-0">
                <UserStats />
              </TabsContent>
              
              <TabsContent value="profile" className="mt-0">
                <div className="max-w-lg mx-auto">
                  <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
                  {profileData && (
                    <UserProfileForm 
                      initialData={profileData} 
                      onSubmit={handleSaveProfile}
                    />
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
