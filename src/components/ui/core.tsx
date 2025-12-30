import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Button
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'destructive'
    size?: 'default' | 'sm' | 'lg'
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        const variants = {
            default: "bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
            outline: "border border-amber-500/50 text-amber-500 hover:bg-amber-500/10",
            ghost: "hover:bg-white/10 text-neutral-300 hover:text-white",
            destructive: "bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/50"
        }
        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-8 px-3 text-xs",
            lg: "h-12 px-8 text-lg"
        }
        return (
            <button
                ref={ref}
                className={cn("inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wider", variants[variant], sizes[size], className)}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

// Input
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm ring-offset-neutral-950 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50 text-white shadow-inner",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

// Card
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("rounded-lg border border-neutral-800 bg-neutral-900/50 text-neutral-200 shadow-sm backdrop-blur-sm", className)} {...props} />
    )
}
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
}
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn("text-lg font-semibold leading-none tracking-tight text-white", className)} {...props} />
}
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("p-6 pt-0", className)} {...props} />
}

// Badge
export function Badge({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' }) {
    const variants = {
        default: "bg-amber-500/20 text-amber-500 border-amber-500/50",
        secondary: "bg-neutral-800 text-neutral-300",
        outline: "text-neutral-300 border border-neutral-700",
        success: "bg-green-500/20 text-green-400 border border-green-500/50",
        warning: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/50",
    }
    return (
        <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variants[variant], className)} {...props} />
    )
}
