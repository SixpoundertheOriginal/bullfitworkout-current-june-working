
import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  Moon, 
  Plus, 
  User, 
  X, 
  Zap 
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [showWorkouts, setShowWorkouts] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [trainingType, setTrainingType] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [duration, setDuration] = useState(30);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const startTraining = () => {
    if (!trainingType) {
      toast({
        title: "Training type required",
        description: "Please select a training type to continue",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Training started!",
      description: `${trainingType} session for ${duration} minutes`,
    });
    
    setDialogOpen(false);
  };

  const toggleWorkoutDisplay = () => {
    setShowWorkouts(!showWorkouts);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* App Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-800">
        <button className="p-2">
          <div className="w-6 h-0.5 bg-white mb-1"></div>
          <div className="w-6 h-0.5 bg-white mb-1"></div>
          <div className="w-6 h-0.5 bg-white"></div>
        </button>
        <h1 className="text-xl font-semibold">Today</h1>
        <button className="p-2">
          <User size={24} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto px-4 py-6">
        {/* Progress Banner */}
        <div className="mb-8 rounded-xl p-6 bg-gradient-to-r from-purple-600 to-pink-500">
          <p className="text-xl font-medium">
            You've logged 3 workouts this week! <span role="img" aria-label="fire">🔥</span> Keep it up!
          </p>
        </div>

        {/* Training Session Section */}
        <section className="mb-10 text-center">
          <h2 className="text-2xl font-bold mb-2">Start Your Training</h2>
          <p className="text-gray-400 mb-6">Focus today's session and get into flow mode</p>
          
          {/* Training Info */}
          <div className="bg-gray-900 rounded-lg p-4 mb-6 mx-auto max-w-xs">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Type:</span>
              <span>{trainingType || "Not selected"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tags:</span>
              <span>{selectedTags.length > 0 ? selectedTags.join(", ") : "None"}</span>
            </div>
          </div>
          
          {/* Start Button */}
          <button 
            onClick={() => setDialogOpen(true)}
            className="h-32 w-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex flex-col items-center justify-center mx-auto shadow-lg hover:shadow-purple-500/20 transition-all"
          >
            <Zap size={28} className="mb-1" />
            <span className="text-xl font-semibold">Start</span>
          </button>
        </section>

        {/* Workout Log Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-purple-500" size={20} />
              <h2 className="text-xl font-bold">Workout Log</h2>
            </div>
            <Button 
              onClick={toggleWorkoutDisplay} 
              variant="outline" 
              className="text-sm"
            >
              {showWorkouts ? "Hide" : "Show"}
            </Button>
          </div>

          {showWorkouts ? (
            <div className="space-y-4">
              <WorkoutCard 
                type="Running" 
                date="Today" 
                duration="32 min" 
                tags={["Cardio", "Outdoors"]} 
              />
              <WorkoutCard 
                type="Strength Training" 
                date="Yesterday" 
                duration="45 min" 
                tags={["Upper Body", "Weights"]} 
              />
              <WorkoutCard 
                type="Yoga" 
                date="Apr 14" 
                duration="60 min" 
                tags={["Flexibility", "Recovery"]} 
              />
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-900 rounded-lg">
              <p className="text-gray-400 mb-2">No workouts logged yet</p>
              <p className="text-sm text-gray-500">Complete a training session to see it here</p>
            </div>
          )}
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="grid grid-cols-4 border-t border-gray-800 bg-black">
        <NavButton icon={<Clock size={20} />} label="Today" active />
        <NavButton icon={<BarChart3 size={20} />} label="Progress" />
        <NavButton icon={<Moon size={20} />} label="Recovery" />
        <NavButton icon={<User size={20} />} label="Profile" />
      </nav>

      {/* Training Setup Dialog - Only shown when dialogOpen is true */}
      {dialogOpen && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl w-full max-w-md relative overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Configure Training</h2>
                  <button 
                    onClick={() => setDialogOpen(false)}
                    className="p-1 rounded-full hover:bg-gray-800"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Training Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Training Type</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g., Running, Yoga, HIIT..."
                      value={trainingType}
                      onChange={(e) => setTrainingType(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {trainingType && (
                      <button
                        onClick={() => setTrainingType("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        <X size={16} className="text-gray-400" />
                      </button>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <SuggestionChip label="Running" onClick={() => setTrainingType("Running")} />
                    <SuggestionChip label="Strength" onClick={() => setTrainingType("Strength")} />
                    <SuggestionChip label="Yoga" onClick={() => setTrainingType("Yoga")} />
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    <TagChip 
                      label="Cardio" 
                      selected={selectedTags.includes("Cardio")} 
                      onClick={() => handleTagToggle("Cardio")} 
                    />
                    <TagChip 
                      label="Strength" 
                      selected={selectedTags.includes("Strength")} 
                      onClick={() => handleTagToggle("Strength")} 
                    />
                    <TagChip 
                      label="Flexibility" 
                      selected={selectedTags.includes("Flexibility")} 
                      onClick={() => handleTagToggle("Flexibility")} 
                    />
                    <TagChip 
                      label="Recovery" 
                      selected={selectedTags.includes("Recovery")} 
                      onClick={() => handleTagToggle("Recovery")} 
                    />
                    <TagChip 
                      label="Outdoors" 
                      selected={selectedTags.includes("Outdoors")} 
                      onClick={() => handleTagToggle("Outdoors")} 
                    />
                  </div>
                </div>

                {/* Duration */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                  <ToggleGroup type="single" value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value || "30"))}>
                    <ToggleGroupItem value="15" className="w-1/4">15</ToggleGroupItem>
                    <ToggleGroupItem value="30" className="w-1/4">30</ToggleGroupItem>
                    <ToggleGroupItem value="45" className="w-1/4">45</ToggleGroupItem>
                    <ToggleGroupItem value="60" className="w-1/4">60</ToggleGroupItem>
                  </ToggleGroup>
                </div>

                {/* Quick Setup */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Quick Setup</label>
                  <div className="grid grid-cols-2 gap-3">
                    <QuickSetupCard 
                      title="Morning Cardio" 
                      description="30min running session" 
                      onClick={() => {
                        setTrainingType("Running");
                        setSelectedTags(["Cardio", "Morning"]);
                        setDuration(30);
                      }}
                    />
                    <QuickSetupCard 
                      title="Full Body" 
                      description="45min strength workout" 
                      onClick={() => {
                        setTrainingType("Strength");
                        setSelectedTags(["Strength", "Full Body"]);
                        setDuration(45);
                      }}
                    />
                  </div>
                </div>

                {/* Start Button */}
                <Button 
                  onClick={startTraining}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white py-3 rounded-lg font-medium"
                >
                  Start Training
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* Floating Action Button */}
      <button className="fixed bottom-20 right-4 h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center shadow-lg z-10">
        <Plus size={24} />
      </button>
    </div>
  );
};

// Helper Components
const NavButton = ({ icon, label, active = false }) => {
  return (
    <button className={`flex flex-col items-center justify-center py-3 ${active ? 'text-white' : 'text-gray-500'}`}>
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

const WorkoutCard = ({ type, date, duration, tags }) => {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{type}</h3>
            <div className="flex items-center text-gray-400 text-sm mt-1">
              <Calendar size={14} className="mr-1" />
              <span>{date}</span>
              <Clock size={14} className="ml-3 mr-1" />
              <span>{duration}</span>
            </div>
          </div>
          <div className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">
            Completed
          </div>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span key={index} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const TagChip = ({ label, selected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm ${
        selected
          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
          : "bg-gray-800 text-gray-400 border border-gray-700"
      }`}
    >
      {label}
    </button>
  );
};

const SuggestionChip = ({ label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-full text-xs bg-gray-800 text-gray-300"
    >
      {label}
    </button>
  );
};

const QuickSetupCard = ({ title, description, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-gray-800 rounded-lg p-3 text-left hover:bg-gray-750 transition-colors border border-gray-700"
    >
      <h4 className="font-medium text-sm">{title}</h4>
      <p className="text-gray-400 text-xs mt-1">{description}</p>
    </button>
  );
};

export default Index;
