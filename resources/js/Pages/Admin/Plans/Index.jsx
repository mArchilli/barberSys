import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { IconPlus } from '@tabler/icons-react';

function formatMoney(value) {
    return `$${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatLimit(value) {
    return value === null ? 'Ilimitado' : value;
}

export default function Index({ plans }) {
    const { flash } = usePage().props;

    return (
        <AdminLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-brand-text">
                        Planes
                    </h2>
                    <Link
                        href={route('admin.plans.create')}
                        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-brand-pill bg-brand-primary px-4 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover"
                    >
                        <IconPlus size={18} stroke={2} />
                        Nuevo plan
                    </Link>
                </div>
            }
        >
            <Head title="Planes" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="rounded-brand-md border border-brand-success/30 bg-brand-success-soft p-4 text-sm text-brand-success">
                            {flash.success}
                        </div>
                    )}

                    {plans.length === 0 ? (
                        <div className="rounded-brand-md border border-brand-border bg-brand-surface p-8 text-center text-brand-text-secondary shadow-brand-card">
                            Todavía no cargaste ningún plan.
                        </div>
                    ) : (
                        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {plans.map((p) => (
                                <li key={p.id}>
                                    <Link
                                        href={route('admin.plans.edit', p.id)}
                                        className="flex h-full flex-col gap-3 rounded-brand-lg border border-brand-border bg-brand-surface p-5 shadow-brand-card transition hover:border-brand-primary/40 hover:shadow-brand-floating"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="truncate font-display font-semibold text-brand-text">{p.name}</p>
                                                <p className="truncate text-xs text-brand-text-secondary">{p.slug}</p>
                                            </div>
                                            <div className="flex shrink-0 flex-col items-end gap-1">
                                                {p.is_custom && (
                                                    <span className="inline-flex items-center rounded-full bg-brand-primary-soft px-2 py-0.5 text-xs font-medium text-brand-primary-soft-text">
                                                        A medida
                                                    </span>
                                                )}
                                                {!p.active && (
                                                    <span className="inline-flex items-center rounded-full bg-brand-border px-2 py-0.5 text-xs font-medium text-brand-text-secondary">
                                                        Inactivo
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <p className="font-display text-2xl font-bold tracking-[-0.03em] text-brand-text">
                                                {formatMoney(p.price)}
                                                <span className="text-sm font-normal text-brand-text-secondary"> /mes</span>
                                            </p>
                                            {p.annual_price !== null && (
                                                <p className="mt-0.5 text-sm text-brand-text-secondary">
                                                    {formatMoney(p.annual_price)} /mes pagando anual
                                                </p>
                                            )}
                                        </div>

                                        <div className="text-sm text-brand-text-secondary">
                                            {formatLimit(p.max_barberias)} barbería(s) · {formatLimit(p.max_barberos)} barbero(s)
                                        </div>

                                        {p.included_items.length > 0 && (
                                            <ul className="space-y-0.5 border-t border-brand-border-subtle pt-3 text-xs text-brand-text-secondary">
                                                {p.included_items.map((item, i) => (
                                                    <li key={i} className="flex gap-1.5">
                                                        <span className="text-brand-primary">·</span>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        <div className="mt-auto border-t border-brand-border-subtle pt-3 text-sm">
                                            <span className="font-medium text-brand-text">{p.active_subscribers_count}</span>{' '}
                                            <span className="text-brand-text-secondary">suscriptor(es) activo(s)</span>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
