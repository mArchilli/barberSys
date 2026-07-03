import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { IconEdit, IconSearch, IconToggleLeft } from '@tabler/icons-react';
import { useState } from 'react';

export default function Index({ servicios }) {
    const { flash, currentBarberia } = usePage().props;
    const barbId = currentBarberia?.id;

    const [busqueda, setBusqueda] = useState('');

    const serviciosFiltrados = servicios.filter((s) =>
        s.name.toLowerCase().includes(busqueda.toLowerCase()),
    );

    function handleDeactivate(servicio) {
        if (! confirm(`¿Desactivar "${servicio.name}"? Dejará de estar disponible para nuevos cortes.`)) return;
        router.patch(route('owner.barberias.servicios.deactivate', { barberia: barbId, servicio: servicio.id }));
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-brand-text">
                        Servicios
                    </h2>
                    <Link
                        href={route('owner.barberias.servicios.create', { barberia: barbId })}
                        className="inline-flex items-center justify-center rounded-brand-pill bg-brand-primary px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 sm:py-2"
                    >
                        + Nuevo servicio
                    </Link>
                </div>
            }
        >
            <Head title="Servicios" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-brand-md border border-brand-success/30 bg-brand-success/10 p-4 text-sm text-brand-success">
                            {flash.success}
                        </div>
                    )}

                    {/* Buscador */}
                    <div className="relative mb-4 sm:max-w-sm">
                        <IconSearch size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" />
                        <input
                            type="search"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar servicio…"
                            className="w-full rounded-brand-pill border border-brand-border bg-brand-surface py-3 pl-9 pr-4 text-sm text-brand-text placeholder-brand-text-secondary shadow-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary sm:py-2"
                        />
                    </div>

                    {serviciosFiltrados.length === 0 ? (
                        <div className="rounded-brand-lg border border-brand-border bg-brand-surface p-8 text-center text-brand-text-secondary shadow-brand-card">
                            {busqueda ? (
                                'No se encontraron servicios con ese criterio.'
                            ) : (
                                <>
                                    No hay servicios cargados.{' '}
                                    <Link
                                        href={route('owner.barberias.servicios.create', { barberia: barbId })}
                                        className="text-brand-primary hover:underline"
                                    >
                                        Crear el primero
                                    </Link>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {serviciosFiltrados.map((s) => (
                                <div
                                    key={s.id}
                                    className={`rounded-brand-lg border p-5 shadow-brand-card transition hover:shadow-brand-card-hover ${
                                        s.active ? 'border-brand-border bg-brand-surface' : 'border-brand-border bg-brand-surface-alt'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="truncate font-semibold text-brand-text">{s.name}</h3>
                                        {s.active ? (
                                            <span className="shrink-0 rounded-brand-pill bg-brand-success-soft px-2 py-0.5 text-xs font-medium text-brand-success-soft-text">
                                                Activo
                                            </span>
                                        ) : (
                                            <span className="shrink-0 rounded-brand-pill bg-brand-border px-2 py-0.5 text-xs font-medium text-brand-text-secondary">
                                                Inactivo
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-1 text-lg font-semibold text-brand-primary">
                                        ${Number(s.price).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                    </p>

                                    <div className="mt-4 flex items-center justify-end gap-1 border-t border-brand-border pt-3">
                                        <Link
                                            href={route('owner.barberias.servicios.edit', { barberia: barbId, servicio: s.id })}
                                            aria-label={`Editar ${s.name}`}
                                            title="Editar"
                                            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-brand-primary transition hover:bg-brand-primary-soft"
                                        >
                                            <IconEdit size={16} />
                                        </Link>
                                        {s.active && (
                                            <button
                                                onClick={() => handleDeactivate(s)}
                                                aria-label={`Desactivar ${s.name}`}
                                                title="Desactivar"
                                                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-brand-danger transition hover:bg-brand-danger/10"
                                            >
                                                <IconToggleLeft size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
