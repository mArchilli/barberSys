import { IconHelpCircle } from '@tabler/icons-react';

export default function TourRestartButton({ onClick, className = '' }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label="Ver tutorial de esta pantalla"
            title="Ver tutorial de esta pantalla"
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-surface text-brand-text-secondary transition hover:border-brand-primary/20 hover:bg-brand-primary/5 hover:text-brand-link ${className}`}
        >
            <IconHelpCircle size={22} stroke={1.8} />
        </button>
    );
}
