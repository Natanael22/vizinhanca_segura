import { type InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="space-y-2">
                <label className="text-sm font-medium text-primary-700">
                    {label}
                </label>
                <input
                    ref={ref}
                    className={twMerge(
                        clsx(
                            "flex h-12 w-full rounded-lg border border-primary-300 bg-white px-3 py-2 text-primary-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-50",
                            error && "border-red-500 focus-visible:ring-red-500",
                            className
                        )
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-sm text-red-500 animate-pulse">{error}</p>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
