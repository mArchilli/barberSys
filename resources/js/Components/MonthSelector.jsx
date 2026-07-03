import { router } from '@inertiajs/react';

function shiftMonth(month, delta) {
    const [year, m] = month.split('-').map(Number);
    const date = new Date(year, m - 1 + delta, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(month) {
    const [year, m] = month.split('-').map(Number);
    const label = new Date(year, m - 1, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function MonthSelector({ month, url }) {
    function go(newMonth) {
        router.get(
            url,
            { month: newMonth },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <div className="inline-flex items-center gap-1 rounded-brand-pill border border-brand-border bg-brand-surface p-1 shadow-brand-card">
            <button
                type="button"
                onClick={() => go(shiftMonth(month, -1))}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-brand-pill text-brand-text-secondary transition hover:bg-brand-primary-soft hover:text-brand-primary"
                aria-label="Mes anterior"
            >
                &larr;
            </button>

            <span className="min-w-[8.5rem] px-1 text-center text-sm font-semibold text-brand-text">
                {monthLabel(month)}
            </span>

            <button
                type="button"
                onClick={() => go(shiftMonth(month, 1))}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-brand-pill text-brand-text-secondary transition hover:bg-brand-primary-soft hover:text-brand-primary"
                aria-label="Mes siguiente"
            >
                &rarr;
            </button>
        </div>
    );
}
