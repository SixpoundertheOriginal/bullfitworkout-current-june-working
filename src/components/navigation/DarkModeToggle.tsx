
import React, { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from "lucide-react";

const getInitialTheme = () => {
  if (typeof window === "undefined") return "light";
  if (localStorage.theme === "dark") return "dark";
  if (localStorage.theme === "light") return "light";
  // Fallback to media preference
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export function DarkModeToggle() {
  const [theme, setTheme] = useState(getInitialTheme());

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  }, [theme]);

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-800/70 mt-8">
      <Sun className="w-5 h-5 text-yellow-400" />
      <Switch
        checked={theme === "dark"}
        onCheckedChange={val => setTheme(val ? "dark" : "light")}
        aria-label="Toggle dark mode"
      />
      <Moon className="w-5 h-5 text-purple-300" />
      <span className="ml-2 text-sm text-gray-300">
        {theme === "dark" ? "Dark" : "Light"}
      </span>
    </div>
  );
}
