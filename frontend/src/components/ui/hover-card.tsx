import * as React from "react"
import { cn } from "@/lib/utils"

const HoverCardContext = React.createContext<{ open: boolean }>({ open: false })

const HoverCard = ({ children, openDelay = 100, closeDelay = 100 }: { children: React.ReactNode; openDelay?: number; closeDelay?: number }) => {
  const [open, setOpen] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setOpen(true), openDelay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setOpen(false), closeDelay)
  }

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <HoverCardContext.Provider value={{ open }}>
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="relative">
        {children}
      </div>
    </HoverCardContext.Provider>
  )
}

const HoverCardTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, children, asChild, ...props }, ref) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, { ref, ...props })
  }
  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  )
})
HoverCardTrigger.displayName = "HoverCardTrigger"

const HoverCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { side?: "top" | "right" | "bottom" | "left"; align?: "start" | "center" | "end"; sideOffset?: number }
>(({ className, side = "right", align = "center", sideOffset = 4, children, ...props }, ref) => {
  const { open } = React.useContext(HoverCardContext)
  
  if (!open) return null

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 rounded-md border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 shadow-lg",
        sideClasses[side], // Aplica las clases de posicionamiento
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
HoverCardContent.displayName = "HoverCardContent"

export { HoverCard, HoverCardTrigger, HoverCardContent }
