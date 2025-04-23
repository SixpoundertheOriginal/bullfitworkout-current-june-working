
"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-gray-900 group-[.toaster]:text-white group-[.toaster]:border-gray-800 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-300",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          error:
            "group-[.toast]:bg-red-900 group-[.toast]:border-red-800 group-[.toast]:text-white",
          success:
            "group-[.toast]:bg-green-900 group-[.toast]:border-green-800 group-[.toast]:text-white",
          warning:
            "group-[.toast]:bg-amber-900 group-[.toast]:border-amber-800 group-[.toast]:text-white",
          info:
            "group-[.toast]:bg-blue-900 group-[.toast]:border-blue-800 group-[.toast]:text-white",
        },
      }}
      {...props}
    />
  );
}

export { toast } from "sonner";
