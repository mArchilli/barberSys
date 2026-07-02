import { router } from '@inertiajs/react';

function shiftMonth(month, delta) {
    const [year, m] = month.split('-').map(Number);
    const date = new Date(year, m - 1 + delta, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
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
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={() => go(shiftMonth(month, -1))}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-brand-pill border border-brand-border bg-brand-surface text-brand-text-secondary transition hover:border-brand-primary hover:text-brand-primary"
                aria-label="Mes anterior"
            >
                &larr;
            </button>

            <input
                type="month"
                value={month}
                onChange={(e) => e.target.value && go(e.target.value)}
                className="h-11 rounded-brand-sm border-brand-border text-sm text-brand-text focus:border-brand-primary focus:ring-brand-primary"
            />

            <button
                type="button"
                onClick={() => go(shiftMonth(month, 1))}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-brand-pill border border-brand-border bg-brand-surface text-brand-text-secondary transition hover:border-brand-primary hover:text-brand-primary"
                aria-label="Mes siguiente"
            >
                &rarr;
            </button>
        </div>
    );
}
