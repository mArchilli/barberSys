import { IconX } from '@tabler/icons-react';

export default function MobileNavOverlay({ open, onClose, children }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-brand-nav-bg md:hidden">
            <div className="flex justify-end p-4">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar menú"
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-brand-pill border border-brand-nav-text/30 text-brand-nav-text transition hover:border-brand-nav-active hover:text-brand-nav-active"
                >
                    <IconX size={20} stroke={2} />
                </button>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 pb-16">
                {children}
            </div>
        </div>
    );
}
