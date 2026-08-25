import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Menu } from "lucide-react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"

const SidebarContext = React.createContext(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export const SidebarProvider = React.forwardRef(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)

    const [_open, _setOpen] = React.useState(defaultOpen)
    const open = openProp !== undefined ? openProp : _open
    const setOpen = React.useCallback(
      (value) => {
        const newValue = typeof value === "function" ? value(open) : value
        if (onOpenChange) {
          onOpenChange(newValue)
        } else {
          _setOpen(newValue)
        }
      },
      [onOpenChange, open]
    )

    const toggleSidebar = React.useCallback(() => {
      return isMobile ? setOpenMobile((prev) => !prev) : setOpen((prev) => !prev)
    }, [isMobile, setOpen, setOpenMobile])

    React.useEffect(() => {
      const handleKeyDown = (event) => {
        if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault()
          toggleSidebar()
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <div
          style={{
            "--sidebar-width": "16rem",
            "--sidebar-width-icon": "4rem",
            ...style,
          }}
          className={cn(
            "group/sidebar-wrapper flex min-h-screen w-full text-foreground",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

export const Sidebar = React.forwardRef(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offExamples",
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

    if (isMobile) {
      return (
        <AnimatePresence>
          {openMobile && (
            <>
              {/* Mobile overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpenMobile(false)}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              />
              {/* Mobile Drawer */}
              <motion.aside
                initial={{ x: side === "left" ? "-100%" : "100%" }}
                animate={{ x: 0 }}
                exit={{ x: side === "left" ? "-100%" : "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={cn(
                  "fixed bottom-0 top-0 z-50 flex h-full w-[var(--sidebar-width)] flex-col bg-background border-r p-4 shadow-xl",
                  className
                )}
                ref={ref}
                {...props}
              >
                <div data-slot="sidebar-inner" className="flex h-full w-full flex-col">
                  {children}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      )
    }

    return (
      <motion.aside
        animate={{
          width: state === "expanded" ? "var(--sidebar-width)" : "var(--sidebar-width-icon)",
        }}
        transition={{ type: "spring", damping: 20, stiffness: 150 }}
        className={cn(
          "relative hidden md:flex flex-col shrink-0 border-r bg-background overflow-hidden",
          className
        )}
        ref={ref}
        {...props}
      >
        <div data-slot="sidebar-inner" className="flex h-full w-full flex-col">
          {children}
        </div>
      </motion.aside>
    )
  }
)
Sidebar.displayName = "Sidebar"

export const SidebarTrigger = React.forwardRef(
  ({ className, onClick, ...props }, ref) => {
    const { toggleSidebar } = useSidebar()

    return (
      <Button
        ref={ref}
        variant="ghost"
        size="icon-sm"
        className={cn("h-8 w-8 text-muted-foreground", className)}
        onClick={(event) => {
          onClick?.(event)
          toggleSidebar()
        }}
        {...props}
      >
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
    )
  }
)
SidebarTrigger.displayName = "SidebarTrigger"

export const SidebarInset = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex min-h-screen flex-1 flex-col overflow-x-hidden transition-all duration-300",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

export const SidebarHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col gap-2 p-4", className)} {...props} />
)
SidebarHeader.displayName = "SidebarHeader"

export const SidebarContent = ({ className, ...props }) => (
  <div className={cn("flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-2", className)} {...props} />
)
SidebarContent.displayName = "SidebarContent"

export const SidebarFooter = ({ className, ...props }) => (
  <div className={cn("flex flex-col gap-2 p-4 mt-auto border-t border-border/50", className)} {...props} />
)
SidebarFooter.displayName = "SidebarFooter"

export const SidebarGroup = ({ className, ...props }) => (
  <div className={cn("flex flex-col gap-2 py-2", className)} {...props} />
)
SidebarGroup.displayName = "SidebarGroup"

export const SidebarGroupLabel = ({ className, ...props }) => {
  const { state } = useSidebar()
  if (state === "collapsed") return null
  return (
    <div
      className={cn(
        "px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/75",
        className
      )}
      {...props}
    />
  )
}
SidebarGroupLabel.displayName = "SidebarGroupLabel"

export const SidebarMenu = ({ className, ...props }) => (
  <ul className={cn("flex flex-col gap-1 list-none p-0 m-0", className)} {...props} />
)
SidebarMenu.displayName = "SidebarMenu"

export const SidebarMenuItem = ({ className, ...props }) => (
  <li className={cn("relative", className)} {...props} />
)
SidebarMenuItem.displayName = "SidebarMenuItem"

export const SidebarMenuButton = React.forwardRef(
  ({ asChild = false, isActive = false, tooltip, className, children, ...props }, ref) => {
    const { state } = useSidebar()
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        data-active={isActive}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 outline-none text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
          isActive && "bg-accent text-accent-foreground font-semibold shadow-sm border-l-2 border-primary",
          state === "collapsed" && "justify-center p-2",
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

export const SidebarRail = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute inset-y-0 right-0 w-1 cursor-col-resize hover:bg-accent/50 transition-colors",
      className
    )}
    {...props}
  />
))
SidebarRail.displayName = "SidebarRail"
