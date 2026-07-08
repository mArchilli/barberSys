import MobileMenuButton from '@/Components/MobileMenuButton';
import RankingList from '@/Components/RankingList';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { IconCoin, IconEdit, IconKey, IconUserX } from '@tabler/icons-react';
import { useState } from 'react';

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

function SalaryBadge({ barbero }) {
    if (barbero.salary_type === 'fixed') {
        return (
            <span className="inline-flex items-center rounded-full bg-brand-border px-2 py-0.5 text-xs font-medium text-brand-text-secondary">
                Fijo: ${Number(barbero.salary_amount).toLocaleString('es-AR')}
            </span>
        );
    }
    return (
        <span className="inline-flex items-center rounded-full bg-brand-success-soft px-2 py-0.5 text-xs font-medium text-brand-success-soft-text">
            Comisión {barbero.commission_pct}%
        </span>
    );
}

export default function Show({ barbero, stats, porServicio, clientesFrecuentes }) {
    const { currentBarberia, flash } = usePage().props;
    const barbId = currentBarberia?.id;
    const credentialFlash = flash.resetPassword;
    const [showCredential, setShowCredential] = useState(!!credentialFlash);

    function handleResetPassword() {
        if (! confirm(`¿Resetear la contraseña de ${barbero.name}? Se generará una nueva contraseña aleatoria y el barbero deberá cambiarla al ingresar.`)) return;
        router.patch(route('owner.barberias.barberos.resetPassword', { barberia: barbId, barbero: barbero.id }));
    }

    function handleDeactivate() {
        if (! confirm(`¿Dar de baja a ${barbero.name}? Su cuenta quedará inactiva.`)) return;
        router.patch(route('owner.barberias.barberos.deactivate', { barberia: barbId, barbero: barbero.id }));
    }

    const sinActividad = stats.totalCortes === 0;

    return (
        <AuthenticatedLayout
            header={({ onOpenMobileMenu }) => (
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold leading-tight text-brand-text">
                        Perfil del barbero
                    </h2>
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('owner.barberias.barberos.index', { barberia: barbId })}
                            className="text-sm text-brand-text-secondary hover:text-brand-text"
                        >
                            ← Volver a Barberos
                        </Link>
                        <MobileMenuButton onClick={onOpenMobileMenu} />
                    </div>
                </div>
            )}
        >
            <Head title={`Barbero — ${barbero.name}`} />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* Contraseña generada — se muestra una sola vez */}
                    {showCredential && credentialFlash && (
                        <div className="rounded-xl border border-brand-success/30 bg-brand-success/10 p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="font-semibold text-brand-success">Contraseña reseteada</p>
                                    <p className="mt-1 text-sm text-brand-text-secondary">
                                        Pasale esta contraseña a{' '}
                                        <span className="font-medium text-brand-text">{credentialFlash.name}</span>.
                                        No se va a volver a mostrar.
                                    </p>
                                    <p className="mt-2 inline-block rounded-lg border border-brand-success/20 bg-brand-surface px-3 py-2 font-mono text-lg font-bold tracking-widest text-brand-text">
                                        {credentialFlash.password}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowCredential(false)}
                                    className="shrink-0 text-lg font-bold leading-none text-brand-success hover:text-brand-text"
                                    aria-label="Cerrar"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Header: avatar + nombre + email + badges */}
                    <div className="flex flex-col gap-4 rounded-brand-lg border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:flex-row sm:items-center">
                        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-xl font-semibold text-brand-primary-soft-text">
                            {initials(barbero.name)}
                        </span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-lg font-semibold text-brand-text">{barbero.name}</p>
                            <p className="truncate text-sm text-brand-text-secondary">{barbero.email}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <SalaryBadge barbero={barbero} />
                                {! barbero.active && (
                                    <span className="inline-flex items-center rounded-full bg-brand-border px-2 py-0.5 text-xs font-medium text-brand-text-secondary">
                                        Dado de baja
                                    </span>
                                )}
                            </div>
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
                            Este barbero todavía no cargó ningún corte.
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

                    {/* Acciones de gestión */}
                    <div className="flex flex-col gap-3 rounded-brand-lg border border-brand-border bg-brand-surface p-4 shadow-brand-card sm:flex-row sm:items-center sm:justify-end">
                        <Link
                            href={route('owner.barberias.barberos.edit', { barberia: barbId, barbero: barbero.id })}
                            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md px-4 text-sm font-medium text-brand-link transition hover:bg-brand-primary-soft"
                        >
                            <IconEdit size={16} />
                            Editar datos
                        </Link>
                        <button
                            onClick={handleResetPassword}
                            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md px-4 text-sm font-medium text-brand-text-secondary transition hover:bg-brand-bg"
                        >
                            <IconKey size={16} />
                            Resetear clave
                        </button>
                        <button
                            onClick={handleDeactivate}
                            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md px-4 text-sm font-medium text-brand-danger transition hover:bg-brand-bg"
                        >
                            <IconUserX size={16} />
                            Dar de baja
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
