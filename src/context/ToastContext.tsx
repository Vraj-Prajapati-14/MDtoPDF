'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextValue {
    toast: (opts: Omit<Toast, 'id'>) => void;
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
    confirm: (message: string) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextValue>({
    toast: () => { },
    success: () => { },
    error: () => { },
    warning: () => { },
    info: () => { },
    confirm: () => Promise.resolve(false),
});

const ICONS = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const COLORS = {
    success: { icon: '#4ade80', border: 'rgba(74,222,128,0.25)', bg: 'rgba(74,222,128,0.08)' },
    error: { icon: '#f87171', border: 'rgba(248,113,113,0.25)', bg: 'rgba(248,113,113,0.08)' },
    warning: { icon: '#fbbf24', border: 'rgba(251,191,36,0.25)', bg: 'rgba(251,191,36,0.08)' },
    info: { icon: '#60a5fa', border: 'rgba(96,165,250,0.25)', bg: 'rgba(96,165,250,0.08)' },
};

// ----- Confirm Modal -----
interface ConfirmModalProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

function ConfirmModal({ message, onConfirm, onCancel }: ConfirmModalProps) {
    return (
        <div className="toast-confirm-backdrop" onClick={onCancel}>
            <div className="toast-confirm-box" onClick={e => e.stopPropagation()}>
                <div className="toast-confirm-icon">
                    <AlertTriangle size={28} color="#fbbf24" />
                </div>
                <p className="toast-confirm-msg">{message}</p>
                <div className="toast-confirm-actions">
                    <button className="toast-confirm-cancel" onClick={onCancel}>Cancel</button>
                    <button className="toast-confirm-ok" onClick={onConfirm}>Continue</button>
                </div>
            </div>
        </div>
    );
}

// ----- Toast Item -----
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
    const [exiting, setExiting] = useState(false);
    const Icon = ICONS[toast.type];
    const colors = COLORS[toast.type];
    const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

    const dismiss = useCallback(() => {
        setExiting(true);
        setTimeout(() => onRemove(toast.id), 320);
    }, [toast.id, onRemove]);

    useEffect(() => {
        timerRef.current = setTimeout(dismiss, toast.duration ?? 4000);
        return () => clearTimeout(timerRef.current);
    }, [dismiss, toast.duration]);

    return (
        <div
            className={`toast-item ${exiting ? 'toast-exit' : 'toast-enter'}`}
            style={{
                borderColor: colors.border,
                background: `var(--bg-secondary)`,
                borderLeftColor: colors.icon,
            }}
            role="alert"
        >
            <span className="toast-type-bar" style={{ background: colors.icon }} />
            <Icon size={18} color={colors.icon} className="toast-icon" />
            <div className="toast-body">
                <span className="toast-title">{toast.title}</span>
                {toast.message && <span className="toast-message">{toast.message}</span>}
            </div>
            <button className="toast-close" onClick={dismiss} aria-label="Dismiss">
                <X size={14} />
            </button>
        </div>
    );
}

// ----- Provider -----
export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [confirmState, setConfirmState] = useState<{
        message: string;
        resolve: (v: boolean) => void;
    } | null>(null);

    const remove = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((opts: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).slice(2);
        setToasts(prev => [...prev.slice(-4), { ...opts, id }]);
    }, []);

    const success = useCallback((title: string, message?: string) =>
        addToast({ type: 'success', title, message }), [addToast]);
    const error = useCallback((title: string, message?: string) =>
        addToast({ type: 'error', title, message, duration: 5000 }), [addToast]);
    const warning = useCallback((title: string, message?: string) =>
        addToast({ type: 'warning', title, message }), [addToast]);
    const info = useCallback((title: string, message?: string) =>
        addToast({ type: 'info', title, message }), [addToast]);

    const confirm = useCallback((message: string): Promise<boolean> => {
        return new Promise(resolve => {
            setConfirmState({ message, resolve });
        });
    }, []);

    const handleConfirm = () => {
        confirmState?.resolve(true);
        setConfirmState(null);
    };
    const handleCancel = () => {
        confirmState?.resolve(false);
        setConfirmState(null);
    };

    return (
        <ToastContext.Provider value={{ toast: addToast, success, error, warning, info, confirm }}>
            {children}

            {/* Toast Container */}
            <div className="toast-container" aria-live="polite">
                {toasts.map(t => (
                    <ToastItem key={t.id} toast={t} onRemove={remove} />
                ))}
            </div>

            {/* Confirm Modal */}
            {confirmState && (
                <ConfirmModal
                    message={confirmState.message}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}

            <style>{`
                /* ===== TOAST SYSTEM ===== */
                .toast-container {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    pointer-events: none;
                }
                .toast-item {
                    pointer-events: all;
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    min-width: 300px;
                    max-width: 400px;
                    padding: 14px 16px 14px 0;
                    border-radius: 12px;
                    border: 1px solid;
                    border-left: 4px solid;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                    backdrop-filter: blur(16px);
                    font-family: var(--font-primary);
                    position: relative;
                    overflow: hidden;
                }
                .toast-type-bar {
                    display: none;
                }
                .toast-icon {
                    flex-shrink: 0;
                    margin-left: 14px;
                    margin-top: 1px;
                }
                .toast-body {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .toast-title {
                    font-size: 0.88rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }
                .toast-message {
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    line-height: 1.4;
                }
                .toast-close {
                    background: none;
                    border: none;
                    color: var(--text-tertiary);
                    cursor: pointer;
                    padding: 2px;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    transition: color 0.15s, background 0.15s;
                    flex-shrink: 0;
                    align-self: flex-start;
                }
                .toast-close:hover {
                    color: var(--text-primary);
                    background: rgba(255,255,255,0.08);
                }
                /* Animations */
                @keyframes toastIn {
                    from { opacity: 0; transform: translateX(40px) scale(0.95); }
                    to   { opacity: 1; transform: translateX(0) scale(1); }
                }
                @keyframes toastOut {
                    from { opacity: 1; transform: translateX(0) scale(1); }
                    to   { opacity: 0; transform: translateX(40px) scale(0.95); }
                }
                .toast-enter { animation: toastIn 0.28s cubic-bezier(0.16,1,0.3,1) forwards; }
                .toast-exit  { animation: toastOut 0.28s ease forwards; }

                /* ===== CONFIRM MODAL ===== */
                .toast-confirm-backdrop {
                    position: fixed;
                    inset: 0;
                    z-index: 10000;
                    background: rgba(0,0,0,0.65);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.15s ease;
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                .toast-confirm-box {
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 16px;
                    padding: 32px 28px 24px;
                    max-width: 380px;
                    width: 90%;
                    box-shadow: 0 24px 64px rgba(0,0,0,0.5);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    animation: slideUp 0.2s cubic-bezier(0.16,1,0.3,1);
                }
                @keyframes slideUp { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform:none; } }
                .toast-confirm-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background: rgba(251,191,36,0.12);
                    border: 1px solid rgba(251,191,36,0.25);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .toast-confirm-msg {
                    font-size: 0.95rem;
                    color: var(--text-secondary);
                    text-align: center;
                    line-height: 1.5;
                    font-family: var(--font-primary);
                    margin: 0;
                }
                .toast-confirm-actions {
                    display: flex;
                    gap: 10px;
                    width: 100%;
                }
                .toast-confirm-cancel,
                .toast-confirm-ok {
                    flex: 1;
                    padding: 10px 0;
                    border-radius: 8px;
                    font-size: 0.88rem;
                    font-weight: 600;
                    cursor: pointer;
                    border: none;
                    font-family: var(--font-primary);
                    transition: opacity 0.15s, transform 0.15s;
                }
                .toast-confirm-cancel:hover, .toast-confirm-ok:hover {
                    opacity: 0.85;
                    transform: translateY(-1px);
                }
                .toast-confirm-cancel {
                    background: var(--bg-tertiary);
                    color: var(--text-secondary);
                    border: 1px solid var(--border-color);
                }
                .toast-confirm-ok {
                    background: linear-gradient(135deg, #667EEA, #764BA2);
                    color: #fff;
                }
            `}</style>
        </ToastContext.Provider>
    );
}

export function useToast() {
    return useContext(ToastContext);
}
