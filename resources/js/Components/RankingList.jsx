function formatPrice(price) {
    return Number(price).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function initials(name) {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
}

export default function RankingList({ items, emptyLabel, hrefFor, unitLabel = 'corte', unitLabelPlural, avatars = false }) {
    if (items.length === 0) {
        return (
            <p className="rounded-brand-md border border-dashed border-brand-border bg-brand-surface-alt p-4 text-sm text-brand-text-secondary">
                {emptyLabel}
            </p>
        );
    }

    return (
        <ul className="divide-y divide-brand-border-subtle overflow-hidden rounded-brand-md border border-brand-border bg-brand-surface">
            {items.map((item, index) => {
                const href = hrefFor?.(item);
                const Wrapper = href ? 'a' : 'div';

                return (
                    <li key={item.id}>
                        <Wrapper
                            {...(href ? { href } : {})}
                            className="flex flex-col gap-2 p-4 transition hover:bg-brand-surface-alt"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <span
                                        className={
                                            avatars
                                                ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-xs font-semibold text-brand-primary-soft-text'
                                                : 'flex h-7 w-7 shrink-0 items-center justify-center rounded-brand-pill bg-brand-primary-soft text-xs font-semibold text-brand-primary-soft-text'
                                        }
                                    >
                                        {avatars ? initials(item.name) : index + 1}
                                    </span>
                                    <span className="truncate text-sm font-medium text-brand-text">{item.name}</span>
                                </div>
                                <div className="shrink-0 text-right">
                                    <p className="text-sm font-semibold text-brand-text">${formatPrice(item.total)}</p>
                                    {(item.cantidad !== undefined || item.pct !== undefined) && (
                                        <p className="text-xs text-brand-text-secondary">
                                            {item.cantidad !== undefined && (
                                                <>
                                                    {item.cantidad} {item.cantidad === 1 ? unitLabel : (unitLabelPlural ?? `${unitLabel}s`)}
                                                </>
                                            )}
                                            {item.pct !== undefined && ` · ${item.pct}%`}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {item.pct !== undefined && (
                                <div className="h-1.5 w-full overflow-hidden rounded-brand-pill bg-brand-primary-soft">
                                    <div
                                        className="h-1.5 rounded-brand-pill bg-brand-primary transition-all"
                                        style={{ width: `${Math.min(100, item.pct)}%` }}
                                    />
                                </div>
                            )}
                        </Wrapper>
                    </li>
                );
            })}
        </ul>
    );
}
