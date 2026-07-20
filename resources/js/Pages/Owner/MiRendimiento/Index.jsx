import RankingList from '@/Components/RankingList';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { IconCoin } from '@tabler/icons-react';

function initials(name) {
    return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function formatMoney(value) {
    return `$${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value) {
    if (! value) return '—';
    return new Date(`${value}T00:00:00`).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function Index({ owner, stats, porServicio, clientesFrecuentes }) {
    const { currentBarberia } = usePage().props;
    const barbId = currentBarberia?.id;

    const sinActividad = stats.totalCortes === 0;

    return (
        <AuthenticatedLayout
            header={(
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold leading-tight text-brand-text">
                        Mi rendimiento
                    </h2>
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('owner.barberias.dashboard', { barberia: barbId })}
                            className="text-sm text-brand-text-secondary hover:text-brand-text"
                        >
                            ← Volver al Dashboard
                        </Link>
                    </div>
                </div>
            )}
        >
            <Head title="Mi rendimiento" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Header: avatar + nombre + email */}
                    <div className="flex flex-col gap-4 rounded-brand-lg border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:flex-row sm:items-center">
                        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-xl font-semibold text-brand-primary-soft-text">
                            {initials(owner.name)}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-lg font-semibold text-brand-text">{owner.name}</p>
                            <p className="truncate text-sm text-brand-text-secondary">{owner.email}</p>
                        </div>
                    </div>

                    {/* Hero card de totales */}
                    <div className="rounded-brand-xl bg-brand-nav-bg p-6 shadow-brand-floating">
                        <div className="flex items-center gap-4">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-primary/20 text-brand-nav-active">
                                <IconCoin size={24} stroke={1.75} />
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm text-brand-text-on-dark">Facturación total</p>
                                <p className="truncate font-display text-3xl font-bold text-brand-text-on-dark sm:text-4xl">
                                    {formatMoney(stats.totalFacturado)}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 divide-x divide-brand-nav-text/10 border-t border-brand-nav-text/10 pt-4">
                            <div className="pr-4">
                                <p className="text-xs text-brand-text-on-dark">Cortes totales</p>
                                <p className="mt-1 text-lg font-semibold text-brand-text-on-dark">{stats.totalCortes}</p>
                            </div>
                            <div className="pl-4">
                                <p className="text-xs text-brand-text-on-dark">Activo desde</p>
                                <p className="mt-1 text-lg font-semibold text-brand-text-on-dark">{formatDate(stats.activoDesde)}</p>
                            </div>
                        </div>
                    </div>

                    {sinActividad ? (
                        <p className="rounded-brand-md border border-dashed border-brand-border bg-brand-surface-alt p-6 text-center text-sm text-brand-text-secondary">
                            Todavía no cargaste ningún corte en esta barbería.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <section className="space-y-3">
                                <h3 className="font-display text-lg font-bold text-brand-text">Servicios más registrados</h3>
                                <RankingList
                                    items={porServicio}
                                    emptyLabel="Todavía no hay servicios registrados."
                                />
                            </section>

                            <section className="space-y-3">
                                <h3 className="font-display text-lg font-bold text-brand-text">Clientes frecuentes</h3>
                                <RankingList
                                    items={clientesFrecuentes}
                                    emptyLabel="Todavía no hay clientes registrados."
                                    unitLabel="visita"
                                    unitLabelPlural="visitas"
                                    avatars
                                />
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
