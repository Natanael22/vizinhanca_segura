import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        const variants = {
            primary: 'bg-accent-500 text-white hover:bg-accent-600 shadow-md',
            secondary: 'bg-primary-800 text-white hover:bg-primary-700',
            outline: 'border border-primary-300 bg-transparent hover:bg-primary-50 text-primary-700',
            ghost: 'bg-transparent hover:bg-primary-100 text-primary-700',
        };

        const sizes = {
            sm: 'h-9 px-3 text-xs',
            md: 'h-12 px-6 text-sm',
            lg: 'h-14 px-8 text-base',
        };

        return (
            <button
                ref={ref}
                className={twMerge(
                    clsx(
                        "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
                        variants[variant],
                        sizes[size],
                        className
                    )
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
