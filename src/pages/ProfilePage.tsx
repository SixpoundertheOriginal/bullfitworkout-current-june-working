
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { UserProfileForm } from "@/components/UserProfileForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
      <main className="max-w-lg mx-auto p-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
            {profileData && (
              <UserProfileForm 
                initialData={profileData} 
                onSubmit={handleSaveProfile}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
