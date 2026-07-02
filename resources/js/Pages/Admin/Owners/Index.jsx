import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

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

export default function Index({ owners, filters, statusOptions }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    function submit(e) {
        e.preventDefault();
        router.get(route('admin.owners.index'), { search, status }, { preserveState: true, replace: true });
    }

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

                    <form onSubmit={submit} className="flex flex-col gap-3 rounded-brand-md border border-brand-border bg-brand-surface p-4 shadow-brand-card sm:flex-row sm:items-end">
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
                        <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-brand-sm bg-brand-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
                        >
                            Filtrar
                        </button>
                    </form>

                    <div className="overflow-hidden rounded-brand-md border border-brand-border bg-brand-surface shadow-brand-card">
                        {owners.length === 0 ? (
                            <div className="p-8 text-center text-brand-text-secondary">
                                No se encontraron owners con esos filtros.
                            </div>
                        ) : (
                            <>
                                {/* ── Mobile: cards ── */}
                                <ul className="divide-y divide-brand-border md:hidden">
                                    {owners.map((o) => (
                                        <li key={o.id}>
                                            <Link
                                                href={route('admin.owners.show', o.id)}
                                                className="flex flex-col gap-1 px-4 py-4 hover:bg-brand-bg"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="truncate font-medium text-brand-text">{o.name}</p>
                                                    <StatusBadge status={o.subscription_status} />
                                                </div>
                                                <p className="truncate text-sm text-brand-text-secondary">{o.email}</p>
                                                <p className="text-xs text-brand-text-secondary">
                                                    {o.plan ?? 'Sin plan'} · {o.barberias_count} barbería(s) · {o.barberos_count} barbero(s)
                                                </p>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>

                                {/* ── Desktop: tabla ── */}
                                <table className="hidden w-full text-left text-sm md:table">
                                    <thead className="bg-brand-bg text-xs uppercase text-brand-text-secondary">
                                        <tr>
                                            <th className="px-6 py-3">Owner</th>
                                            <th className="px-6 py-3">Plan</th>
                                            <th className="px-6 py-3">Suscripción</th>
                                            <th className="px-6 py-3">Barberías</th>
                                            <th className="px-6 py-3">Barberos</th>
                                            <th className="px-6 py-3">Alta</th>
                                            <th className="px-6 py-3 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-border">
                                        {owners.map((o) => (
                                            <tr key={o.id} className="hover:bg-brand-bg">
                                                <td className="px-6 py-4">
                                                    <p className="font-medium text-brand-text">{o.name}</p>
                                                    <p className="text-xs text-brand-text-secondary">{o.email}</p>
                                                </td>
                                                <td className="px-6 py-4 text-brand-text-secondary">{o.plan ?? '—'}</td>
                                                <td className="px-6 py-4"><StatusBadge status={o.subscription_status} /></td>
                                                <td className="px-6 py-4 text-brand-text-secondary">{o.barberias_count}</td>
                                                <td className="px-6 py-4 text-brand-text-secondary">{o.barberos_count}</td>
                                                <td className="px-6 py-4 text-brand-text-secondary">{o.created_at}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        href={route('admin.owners.show', o.id)}
                                                        className="text-sm font-medium text-brand-primary hover:underline"
                                                    >
                                                        Ver detalle
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
