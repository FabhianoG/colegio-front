'use client'

import React from 'react'

export type EtiquetaVariant =
    | 'success'
    | 'warning'
    | 'danger'
    | 'neutral'
    | 'outline'

export interface EtiquetasProps {
    variant?: EtiquetaVariant
    children: React.ReactNode
    className?: string
}

const variantStyles: Record<EtiquetaVariant, string> = {
    success:
        'bg-[color:var(--success)] text-[color:var(--background)] border-transparent',
    warning:
        'bg-[color:var(--warning)] text-[color:var(--background)] border-transparent',
    danger: 'bg-[color:var(--danger)] text-[color:var(--background)] border-transparent',
    neutral:
        'bg-[color:var(--surface)] text-[color:var(--foreground)] border-[color:var(--border)]',
    outline:
        'bg-[color:var(--foreground)] text-[color:var(--background)] border-[color:var(--border)]',
}

const Etiquetas: React.FC<EtiquetasProps> = ({
    variant = 'neutral',
    children,
    className = '',
}) => {
    return (
        <span
            className={`inline-flex items-center border px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] ${variantStyles[variant]} ${className}`.trim()}
        >
            {children}
        </span>
    )
}

export default Etiquetas
