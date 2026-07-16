import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { IconCreditCard, IconEdit, IconSearch, IconToggleLeft } from '@tabler/icons-react';
import { useState } from 'react';

function MetricTile({ label, value, tone = 'default' }) {
    const toneClassName = tone === 'primary'
        ? 'text-brand-primary'
        : tone === 'danger'
            ? 'text-brand-danger'
            : 'text-brand-text';

    return (
        <div className="rounded-[22px] bg-brand-surface-alt px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                {label}
            </p>
            <p className={`mt-2 text-2xl font-bold ${toneClassName}`}>
                {value}
            </p>
        </div>
    );
}

export default function Index({ mediosPago }) {
    const { flash, currentBarberia } = usePage().props;
    const barbId = currentBarberia?.id;
    const [busqueda, setBusqueda] = useState('');

    const mediosFiltrados = mediosPago.filter((medio) =>
        medio.name.toLowerCase().includes(busqueda.toLowerCase()),
    );

    const activos = mediosPago.filter((medio) => medio.active).length;
    const inactivos = mediosPago.length - activos;

    function handleDeactivate(medio) {
        if (! confirm(`Desactivar "${medio.name}"? Dejara de estar disponible para nuevos cobros.`)) return;
        router.patch(route('owner.barberias.medios-pago.deactivate', { barberia: barbId, medioPago: medio.id }));
    }

    return (
        <AuthenticatedLayout
            headerClassName="bg-brand-bg"
            headerContainerClassName="mx-auto max-w-[1720px] px-2 py-4 sm:px-3 sm:py-5 lg:px-4"
            header={(
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="font-display text-3xl font-bold tracking-[-0.04em] text-brand-text sm:text-4xl">
                            Medios de pago
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-brand-text-secondary">
                            Organiza los medios disponibles para cobrar y mantene ordenada la forma en la que registras ingresos en la barberia.
                        </p>
                    </div>

                    <Link
                        href={route('owner.barberias.medios-pago.create', { barberia: barbId })}
                        className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-brand-primary px-5 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover"
                    >
                        + Nuevo medio de pago
                    </Link>
                </div>
            )}
        >
            <Head title="Medios de pago" />

            <div className="pb-12">
                <div className="mx-auto max-w-[1720px] space-y-8 px-2 sm:px-3 lg:px-4">
                    {flash?.success && (
                        <div className="rounded-[24px] border border-brand-success/20 bg-brand-success-soft px-5 py-4 text-sm text-brand-success shadow-brand-card">
                            {flash.success}
                        </div>
                    )}

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex min-w-0 items-start gap-4">
                                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-brand-primary/12 text-brand-primary shadow-sm">
                                        <IconCreditCard size={30} stroke={1.8} />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-brand-text-secondary">
                                            Estado de cobro
                                        </p>
                                        <p className="mt-3 truncate font-display text-4xl font-extrabold tracking-[-0.04em] text-brand-text sm:text-[3.25rem]">
                                            {mediosPago.length}
                                        </p>
                                        <p className="mt-2 text-sm text-brand-text-secondary">
                                            {mediosPago.length === 1 ? 'Medio cargado' : 'Medios cargados'} en esta barberia.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                <MetricTile label="Activos" value={activos} tone="primary" />
                                <MetricTile label="Inactivos" value={inactivos} tone={inactivos > 0 ? 'danger' : 'default'} />
                                <MetricTile label="Visibles ahora" value={activos} />
                            </div>
                        </section>

                        <section>
                            <div className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-semibold tracking-[-0.03em] text-brand-text">
                                            Encuentra un medio al instante
                                        </h3>
                                        <p className="mt-2 text-xs text-brand-text-secondary">
                                            Filtra por nombre para editar o dar de baja opciones de cobro.
                                        </p>
                                    </div>
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-link shadow-sm">
                                        <IconSearch size={22} stroke={1.8} />
                                    </span>
                                </div>

                                <div className="mt-6 rounded-[22px] bg-brand-surface-alt p-3">
                                    <div className="relative">
                                        <IconSearch
                                            size={18}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-secondary"
                                        />
                                        <input
                                            type="search"
                                            value={busqueda}
                                            onChange={(e) => setBusqueda(e.target.value)}
                                            placeholder="Buscar medio de pago..."
                                            className="w-full rounded-full border border-brand-border bg-brand-surface py-3.5 pl-11 pr-4 text-sm text-brand-text placeholder-brand-text-secondary shadow-sm transition focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <section className="space-y-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h3 className="font-display text-lg font-bold text-brand-text">
                                    Tus medios de pago
                                </h3>
                                <p className="text-sm text-brand-text-secondary">
                                    {busqueda
                                        ? `${mediosFiltrados.length} resultado${mediosFiltrados.length === 1 ? '' : 's'} para "${busqueda}".`
                                        : 'Revisa, edita o da de baja las opciones disponibles para cobrar.'}
                                </p>
                            </div>
                        </div>

                        {mediosFiltrados.length === 0 ? (
                            <div className="rounded-[28px] border border-dashed border-brand-border bg-brand-surface-alt p-10 text-center shadow-brand-card">
                                <h4 className="font-display text-xl font-bold text-brand-text">
                                    {busqueda ? 'No encontramos ese medio de pago' : 'Todavia no cargaste medios de pago'}
                                </h4>
                                <p className="mx-auto mt-3 max-w-xl text-sm text-brand-text-secondary">
                                    {busqueda
                                        ? 'Prueba con otro nombre o limpia la busqueda para volver a ver todo el catalogo.'
                                        : 'Crea tu primer medio de pago para registrar efectivo, transferencia, tarjeta u otras formas de cobro.'}
                                </p>
                                {!busqueda && (
                                    <Link
                                        href={route('owner.barberias.medios-pago.create', { barberia: barbId })}
                                        className="mt-5 inline-flex min-h-[46px] items-center justify-center rounded-full bg-brand-primary px-5 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover"
                                    >
                                        Crear el primero
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
                                {mediosFiltrados.map((medio) => (
                                    <article
                                        key={medio.id}
                                        className={`rounded-[28px] border p-6 shadow-brand-card transition hover:-translate-y-0.5 hover:shadow-brand-card-hover sm:p-7 ${
                                            medio.active
                                                ? 'border-brand-border bg-brand-surface'
                                                : 'border-brand-border bg-brand-surface-alt'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-brand-text-secondary">
                                                    Medio de pago
                                                </p>
                                                <h4 className="mt-2 truncate font-display text-2xl font-bold tracking-[-0.04em] text-brand-text">
                                                    {medio.name}
                                                </h4>
                                            </div>

                                            {medio.active ? (
                                                <span className="shrink-0 rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-brand-on-primary">
                                                    Activo
                                                </span>
                                            ) : (
                                                <span className="shrink-0 rounded-full bg-brand-border px-3 py-1 text-xs font-semibold text-brand-text-secondary">
                                                    Inactivo
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-6 rounded-[22px] bg-brand-surface-alt px-4 py-4">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                                Estado actual
                                            </p>
                                            <p className="mt-2 font-display text-3xl font-extrabold tracking-[-0.04em] text-brand-text">
                                                {medio.active ? 'Disponible' : 'Oculto'}
                                            </p>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between gap-3 rounded-[18px] bg-brand-surface-alt px-4 py-3 text-sm">
                                            <span className="font-medium text-brand-text-secondary">
                                                {medio.active ? 'Listo para nuevos cobros.' : 'Fuera del flujo operativo.'}
                                            </span>
                                            <span className="rounded-full bg-brand-surface px-2.5 py-1 text-xs font-semibold text-brand-text-secondary">
                                                {medio.active ? 'Visible' : 'Oculto'}
                                            </span>
                                        </div>

                                        <div className="mt-5 flex items-center justify-end gap-2 border-t border-brand-border-subtle pt-5">
                                            <Link
                                                href={route('owner.barberias.medios-pago.edit', { barberia: barbId, medioPago: medio.id })}
                                                aria-label={`Editar ${medio.name}`}
                                                title="Editar"
                                                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-border bg-brand-surface-alt text-brand-link transition hover:border-brand-primary/20 hover:bg-brand-primary/5"
                                            >
                                                <IconEdit size={17} />
                                            </Link>

                                            {medio.active && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeactivate(medio)}
                                                    aria-label={`Desactivar ${medio.name}`}
                                                    title="Desactivar"
                                                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-danger/20 bg-brand-danger/5 text-brand-danger transition hover:bg-brand-danger/10"
                                                >
                                                    <IconToggleLeft size={17} />
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
