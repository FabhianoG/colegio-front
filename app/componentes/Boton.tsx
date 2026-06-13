import React from 'react'

export type BotonVariant =
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'wire'
    | 'ghost'

export type BotonSize = 'sm' | 'md' | 'lg'

export interface BotonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: BotonVariant
    size?: BotonSize
    fullWidth?: boolean
    icon?: React.ReactNode
    iconPosition?: 'left' | 'right'
}

const variantClasses: Record<BotonVariant, string> = {
    primary:
        'border-2 cursor-pointer border-[color:var(--primary)] bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:opacity-90',
    secondary:
        'border-2 cursor-pointer border-[color:var(--secondary)] bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)] hover:opacity-90',
    tertiary:
        'border-2 cursor-pointer border-[color:var(--border)] bg-[color:var(--muted)] text-[color:var(--muted-foreground)] hover:brightness-95',
    wire:
        'border-2 cursor-pointer border-[color:var(--primary)] bg-[color:var(--surface)] text-[color:var(--primary)] shadow-[4px_4px_0_0_rgba(156,163,175,1)] hover:bg-[color:var(--primary)] hover:text-[color:var(--primary-foreground)]',
    ghost:
        'border-2 cursor-pointer border-[color:var(--border)] bg-transparent text-[color:var(--border)] hover:bg-[color:var(--muted)] hover:text-[color:var(--foreground)]',
}

const sizeClasses: Record<BotonSize, string> = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
}

const Boton = React.forwardRef<HTMLButtonElement, BotonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            fullWidth = false,
            icon,
            iconPosition = 'left',
            disabled,
            className = '',
            children,
            ...props
        },
        ref,
    ) => {
        const baseClasses =
            'inline-flex items-center justify-center font-bold uppercase tracking-widest transition-colors duration-200'
        const widthClass = fullWidth ? 'w-full' : 'inline-flex'
        const disabledClasses = disabled
            ? 'opacity-50 cursor-not-allowed hover:bg-none hover:text-current'
            : ''

        const iconGap = icon ? 'gap-2' : ''
        const iconElement = icon ? (
            <span className={iconPosition === 'left' ? 'flex items-center gap-2' : 'flex items-center gap-2'}>
                {iconPosition === 'left' ? <>{icon}</> : null}
                <span>{children}</span>
                {iconPosition === 'right' ? <>{icon}</> : null}
            </span>
        ) : (
            children
        )

        return (
            <button
                ref={ref}
                type="button"
                className={`${widthClass} ${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${iconGap} ${disabledClasses} ${className}`.trim()}
                disabled={disabled}
                {...props}
            >
                {iconElement}
            </button>
        )
    },
)

Boton.displayName = 'Boton'

export default Boton
