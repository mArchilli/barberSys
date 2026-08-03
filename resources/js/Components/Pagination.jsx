// Componente de paginación genérico: no depende de los links/labels en HTML
// que arma Laravel (ligados al locale de la app), arma su propia UI en
// español a partir de los metadatos numéricos del paginator
// (current_page/last_page/from/to/total) y delega el cambio de página al
// caller vía onPageChange — cada pantalla decide cómo arma la URL (route +
// filtros propios), este componente no conoce rutas ni query params.
export default function Pagination({ meta, onPageChange }) {
    if (!meta || meta.last_page <= 1) {
        return null;
    }

    const start = Math.max(1, meta.current_page - 2);
    const end = Math.min(meta.last_page, meta.current_page + 2);
    const pages = [];

    for (let page = start; page <= end; page++) {
        pages.push(page);
    }

    const pageButtonClass = (isActive) => `flex h-9 min-w-9 items-center justify-center rounded-brand-sm px-2 text-sm font-medium transition ${
        isActive
            ? 'bg-brand-primary text-brand-on-primary'
            : 'text-brand-text-secondary hover:bg-brand-surface-alt'
    }`;

    return (
        <nav
            className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-border pt-4"
            aria-label="Paginación"
        >
            <p className="text-sm text-brand-text-secondary">
                Mostrando {meta.from ?? 0}-{meta.to ?? 0} de {meta.total}
            </p>

            <div className="flex items-center gap-1">
                <button
                    type="button"
                    disabled={meta.current_page <= 1}
                    onClick={() => onPageChange(meta.current_page - 1)}
                    className={`${pageButtonClass(false)} disabled:cursor-not-allowed disabled:opacity-40`}
                >
                    Anterior
                </button>

                {start > 1 && <span className="px-1 text-brand-text-secondary">…</span>}

                {pages.map((page) => (
                    <button
                        key={page}
                        type="button"
                        onClick={() => onPageChange(page)}
                        aria-current={page === meta.current_page ? 'page' : undefined}
                        className={pageButtonClass(page === meta.current_page)}
                    >
                        {page}
                    </button>
                ))}

                {end < meta.last_page && <span className="px-1 text-brand-text-secondary">…</span>}

                <button
                    type="button"
                    disabled={meta.current_page >= meta.last_page}
                    onClick={() => onPageChange(meta.current_page + 1)}
                    className={`${pageButtonClass(false)} disabled:cursor-not-allowed disabled:opacity-40`}
                >
                    Siguiente
                </button>
            </div>
        </nav>
    );
}
