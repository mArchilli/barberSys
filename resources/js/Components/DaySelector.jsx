import { router } from '@inertiajs/react';

function shiftDay(date, delta) {
    const [year, m, d] = date.split('-').map(Number);
    const next = new Date(year, m - 1, d + delta);
    return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}-${String(next.getDate()).padStart(2, '0')}`;
}

export function dayLabel(date, esHoy) {
    if (esHoy) return 'Hoy';

    const ayer = shiftDay(new Date().toLocaleDateString('sv-SE'), -1);
    if (date === ayer) return 'Ayer';

    const [year, m, d] = date.split('-').map(Number);
    const label = new Date(year, m - 1, d).toLocaleDateString('es-AR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
}

// `onDark` estiliza para asentarse sobre una card oscura (uso original, panel
// de barbero). Pasá `onDark={false}` para usarlo sobre el fondo claro del
// panel (mismo lenguaje visual que MonthSelector), como en el dashboard owner.
export default function DaySelector({ date, esHoy, url, onDark = true }) {
    function go(newDate) {
        router.get(url, { day: newDate }, { preserveState: true, preserveScroll: true, replace: true });
    }

    const containerClass = onDark
        ? 'inline-flex items-center gap-1 rounded-brand-pill bg-brand-primary/10 p-1'
        : 'inline-flex items-center gap-1 rounded-brand-pill border border-brand-border bg-brand-surface p-1 shadow-brand-card';

    const buttonClass = onDark
        ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-brand-pill text-brand-nav-text transition hover:bg-brand-nav-text/10 hover:text-brand-nav-active'
        : 'flex h-11 w-11 shrink-0 items-center justify-center rounded-brand-pill text-brand-text-secondary transition hover:bg-brand-primary-soft hover:text-brand-link';

    const labelClass = onDark
        ? 'min-w-[5rem] px-1 text-center text-sm font-semibold text-brand-nav-active'
        : 'min-w-[8.5rem] px-1 text-center text-sm font-semibold text-brand-text';

    return (
        <div className={containerClass}>
            <button
                type="button"
                onClick={() => go(shiftDay(date, -1))}
                className={buttonClass}
                aria-label="Día anterior"
            >
                &larr;
            </button>

            <span className={labelClass}>{dayLabel(date, esHoy)}</span>

            <button
                type="button"
                onClick={() => go(shiftDay(date, 1))}
                disabled={esHoy}
                className={`${buttonClass} disabled:pointer-events-none disabled:opacity-30`}
                aria-label="Día siguiente"
            >
                &rarr;
            </button>
        </div>
    );
}
