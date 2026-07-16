import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { IconEdit, IconSearch, IconToggleLeft, IconUsers } from '@tabler/icons-react';
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

function initials(name) {
    return name
        .split(' ')
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function Avatar({ name }) {
    return (
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-brand-primary/12 font-display text-xl font-bold tracking-[-0.04em] text-brand-primary shadow-sm">
            {initials(name)}
        </span>
    );
}

export default function Index({ clientes }) {
    const { flash, currentBarberia } = usePage().props;
    const barbId = currentBarberia?.id;
    const [busqueda, setBusqueda] = useState('');

    const terminoBusqueda = busqueda.trim().toLowerCase();
    const clientesFiltrados = clientes.filter((cliente) => (
        cliente.name.toLowerCase().includes(terminoBusqueda) ||
        cliente.phone?.toLowerCase().includes(terminoBusqueda) ||
        cliente.email?.toLowerCase().includes(terminoBusqueda)
    ));

    const activos = clientes.filter((cliente) => cliente.active).length;
    const inactivos = clientes.length - activos;
    const conContacto = clientes.filter((cliente) => cliente.phone || cliente.email).length;

    function handleDeactivate(cliente) {
        if (!confirm(`Desactivar a "${cliente.name}"? Dejara de aparecer disponible para nuevos cortes.`)) return;
        router.patch(route('owner.barberias.clientes.deactivate', { barberia: barbId, cliente: cliente.id }));
    }

    return (
        <AuthenticatedLayout
            headerClassName="bg-brand-bg"
            headerContainerClassName="mx-auto max-w-[1720px] px-2 py-4 sm:px-3 sm:py-5 lg:px-4"
            header={(
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="font-display text-3xl font-bold tracking-[-0.04em] text-brand-text sm:text-4xl">
                            Clientes
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-brand-text-secondary">
                            Revisa tu cartera, encuentra clientes rapido y mantene actualizada la informacion que usas para registrar cortes.
                        </p>
                    </div>
                </div>
            )}
        >
            <Head title="Clientes" />

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
                                        <IconUsers size={30} stroke={1.8} />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-brand-text-secondary">
                                            Cartera activa
                                        </p>
                                        <p className="mt-3 truncate font-display text-4xl font-extrabold tracking-[-0.04em] text-brand-text sm:text-[3.25rem]">
                                            {clientes.length}
                                        </p>
                                        <p className="mt-2 text-sm text-brand-text-secondary">
                                            {clientes.length === 1 ? 'Cliente registrado' : 'Clientes registrados'} en esta barberia.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                <MetricTile label="Activos" value={activos} tone="primary" />
                                <MetricTile label="Inactivos" value={inactivos} tone={inactivos > 0 ? 'danger' : 'default'} />
                                <MetricTile label="Con contacto" value={conContacto} />
                            </div>
                        </section>

                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-semibold tracking-[-0.03em] text-brand-text">
                                        Encuentra un cliente al instante
                                    </h3>
                                    <p className="mt-2 text-xs text-brand-text-secondary">
                                        Filtra por nombre, telefono o email para editar datos o dejar un cliente fuera del flujo operativo.
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
                                        onChange={(event) => setBusqueda(event.target.value)}
                                        placeholder="Buscar por nombre, telefono o email..."
                                        aria-label="Buscar clientes por nombre, telefono o email"
                                        className="w-full rounded-full border border-brand-border bg-brand-surface py-3.5 pl-11 pr-4 text-sm text-brand-text placeholder-brand-text-secondary shadow-sm transition focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                    />
                                </div>
                            </div>

                            <div className="mt-5 rounded-[22px] bg-brand-surface-alt px-4 py-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                    Como se crean
                                </p>
                                <p className="mt-2 text-sm text-brand-text-secondary">
                                    Los clientes se generan automaticamente al cargar un corte nuevo y luego puedes completar o corregir sus datos desde aqui.
                                </p>
                            </div>
                        </section>
                    </div>

                    <section className="space-y-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h3 className="font-display text-lg font-bold text-brand-text">
                                    Tus clientes
                                </h3>
                                <p className="text-sm text-brand-text-secondary">
                                    {busqueda
                                        ? `${clientesFiltrados.length} resultado${clientesFiltrados.length === 1 ? '' : 's'} para "${busqueda}".`
                                        : 'Edita datos de contacto o desactiva clientes cuando ya no deban aparecer al registrar cortes.'}
                                </p>
                            </div>
                        </div>

                        {clientesFiltrados.length === 0 ? (
                            <div className="rounded-[28px] border border-dashed border-brand-border bg-brand-surface-alt p-10 text-center shadow-brand-card">
                                <h4 className="font-display text-xl font-bold text-brand-text">
                                    {busqueda ? 'No encontramos ese cliente' : 'Todavia no hay clientes registrados'}
                                </h4>
                                <p className="mx-auto mt-3 max-w-xl text-sm text-brand-text-secondary">
                                    {busqueda
                                        ? 'Prueba con otro termino o limpia la busqueda para volver a ver toda la cartera.'
                                        : 'Los clientes se crean automaticamente cuando registras un corte por primera vez.'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
                                {clientesFiltrados.map((cliente) => (
                                    <article
                                        key={cliente.id}
                                        className={`rounded-[28px] border p-6 shadow-brand-card transition hover:-translate-y-0.5 hover:shadow-brand-card-hover sm:p-7 ${
                                            cliente.active
                                                ? 'border-brand-border bg-brand-surface'
                                                : 'border-brand-border bg-brand-surface-alt'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex min-w-0 items-start gap-4">
                                                <Avatar name={cliente.name} />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-brand-text-secondary">
                                                        Cliente
                                                    </p>
                                                    <h4 className="mt-2 truncate font-display text-2xl font-bold tracking-[-0.04em] text-brand-text">
                                                        {cliente.name}
                                                    </h4>
                                                </div>
                                            </div>

                                            {cliente.active ? (
                                                <span className="shrink-0 rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-brand-on-primary">
                                                    Activo
                                                </span>
                                            ) : (
                                                <span className="shrink-0 rounded-full bg-brand-border px-3 py-1 text-xs font-semibold text-brand-text-secondary">
                                                    Inactivo
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                            <div className="min-w-0 rounded-[22px] bg-brand-surface-alt px-4 py-4">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                                    Telefono
                                                </p>
                                                <p className="mt-2 break-words text-sm font-semibold text-brand-text">
                                                    {cliente.phone || 'Sin telefono cargado'}
                                                </p>
                                            </div>

                                            <div className="min-w-0 rounded-[22px] bg-brand-surface-alt px-4 py-4">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                                    Email
                                                </p>
                                                <p className="mt-2 break-words text-sm font-semibold text-brand-text">
                                                    {cliente.email || 'Sin email cargado'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between gap-3 rounded-[18px] bg-brand-surface-alt px-4 py-3 text-sm">
                                            <span className="font-medium text-brand-text-secondary">
                                                {cliente.active ? 'Disponible para nuevos cortes.' : 'Fuera del flujo operativo.'}
                                            </span>
                                            <span className="rounded-full bg-brand-surface px-2.5 py-1 text-xs font-semibold text-brand-text-secondary">
                                                {cliente.phone || cliente.email ? 'Contacto' : 'Pendiente'}
                                            </span>
                                        </div>

                                        <div className="mt-5 flex items-center justify-end gap-2 border-t border-brand-border-subtle pt-5">
                                            <Link
                                                href={route('owner.barberias.clientes.edit', { barberia: barbId, cliente: cliente.id })}
                                                aria-label={`Editar ${cliente.name}`}
                                                title="Editar"
                                                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-border bg-brand-surface-alt text-brand-link transition hover:border-brand-primary/20 hover:bg-brand-primary/5"
                                            >
                                                <IconEdit size={17} />
                                            </Link>

                                            {cliente.active && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeactivate(cliente)}
                                                    aria-label={`Desactivar ${cliente.name}`}
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
