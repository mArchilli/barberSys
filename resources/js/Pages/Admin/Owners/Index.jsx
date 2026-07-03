import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const STATUS_LABELS = {
    trial: 'Trial',
    active: 'Activa',
    past_due: 'Vencida',
    cancelled: 'Cancelada',
};

function StatusBadge({ status }) {
    if (! status) {
        return (
            <span className="inline-flex items-center rounded-full bg-brand-border px-2 py-0.5 text-xs font-medium text-brand-text-secondary">
                Sin suscripción
            </span>
        );
    }

    const styles = {
        trial: 'bg-brand-primary-soft text-brand-primary-soft-text',
        active: 'bg-brand-success-soft text-brand-success',
        past_due: 'bg-brand-danger-soft text-brand-danger',
        cancelled: 'bg-brand-border text-brand-text-secondary',
    };

    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? styles.cancelled}`}>
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

export default function Index({ owners, filters, statusOptions, plans }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');
    const [plan, setPlan] = useState(filters.plan ?? '');
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timeout = setTimeout(() => {
            router.get(route('admin.owners.index'), { search, status, plan }, { preserveState: true, replace: true });
        }, 350);

        return () => clearTimeout(timeout);
    }, [search, status, plan]);

    return (
        <AdminLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Owners
                </h2>
            }
        >
            <Head title="Owners" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="rounded-brand-md border border-brand-success/30 bg-brand-success-soft p-4 text-sm text-brand-success">
                            {flash.success}
                        </div>
                    )}

                    <div className="flex flex-col gap-3 rounded-brand-md border border-brand-border bg-brand-surface p-4 shadow-brand-card sm:flex-row sm:items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-brand-text-secondary">Buscar</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Nombre o email..."
                                className="mt-1 w-full rounded-brand-sm border-brand-border text-sm focus:border-brand-primary focus:ring-brand-primary"
                            />
                        </div>
                        <div className="sm:w-56">
                            <label className="block text-xs font-medium text-brand-text-secondary">Estado de suscripción</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="mt-1 w-full rounded-brand-sm border-brand-border text-sm focus:border-brand-primary focus:ring-brand-primary"
                            >
                                <option value="">Todos</option>
                                {statusOptions.map((s) => (
                                    <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="sm:w-56">
                            <label className="block text-xs font-medium text-brand-text-secondary">Plan</label>
                            <select
                                value={plan}
                                onChange={(e) => setPlan(e.target.value)}
                                className="mt-1 w-full rounded-brand-sm border-brand-border text-sm focus:border-brand-primary focus:ring-brand-primary"
                            >
                                <option value="">Todos</option>
                                {plans.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {owners.length === 0 ? (
                        <div className="rounded-brand-md border border-brand-border bg-brand-surface p-8 text-center text-brand-text-secondary shadow-brand-card">
                            No se encontraron owners con esos filtros.
                        </div>
                    ) : (
                        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {owners.map((o) => (
                                <li key={o.id}>
                                    <Link
                                        href={route('admin.owners.show', o.id)}
                                        className="flex h-full flex-col gap-3 rounded-brand-lg border border-brand-border bg-brand-surface p-5 shadow-brand-card transition hover:border-brand-primary/40 hover:shadow-brand-floating"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="truncate font-display font-semibold text-brand-text">{o.name}</p>
                                                <p className="truncate text-sm text-brand-text-secondary">{o.email}</p>
                                            </div>
                                            <StatusBadge status={o.subscription_status} />
                                        </div>

                                        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                                            <span className="inline-flex items-center rounded-brand-pill bg-brand-primary-soft px-2.5 py-1 text-xs font-medium text-brand-primary-soft-text">
                                                {o.plan ?? 'Sin plan'}
                                            </span>
                                            <span className="text-brand-text-secondary">
                                                {o.barberias_count} barbería(s) · {o.barberos_count} barbero(s)
                                            </span>
                                        </div>

                                        <p className="text-xs text-brand-text-secondary">Alta: {o.created_at}</p>
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
