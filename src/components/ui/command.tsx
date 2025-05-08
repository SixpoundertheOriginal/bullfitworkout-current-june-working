import * as React from "react"
import { type DialogProps } from "@radix-ui/react-dialog"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"

// Create Context to store command state behavior overrides
interface CommandContextValue {
  shouldCloseOnSelect?: boolean
}

const CommandContext = React.createContext<CommandContextValue>({
  shouldCloseOnSelect: true,
})

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive> & {
    shouldCloseOnSelect?: boolean
  }
>(({ className, shouldCloseOnSelect = true, ...props }, ref) => (
  <CommandContext.Provider value={{ shouldCloseOnSelect }}>
    <CommandPrimitive
      ref={ref}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-gray-900 text-white",
        className
      )}
      {...props}
    />
  </CommandContext.Provider>
))
Command.displayName = CommandPrimitive.displayName

interface CommandDialogProps extends DialogProps {}

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg bg-gray-900">
        <Command
          className={
            // Updated selector for our new data attribute
            "[&_[cmdk-group-heading]]:px-2 " +
            "[&_[cmdk-group-heading]]:font-medium " +
            "[&_[cmdk-group-heading]]:text-muted-foreground " +
            "[&_cmdk-group:not([hidden])_~_cmdk-group]:pt-0 " +
            "[&_cmdk-group]:px-2 " +
            "[&_cmdk-input-wrapper]_svg:h-5 " +
            "[&_cmdk-input-wrapper]_svg:w-5 " +
            "[&_cmdk-input]:h-12 " +
            "[&_cmdk-item]:px-2 " +
            "[&_cmdk-item]:py-3 " +
            "[&_cmdk-item]_svg:h-5 " +
            "[&_cmdk-item]_svg:w-5"
          }
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div
    data-cmdk-input-wrapper
    className="flex items-center border-b border-gray-700 px-3"
  >
    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50 text-white",
        className
      )}
      {...props}
    />
  </div>
))
CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
))
CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm text-gray-400"
    {...props}
  />
))
CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group> & {
    heading?: React.ReactNode
    commandItems?: React.ReactNode[]
  }
>(({ className, heading, commandItems, children, ...props }, ref) => {
  const content = React.useMemo(() => {
    if (children) return children
    if (commandItems && Array.isArray(commandItems)) return commandItems
    return null
  }, [children, commandItems])

  return (
    <CommandPrimitive.Group
      ref={ref}
      heading={heading}
      className={cn(
        "overflow-hidden p-1 text-white " +
          "[&_cmdk-group-heading]:px-2 " +
          "[&_cmdk-group-heading]:py-1.5 " +
          "[&_cmdk-group-heading]:text-xs " +
          "[&_cmdk-group-heading]:font-medium " +
          "[&_cmdk-group-heading]:text-gray-400",
        className
      )}
      {...props}
    >
      {content}
    </CommandPrimitive.Group>
  )
})
CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-gray-700", className)}
    {...props}
  />
))
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, onSelect, ...props }, ref) => {
  const { shouldCloseOnSelect } = React.useContext(CommandContext)

  const handleSelect = React.useCallback(
    (value: string) => {
      if (!onSelect) return

      const result = onSelect(value)

      const shouldPreventClose =
        shouldCloseOnSelect === false ||
        (typeof result === "boolean" && result === false)

      if (shouldPreventClose) {
        // Grab the native event from globalThis
        const evt = (globalThis as any).event as Event | undefined
        evt?.stopPropagation()
        evt?.preventDefault()
      }
    },
    [onSelect, shouldCloseOnSelect]
  )

  return (
    <CommandPrimitive.Item
      ref={ref}
      onSelect={handleSelect}
      className={cn(
        "relative flex cursor-default select-none items-center " +
          "rounded-sm px-2 py-1.5 text-sm outline-none " +
          "data-[disabled=true]:pointer-events-none " +
          "data-[selected='true']:bg-gray-800 data-[selected=true]:text-white " +
          "data-[disabled=true]:opacity-50",
        className
      )}
      {...props}
    />
  )
})
CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn("ml-auto text-xs tracking-widest text-gray-400", className)}
    {...props}
  />
)
CommandShortcut.displayName = "CommandShortcut"

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
