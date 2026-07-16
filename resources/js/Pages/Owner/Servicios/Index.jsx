import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { IconEdit, IconList, IconSearch, IconToggleLeft } from '@tabler/icons-react';
import { useState } from 'react';

function formatMoney(value) {
    return `$${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

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

export default function Index({ servicios }) {
    const { flash, currentBarberia } = usePage().props;
    const barbId = currentBarberia?.id;
    const [busqueda, setBusqueda] = useState('');

    const serviciosFiltrados = servicios.filter((servicio) =>
        servicio.name.toLowerCase().includes(busqueda.toLowerCase()),
    );

    const activos = servicios.filter((servicio) => servicio.active).length;
    const inactivos = servicios.length - activos;
    const precioPromedio = servicios.length > 0
        ? servicios.reduce((sum, servicio) => sum + Number(servicio.price), 0) / servicios.length
        : 0;

    function handleDeactivate(servicio) {
        if (! confirm(`Desactivar "${servicio.name}"? Dejara de estar disponible para nuevos cortes.`)) return;
        router.patch(route('owner.barberias.servicios.deactivate', { barberia: barbId, servicio: servicio.id }));
    }

    return (
        <AuthenticatedLayout
            headerClassName="bg-brand-bg"
            headerContainerClassName="mx-auto max-w-[1720px] px-2 py-4 sm:px-3 sm:py-5 lg:px-4"
            header={(
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="font-display text-3xl font-bold tracking-[-0.04em] text-brand-text sm:text-4xl">
                            Servicios
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-brand-text-secondary">
                            Organiza los servicios que ofreces, actualiza precios y mantene limpio el catalogo disponible para cargar cortes.
                        </p>
                    </div>

                    <Link
                        href={route('owner.barberias.servicios.create', { barberia: barbId })}
                        className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-brand-primary px-5 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover"
                    >
                        + Nuevo servicio
                    </Link>
                </div>
            )}
        >
            <Head title="Servicios" />

            <div className="pb-12">
                <div className="mx-auto max-w-[1720px] space-y-8 px-2 sm:px-3 lg:px-4">
                    {flash?.success && (
                        <div className="rounded-[24px] border border-brand-success/20 bg-brand-success-soft px-5 py-4 text-sm text-brand-success shadow-brand-card">
                            {flash.success}
                        </div>
                    )}

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex min-w-0 items-start gap-4">
                                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-brand-primary/12 text-brand-primary shadow-sm">
                                        <IconList size={30} stroke={1.8} />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-brand-text-secondary">
                                            Estado del catalogo
                                        </p>
                                        <p className="mt-3 truncate font-display text-4xl font-extrabold tracking-[-0.04em] text-brand-text sm:text-[3.25rem]">
                                            {servicios.length}
                                        </p>
                                        <p className="mt-2 text-sm text-brand-text-secondary">
                                            {servicios.length === 1 ? 'Servicio cargado' : 'Servicios cargados'} en esta barberia.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                <MetricTile label="Activos" value={activos} tone="primary" />
                                <MetricTile label="Inactivos" value={inactivos} tone={inactivos > 0 ? 'danger' : 'default'} />
                                <MetricTile label="Precio promedio" value={formatMoney(precioPromedio)} />
                            </div>
                        </section>

                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-semibold tracking-[-0.03em] text-brand-text">
                                        Encuentra un servicio al instante
                                    </h3>
                                    <p className="mt-2 text-xs text-brand-text-secondary">
                                        Filtra por nombre para editar precios o desactivar elementos del catalogo.
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
                                        placeholder="Buscar servicio..."
                                        className="w-full rounded-full border border-brand-border bg-brand-surface py-3.5 pl-11 pr-4 text-sm text-brand-text placeholder-brand-text-secondary shadow-sm transition focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    <section className="space-y-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h3 className="font-display text-lg font-bold text-brand-text">
                                    Tu catalogo de servicios
                                </h3>
                                <p className="text-sm text-brand-text-secondary">
                                    {busqueda
                                        ? `${serviciosFiltrados.length} resultado${serviciosFiltrados.length === 1 ? '' : 's'} para "${busqueda}".`
                                        : 'Revisa, edita o da de baja servicios desde aqui.'}
                                </p>
                            </div>
                        </div>

                        {serviciosFiltrados.length === 0 ? (
                            <div className="rounded-[28px] border border-dashed border-brand-border bg-brand-surface-alt p-10 text-center shadow-brand-card">
                                <h4 className="font-display text-xl font-bold text-brand-text">
                                    {busqueda ? 'No encontramos ese servicio' : 'Todavia no cargaste servicios'}
                                </h4>
                                <p className="mx-auto mt-3 max-w-xl text-sm text-brand-text-secondary">
                                    {busqueda
                                        ? 'Prueba con otro nombre o limpia la busqueda para ver todo el catalogo.'
                                        : 'Crea tu primer servicio para empezar a registrar cortes con precio y mantener tu panel ordenado.'}
                                </p>
                                {!busqueda && (
                                    <Link
                                        href={route('owner.barberias.servicios.create', { barberia: barbId })}
                                        className="mt-5 inline-flex min-h-[46px] items-center justify-center rounded-full bg-brand-primary px-5 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover"
                                    >
                                        Crear el primero
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
                                {serviciosFiltrados.map((servicio) => (
                                    <article
                                        key={servicio.id}
                                        className={`rounded-[28px] border p-6 shadow-brand-card transition hover:-translate-y-0.5 hover:shadow-brand-card-hover sm:p-7 ${
                                            servicio.active
                                                ? 'border-brand-border bg-brand-surface'
                                                : 'border-brand-border bg-brand-surface-alt'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-brand-text-secondary">
                                                    Servicio
                                                </p>
                                                <h4 className="mt-2 truncate font-display text-2xl font-bold tracking-[-0.04em] text-brand-text">
                                                    {servicio.name}
                                                </h4>
                                            </div>

                                            {servicio.active ? (
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
                                                Precio actual
                                            </p>
                                            <p className="mt-2 font-display text-3xl font-extrabold tracking-[-0.04em] text-brand-text">
                                                {formatMoney(servicio.price)}
                                            </p>
                                        </div>

                                        <div className="mt-5 flex items-center justify-between gap-3 border-t border-brand-border-subtle pt-5">
                                            <p className="text-sm text-brand-text-secondary">
                                                {servicio.active ? 'Disponible para nuevos cortes.' : 'Fuera del catalogo operativo.'}
                                            </p>

                                            <div className="flex shrink-0 items-center gap-2">
                                                <Link
                                                    href={route('owner.barberias.servicios.edit', { barberia: barbId, servicio: servicio.id })}
                                                    aria-label={`Editar ${servicio.name}`}
                                                    title="Editar"
                                                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-border bg-brand-surface-alt text-brand-link transition hover:border-brand-primary/20 hover:bg-brand-primary/5"
                                                >
                                                    <IconEdit size={17} />
                                                </Link>

                                                {servicio.active && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeactivate(servicio)}
                                                        aria-label={`Desactivar ${servicio.name}`}
                                                        title="Desactivar"
                                                        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-danger/20 bg-brand-danger/5 text-brand-danger transition hover:bg-brand-danger/10"
                                                    >
                                                        <IconToggleLeft size={17} />
                                                    </button>
                                                )}
                                            </div>
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
