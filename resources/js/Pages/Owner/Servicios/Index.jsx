import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { IconEdit, IconToggleLeft } from '@tabler/icons-react';

export default function Index({ servicios }) {
    const { flash, currentBarberia } = usePage().props;
    const barbId = currentBarberia?.id;

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
                        className="inline-flex items-center justify-center rounded-xl bg-brand-primary px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 sm:py-2"
                    >
                        + Nuevo servicio
                    </Link>
                </div>
            }
        >
            <Head title="Servicios" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-xl border border-brand-success/30 bg-brand-success/10 p-4 text-sm text-brand-success">
                            {flash.success}
                        </div>
                    )}

                    <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-card">
                        {servicios.length === 0 ? (
                            <div className="p-8 text-center text-brand-text-secondary">
                                No hay servicios cargados.{' '}
                                <Link
                                    href={route('owner.barberias.servicios.create', { barberia: barbId })}
                                    className="text-brand-primary hover:underline"
                                >
                                    Crear el primero
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* ── Mobile: cards ── */}
                                <ul className="divide-y divide-brand-border md:hidden">
                                    {servicios.map((s) => (
                                        <li key={s.id} className="flex items-center gap-3 px-4 py-4">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium text-brand-text">{s.name}</p>
                                                <p className="mt-0.5 text-sm text-brand-text-secondary">
                                                    ${Number(s.price).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-1">
                                                <Link
                                                    href={route('owner.barberias.servicios.edit', { barberia: barbId, servicio: s.id })}
                                                    aria-label={`Editar ${s.name}`}
                                                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-brand-primary transition hover:bg-brand-accent-soft"
                                                >
                                                    <IconEdit size={16} />
                                                </Link>
                                                {s.active && (
                                                    <button
                                                        onClick={() => handleDeactivate(s)}
                                                        aria-label={`Desactivar ${s.name}`}
                                                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-brand-danger transition hover:bg-brand-danger/10"
                                                    >
                                                        <IconToggleLeft size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                {/* ── Desktop: tabla ── */}
                                <table className="hidden w-full text-left text-sm md:table">
                                    <thead className="bg-brand-bg text-xs uppercase text-brand-text-secondary">
                                        <tr>
                                            <th className="px-6 py-3">Nombre</th>
                                            <th className="px-6 py-3">Precio</th>
                                            <th className="px-6 py-3">Estado</th>
                                            <th className="px-6 py-3 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-border">
                                        {servicios.map((s) => (
                                            <tr key={s.id} className="hover:bg-brand-bg">
                                                <td className="px-6 py-4 font-medium text-brand-text">{s.name}</td>
                                                <td className="px-6 py-4 text-brand-text-secondary">
                                                    ${Number(s.price).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {s.active ? (
                                                        <span className="inline-flex items-center rounded-full bg-brand-success-soft px-2 py-0.5 text-xs font-medium text-brand-success-soft-text">
                                                            Activo
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-brand-border px-2 py-0.5 text-xs font-medium text-brand-text-secondary">
                                                            Inactivo
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={route('owner.barberias.servicios.edit', { barberia: barbId, servicio: s.id })}
                                                            aria-label={`Editar ${s.name}`}
                                                            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-brand-primary transition hover:bg-brand-accent-soft"
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
        </AuthenticatedLayout>
    );
}
