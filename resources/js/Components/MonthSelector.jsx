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

// `fullWidth` estira la píldora a todo el ancho en mobile (flechas en los
// bordes, mes centrado entre ellas) y vuelve a su ancho natural desde `sm:`.
// Por defecto queda siempre compacta, como ya se usa junto a una etiqueta en
// Barber/Dashboard y Consolidado.
export default function MonthSelector({ month, url, fullWidth = false }) {
    function go(newMonth) {
        router.get(
            url,
            { month: newMonth },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    return (
        <div
            className={`items-center gap-1 rounded-brand-pill border border-brand-border bg-brand-surface p-1 shadow-brand-card ${fullWidth ? 'flex w-full sm:inline-flex sm:w-auto' : 'inline-flex'}`}
        >
            <button
                type="button"
                onClick={() => go(shiftMonth(month, -1))}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-brand-pill text-brand-text-secondary transition hover:bg-brand-primary-soft hover:text-brand-link"
                aria-label="Mes anterior"
            >
                &larr;
            </button>

            <span className={`px-1 text-center text-sm font-semibold text-brand-text ${fullWidth ? 'flex-1 sm:min-w-[8.5rem] sm:flex-none' : 'min-w-[8.5rem]'}`}>
                {monthLabel(month)}
            </span>

            <button
                type="button"
                onClick={() => go(shiftMonth(month, 1))}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-brand-pill text-brand-text-secondary transition hover:bg-brand-primary-soft hover:text-brand-link"
                aria-label="Mes siguiente"
            >
                &rarr;
            </button>
        </div>
    );
}
