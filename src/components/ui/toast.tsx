'use client'
import * as React from "react"
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const toastVariants = cva(
  "fixed z-50 flex items-center gap-3 p-4 rounded-lg shadow-lg transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-[#2C2C2C] text-white",
        success: "bg-green-600 text-white",
        error: "bg-red-600 text-white",
        loading: "bg-blue-600 text-white",
      },
      position: {
        center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        top: "top-4 left-1/2 -translate-x-1/2",
      }
    },
    defaultVariants: {
      variant: "default",
      position: "top"
    }
  }
)

interface ToastProps extends VariantProps<typeof toastVariants> {
  message: string
  isVisible: boolean
  onClose?: () => void
}

export function Toast({ 
  message, 
  variant, 
  position,
  isVisible, 
  onClose 
}: ToastProps) {
  React.useEffect(() => {
    if (isVisible && onClose) {
      const timer = setTimeout(onClose, 800)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div 
      className={cn(
        toastVariants({ variant, position }),
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {variant === 'success' && <CheckCircle2 className="h-5 w-5" />}
      {variant === 'error' && <XCircle className="h-5 w-5" />}
      {variant === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
      {variant === 'default' && <AlertCircle className="h-5 w-5" />}
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
} 