import { type InputHTMLAttributes, forwardRef, useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, type, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === 'password';
        const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

        return (
            <div className="space-y-2">
                <label className="text-sm font-medium text-primary-700">
                    {label}
                </label>
                <div className="relative">
                    <input
                        ref={ref}
                        type={inputType}
                        className={twMerge(
                            clsx(
                                "flex h-12 w-full rounded-lg border border-primary-300 bg-white px-3 py-2 text-primary-900 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-50",
                                isPassword && "pr-10",
                                error && "border-red-500 focus-visible:ring-red-500",
                                className
                            )
                        )}
                        {...props}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-400 hover:text-primary-600 focus:outline-none transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    )}
                </div>
                {error && (
                    <p className="text-sm text-red-500 animate-pulse">{error}</p>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
