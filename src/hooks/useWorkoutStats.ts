
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

// Define an interface for the workout data structure from Supabase
interface WorkoutSession {
  id: string;
  user_id: string;
  name: string;
  training_type: string;
  start_time: string;
  end_time: string;
  duration: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  tags?: string[]; // Added tags as optional property
}

export interface WorkoutTypeStats {
  type: string;
  count: number;
  totalDuration: number;
  percentage: number;
  // Add time of day distribution
  timeOfDay: {
    morning: number;   // 5am-11am
    afternoon: number; // 11am-5pm
    evening: number;   // 5pm-10pm
    night: number;     // 10pm-5am
  };
  // Add average duration
  averageDuration: number;
}

export interface TopExerciseStats {
  exerciseName: string;
  count: number;
  totalSets: number;
  averageWeight: number;
  totalVolume: number;
  // Add preferred tags association
  associatedTags: string[];
}

export interface TagStats {
  name: string;
  count: number;
  category: 'strength' | 'cardio' | 'recovery' | 'flexibility' | 'other';
  associatedTypes: string[];
  timeOfDay: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
}

export interface TimePatternStats {
  preferredDuration: number;
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  durationByTimeOfDay: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  // Day of week patterns
  daysFrequency: {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  };
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalDuration: number;
  avgDuration: number;
  totalExercises: number;
  totalSets: number;
  topExercises: TopExerciseStats[];
  workoutTypes: WorkoutTypeStats[];
  lastWorkoutDate: string | null;
  streakDays: number;
  // New analytics
  tags: TagStats[];
  timePatterns: TimePatternStats;
  // Personalized recommendations
  recommendedType: string | null;
  recommendedDuration: number | null;
  recommendedTags: string[];
}

export function useWorkoutStats(limit: number = 50) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WorkoutStats>({
    totalWorkouts: 0,
    totalDuration: 0,
    avgDuration: 0,
    totalExercises: 0,
    totalSets: 0,
    topExercises: [],
    workoutTypes: [],
    lastWorkoutDate: null,
    streakDays: 0,
    // Initialize new analytics
    tags: [],
    timePatterns: {
      preferredDuration: 30,
      preferredTimeOfDay: 'evening',
      durationByTimeOfDay: {
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0
      },
      daysFrequency: {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0
      }
    },
    recommendedType: null,
    recommendedDuration: null,
    recommendedTags: []
  });

  useEffect(() => {
    async function fetchWorkoutStats() {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch all workouts
        const { data: workouts, error: workoutsError } = await supabase
          .from('workout_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('start_time', { ascending: false })
          .limit(limit);
          
        if (workoutsError) throw workoutsError;
        
        if (!workouts || workouts.length === 0) {
          setLoading(false);
          return;
        }
        
        // Cast the workouts to the WorkoutSession type
        const typedWorkouts = workouts as WorkoutSession[];
        
        // Fetch exercise sets for these workouts
        const workoutIds = typedWorkouts.map(w => w.id);
        const { data: exerciseSets, error: setsError } = await supabase
          .from('exercise_sets')
          .select('*')
          .in('workout_id', workoutIds);
          
        if (setsError) throw setsError;
        
        // Calculate basic stats
        const totalWorkouts = typedWorkouts.length;
        const totalDuration = typedWorkouts.reduce((sum, w) => sum + w.duration, 0);
        const avgDuration = totalDuration / totalWorkouts;
        const lastWorkoutDate = typedWorkouts[0]?.start_time || null;
        
        // Calculate workout types distribution with time of day analysis
        const typeCount: Record<string, { 
          count: number; 
          duration: number; 
          morning: number; 
          afternoon: number; 
          evening: number; 
          night: number;
          totalDuration: number;
        }> = {};
        
        typedWorkouts.forEach(workout => {
          const type = workout.training_type;
          const hour = new Date(workout.start_time).getHours();
          const timeOfDay = 
            hour >= 5 && hour < 11 ? 'morning' :
            hour >= 11 && hour < 17 ? 'afternoon' :
            hour >= 17 && hour < 22 ? 'evening' : 'night';
          
          if (!typeCount[type]) {
            typeCount[type] = { 
              count: 0, 
              duration: 0, 
              morning: 0, 
              afternoon: 0, 
              evening: 0, 
              night: 0,
              totalDuration: 0
            };
          }
          
          typeCount[type].count++;
          typeCount[type].duration += workout.duration;
          typeCount[type][timeOfDay]++;
          typeCount[type].totalDuration += workout.duration;
        });
        
        const workoutTypes: WorkoutTypeStats[] = Object.entries(typeCount).map(([type, data]) => ({
          type,
          count: data.count,
          totalDuration: data.totalDuration,
          percentage: (data.count / totalWorkouts) * 100,
          timeOfDay: {
            morning: data.morning,
            afternoon: data.afternoon,
            evening: data.evening,
            night: data.night
          },
          averageDuration: data.duration / data.count
        })).sort((a, b) => b.count - a.count);
        
        // Calculate exercise stats
        const exerciseData: Record<string, { 
          count: number; 
          sets: number; 
          totalWeight: number;
          totalReps: number;
          tags: Set<string>;
        }> = {};
        
        // Extract all tags used across workouts - handle case where tags might not exist
        const allTags = typedWorkouts.flatMap(w => w.tags || []).filter(Boolean);
        const tagMap: Record<string, {
          count: number;
          types: Set<string>;
          morning: number;
          afternoon: number;
          evening: number;
          night: number;
          category: 'strength' | 'cardio' | 'recovery' | 'flexibility' | 'other';
        }> = {};
        
        // Process tags from workouts
        typedWorkouts.forEach(workout => {
          const hour = new Date(workout.start_time).getHours();
          const timeOfDay = 
            hour >= 5 && hour < 11 ? 'morning' :
            hour >= 11 && hour < 17 ? 'afternoon' :
            hour >= 17 && hour < 22 ? 'evening' : 'night';
          
          // Handle case where tags might not exist
          const tags = workout.tags || [];
          tags.forEach(tag => {
            if (!tag) return;
            
            if (!tagMap[tag]) {
              // Determine category based on tag name (simplified logic)
              let category: 'strength' | 'cardio' | 'recovery' | 'flexibility' | 'other' = 'other';
              const tagLower = tag.toLowerCase();
              
              if (tagLower.includes('strength') || tagLower.includes('weight') || 
                  tagLower.includes('muscle') || tagLower.includes('lift')) {
                category = 'strength';
              } else if (tagLower.includes('cardio') || tagLower.includes('run') || 
                         tagLower.includes('endurance') || tagLower.includes('hiit')) {
                category = 'cardio';
              } else if (tagLower.includes('recovery') || tagLower.includes('rest') || 
                         tagLower.includes('stretch') || tagLower.includes('massage')) {
                category = 'recovery';
              } else if (tagLower.includes('flex') || tagLower.includes('mobility') || 
                         tagLower.includes('yoga') || tagLower.includes('stretch')) {
                category = 'flexibility';
              }
              
              tagMap[tag] = {
                count: 0,
                types: new Set(),
                morning: 0,
                afternoon: 0,
                evening: 0,
                night: 0,
                category
              };
            }
            
            tagMap[tag].count++;
            tagMap[tag].types.add(workout.training_type);
            tagMap[tag][timeOfDay]++;
          });
        });
        
        // Process exercise sets
        exerciseSets?.forEach(set => {
          const name = set.exercise_name;
          const workout = typedWorkouts.find(w => w.id === set.workout_id);
          // Handle case where tags might not exist
          const tags = workout?.tags || [];
          
          if (!exerciseData[name]) {
            exerciseData[name] = { 
              count: 0, 
              sets: 0, 
              totalWeight: 0, 
              totalReps: 0,
              tags: new Set()
            };
          }
          
          exerciseData[name].count++;
          exerciseData[name].sets++;
          exerciseData[name].totalWeight += set.weight;
          exerciseData[name].totalReps += set.reps;
          
          // Associate tags with exercises
          tags.forEach(tag => {
            if (tag) exerciseData[name].tags.add(tag);
          });
        });
        
        const topExercises: TopExerciseStats[] = Object.entries(exerciseData)
          .map(([exerciseName, data]) => ({
            exerciseName,
            count: data.count,
            totalSets: data.sets,
            averageWeight: data.totalWeight / data.sets,
            totalVolume: data.totalWeight * data.totalReps,
            associatedTags: Array.from(data.tags)
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
          
        // Calculate unique exercises and total sets
        const totalExercises = Object.keys(exerciseData).length;
        const totalSets = exerciseSets?.length || 0;
        
        // Process tag statistics
        const tags: TagStats[] = Object.entries(tagMap)
          .map(([name, data]) => ({
            name,
            count: data.count,
            category: data.category,
            associatedTypes: Array.from(data.types),
            timeOfDay: {
              morning: data.morning,
              afternoon: data.afternoon,
              evening: data.evening,
              night: data.night
            }
          }))
          .sort((a, b) => b.count - a.count);
          
        // Calculate time patterns
        const timePatterns: TimePatternStats = {
          preferredDuration: avgDuration,
          preferredTimeOfDay: 'evening', // Default
          durationByTimeOfDay: {
            morning: 0,
            afternoon: 0,
            evening: 0,
            night: 0
          },
          daysFrequency: {
            monday: 0,
            tuesday: 0,
            wednesday: 0,
            thursday: 0,
            friday: 0,
            saturday: 0,
            sunday: 0
          }
        };
        
        // Time of day analysis
        const timeOfDayCount = { morning: 0, afternoon: 0, evening: 0, night: 0 };
        const timeOfDayDuration = { morning: 0, afternoon: 0, evening: 0, night: 0 };
        
        // Day of week analysis
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayCount = { 
          monday: 0, tuesday: 0, wednesday: 0, thursday: 0, 
          friday: 0, saturday: 0, sunday: 0 
        };
        
        typedWorkouts.forEach(workout => {
          const date = new Date(workout.start_time);
          const hour = date.getHours();
          const day = dayNames[date.getDay()];
          
          const timeOfDay = 
            hour >= 5 && hour < 11 ? 'morning' :
            hour >= 11 && hour < 17 ? 'afternoon' :
            hour >= 17 && hour < 22 ? 'evening' : 'night';
          
          timeOfDayCount[timeOfDay]++;
          timeOfDayDuration[timeOfDay] += workout.duration;
          dayCount[day]++;
        });
        
        // Find preferred time of day
        let maxCount = 0;
        Object.entries(timeOfDayCount).forEach(([time, count]) => {
          if (count > maxCount) {
            maxCount = count;
            timePatterns.preferredTimeOfDay = time as any;
          }
          
          // Calculate average duration by time of day
          if (count > 0) {
            timePatterns.durationByTimeOfDay[time] = timeOfDayDuration[time] / count;
          }
        });
        
        timePatterns.daysFrequency = dayCount;
        
        // Calculate workout streak
        let streakDays = 0;
        if (typedWorkouts.length > 0) {
          // Convert dates to YYYY-MM-DD format for comparison
          const workoutDates = typedWorkouts.map(w => 
            new Date(w.start_time).toISOString().split('T')[0]
          );
          
          // Remove duplicates (multiple workouts on same day)
          const uniqueDates = [...new Set(workoutDates)].sort();
          
          // Check for consecutive days
          const today = new Date().toISOString().split('T')[0];
          if (uniqueDates[0] === today) {
            streakDays = 1;
            
            for (let i = 1; i < uniqueDates.length; i++) {
              const currentDate = new Date(uniqueDates[i-1]);
              currentDate.setDate(currentDate.getDate() - 1);
              const expectedPrevious = currentDate.toISOString().split('T')[0];
              
              if (uniqueDates[i] === expectedPrevious) {
                streakDays++;
              } else {
                break;
              }
            }
          }
        }
        
        // Generate personalized recommendations
        // 1. Recommended type based on time of day and frequency
        const now = new Date();
        const currentHour = now.getHours();
        const currentDay = dayNames[now.getDay()];
        
        const currentTimeOfDay = 
          currentHour >= 5 && currentHour < 11 ? 'morning' :
          currentHour >= 11 && currentHour < 17 ? 'afternoon' :
          currentHour >= 17 && currentHour < 22 ? 'evening' : 'night';
          
        // Find most common workout type for this time of day
        let recommendedType = null;
        let maxTypeCount = 0;
        
        workoutTypes.forEach(type => {
          if (type.timeOfDay[currentTimeOfDay] > maxTypeCount) {
            maxTypeCount = type.timeOfDay[currentTimeOfDay];
            recommendedType = type.type;
          }
        });
        
        // If no strong preference for current time, use most frequent overall
        if (maxTypeCount < 2 && workoutTypes.length > 0) {
          recommendedType = workoutTypes[0].type;
        }
        
        // 2. Recommended duration based on time of day pattern
        let recommendedDuration = timePatterns.durationByTimeOfDay[currentTimeOfDay] || avgDuration;
        
        // Round to nearest 5 minutes
        recommendedDuration = Math.round(recommendedDuration / 5) * 5;
        
        // If no data for current time, use average
        if (recommendedDuration === 0) {
          recommendedDuration = Math.round(avgDuration / 5) * 5;
        }
        
        // 3. Recommended tags based on training type and time of day
        const recommendedTags: string[] = [];
        
        if (recommendedType) {
          // Find tags most commonly associated with the recommended type
          tags.forEach(tag => {
            if (tag.associatedTypes.includes(recommendedType) && 
                tag.timeOfDay[currentTimeOfDay] > 0) {
              recommendedTags.push(tag.name);
            }
          });
          
          // Limit to top 3 most relevant tags
          recommendedTags.sort((a, b) => {
            const tagA = tagMap[a];
            const tagB = tagMap[b];
            return (tagB?.count || 0) - (tagA?.count || 0);
          }).slice(0, 3);
        }
        
        setStats({
          totalWorkouts,
          totalDuration,
          avgDuration,
          totalExercises,
          totalSets,
          topExercises,
          workoutTypes,
          lastWorkoutDate,
          streakDays,
          tags,
          timePatterns,
          recommendedType,
          recommendedDuration,
          recommendedTags
        });
      } catch (error) {
        console.error('Error fetching workout stats:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchWorkoutStats();
  }, [user, limit]);
  
  return { stats, loading };
}
