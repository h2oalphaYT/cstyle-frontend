import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, X, XCircle, AlertTriangle } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
    id: number;
    type: NotificationType;
    title: string;
    message?: string;
}

interface NotificationContextType {
    notify: (type: NotificationType, title: string, message?: string) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotify = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotify must be used within a NotificationProvider');
    return ctx;
};

const ICONS = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    error: <XCircle className="w-4 h-4 text-red-400" />,
    info: <Info className="w-4 h-4 text-brand-champagne" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
};

/** Storefront toast notifications (order placed, failures, stock changes...). */
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<Notification[]>([]);
    const nextId = useRef(1);

    const dismiss = useCallback((id: number) => setItems(prev => prev.filter(n => n.id !== id)), []);

    const notify = useCallback((type: NotificationType, title: string, message?: string) => {
        const id = nextId.current++;
        setItems(prev => [...prev.slice(-3), { id, type, title, message }]);
        setTimeout(() => dismiss(id), type === 'error' ? 6000 : 3500);
    }, [dismiss]);

    const value = useMemo(() => ({
        notify,
        success: (t: string, m?: string) => notify('success', t, m),
        error: (t: string, m?: string) => notify('error', t, m),
        info: (t: string, m?: string) => notify('info', t, m),
        warning: (t: string, m?: string) => notify('warning', t, m),
    }), [notify]);

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <div className="fixed z-[300] bottom-4 right-4 left-4 sm:left-auto sm:w-96 flex flex-col gap-2 pointer-events-none" aria-live="polite">
                <AnimatePresence>
                    {items.map(n => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, y: 20, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 40 }}
                            transition={{ duration: 0.25 }}
                            className="pointer-events-auto bg-brand-surface border border-white/10 shadow-2xl px-4 py-3 flex items-start gap-3"
                            role={n.type === 'error' ? 'alert' : 'status'}
                        >
                            <div className="mt-0.5">{ICONS[n.type]}</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-white uppercase tracking-[0.12em]">{n.title}</p>
                                {n.message && <p className="text-xs text-brand-muted mt-1 leading-relaxed">{n.message}</p>}
                            </div>
                            <button onClick={() => dismiss(n.id)} className="text-brand-muted hover:text-white" aria-label="Dismiss">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};
