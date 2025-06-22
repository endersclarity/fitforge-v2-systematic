/**
 * FitForge Button Components
 * Following the Fitbod-inspired design system
 */

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: 
          "bg-[#FF375F] text-white hover:bg-[#E63050] focus-visible:ring-[#FF375F]/30 active:bg-[#D02040] active:scale-[0.98]",
        secondary: 
          "bg-[#2C2C2E] text-white hover:bg-[#3C3C3E] focus-visible:ring-[#2C2C2E]/50",
        ghost: 
          "hover:bg-[#2C2C2E] hover:text-white focus-visible:ring-[#2C2C2E]/50",
        danger: 
          "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600/30",
        success: 
          "bg-[#10B981] text-white hover:bg-[#059669] focus-visible:ring-[#10B981]/30",
      },
      size: {
        default: "px-6 py-3 text-base",
        sm: "px-4 py-2 text-sm",
        lg: "px-8 py-4 text-lg",
        icon: "h-10 w-10",
        touch: "min-h-[44px] px-6 py-3", // Mobile-optimized touch target
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      fullWidth: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }