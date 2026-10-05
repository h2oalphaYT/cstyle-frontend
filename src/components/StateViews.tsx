import { ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ProductGridSkeleton = ({ count = 8, className = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' }: { count?: number; className?: string }) => (
    <div className={`grid gap-6 ${className}`} aria-busy="true" aria-label="Loading products">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-brand-surface border border-white/6">
                <div className="aspect-[3/4] animate-pulse bg-white/[0.05]" />
                <div className="p-4 space-y-3">
                    <div className="h-2 w-1/3 bg-white/[0.06] animate-pulse" />
                    <div className="h-3 w-3/4 bg-white/[0.08] animate-pulse" />
                    <div className="h-3 w-1/4 bg-white/[0.06] animate-pulse" />
                </div>
            </div>
        ))}
    </div>
);

export const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
    <div className="border border-red-400/20 bg-brand-surface p-10 text-center space-y-4" role="alert">
        <AlertCircle className="w-6 h-6 text-red-400 mx-auto" />
        <p className="text-sm text-white tracking-wide">{message}</p>
        {onRetry && (
            <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 border border-brand-champagne/40 text-brand-champagne px-6 py-2.5 text-xs uppercase tracking-[0.18em] hover:bg-brand-champagne hover:text-brand-black transition-all"
            >
                <RefreshCw className="w-3.5 h-3.5" /> Try Again
            </button>
        )}
    </div>
);

export const EmptyState = ({ title, message, action }: { title: string; message?: string; action?: ReactNode }) => (
    <div className="border border-white/8 p-16 text-center bg-brand-surface">
        <p className="text-brand-champagne text-4xl mb-6">—</p>
        <h3 className="text-lg font-light text-white mb-3 uppercase tracking-[0.2em]">{title}</h3>
        {message && <p className="text-brand-muted text-sm mb-8 tracking-wide">{message}</p>}
        {action}
    </div>
);

export const Spinner = ({ label = 'Loading' }: { label?: string }) => (
    <div className="flex items-center justify-center py-24" role="status" aria-label={label}>
        <div className="w-8 h-8 border border-brand-champagne/30 border-t-brand-champagne rounded-full animate-spin" />
    </div>
);
