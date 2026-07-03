import { IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

export default function MobileNavOverlay({ open, onClose, children }) {
    const [mounted, setMounted] = useState(open);
    const [revealed, setRevealed] = useState(open);

    useEffect(() => {
        if (open) {
            setMounted(true);
            // Doble rAF: garantiza que el navegador pinte el estado "cerrado"
            // antes de aplicar el estado "abierto", para que el clip-path anime.
            const frame = requestAnimationFrame(() => requestAnimationFrame(() => setRevealed(true)));
            return () => cancelAnimationFrame(frame);
        }

        setRevealed(false);
        const timeout = setTimeout(() => setMounted(false), 300);
        return () => clearTimeout(timeout);
    }, [open]);

    if (!mounted) return null;

    return (
        <div
            className={
                'fixed inset-0 z-50 flex flex-col overflow-y-auto bg-brand-nav-bg transition-[clip-path] duration-300 ease-in-out motion-reduce:transition-none md:hidden ' +
                (revealed
                    ? '[clip-path:circle(150%_at_calc(100%-2.375rem)_2.375rem)]'
                    : '[clip-path:circle(0%_at_calc(100%-2.375rem)_2.375rem)]')
            }
        >
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
