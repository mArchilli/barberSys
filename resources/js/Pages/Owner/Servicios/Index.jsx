import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { IconEdit, IconTrash } from '@tabler/icons-react';

function BarberiaSelector({ barberias, selectedBarberiaId, onSelect }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-brand-text-secondary">Barbería:</span>
            <select
                value={selectedBarberiaId ?? ''}
                onChange={(e) => onSelect(e.target.value)}
                className="rounded-lg border-brand-border bg-brand-surface py-2 pl-3 pr-8 text-sm text-brand-text shadow-sm focus:border-brand-primary focus:ring-brand-primary"
            >
                {barberias.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                ))}
            </select>
        </div>
    );
}

export default function Index({ servicios, barberias, selectedBarberiaId }) {
    function handleSelectBarberia(id) {
        router.get(route('owner.servicios.index'), { barberia_id: id });
    }

    function handleDeactivate(servicio) {
        if (! confirm(`¿Dar de baja el servicio "${servicio.name}"? Quedará inactivo pero se conservará en los registros históricos.`)) return;
        router.patch(route('owner.servicios.deactivate', servicio.id));
    }

    const createHref = barberias.length > 1
        ? route('owner.servicios.create', { barberia_id: selectedBarberiaId })
        : route('owner.servicios.create');

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-brand-text">
                        Servicios
                    </h2>
                    <Link
                        href={createHref}
                        className="inline-flex items-center justify-center rounded-xl bg-brand-primary px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 sm:py-2"
                    >
                        + Nuevo servicio
                    </Link>
                </div>
            }
        >
            <Head title="Servicios" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">

                    {barberias.length > 1 && (
                        <div className="flex items-center rounded-xl border border-brand-border bg-brand-surface px-4 py-3 shadow-card">
                            <BarberiaSelector
                                barberias={barberias}
                                selectedBarberiaId={selectedBarberiaId}
                                onSelect={handleSelectBarberia}
                            />
                        </div>
                    )}

                    {barberias.length === 0 ? (
                        <div className="rounded-xl border border-brand-border bg-brand-surface p-8 text-center text-brand-text-secondary shadow-card">
                            No tenés barberías activas. Creá una barbería primero.
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-card">
                            {servicios.length === 0 ? (
                                <div className="p-8 text-center text-brand-text-secondary">
                                    Todavía no hay servicios cargados.{' '}
                                    <Link href={createHref} className="text-brand-primary hover:underline">
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
                                                    <p className="text-sm text-brand-text-secondary">
                                                        ${Number(s.price).toLocaleString('es-AR')}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Link
                                                        href={route('owner.servicios.edit', s.id)}
                                                        aria-label={`Editar ${s.name}`}
                                                        title={`Editar ${s.name}`}
                                                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-brand-primary transition hover:bg-brand-accent-soft"
                                                    >
                                                        <IconEdit size={16} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeactivate(s)}
                                                        aria-label={`Dar de baja ${s.name}`}
                                                        title={`Dar de baja ${s.name}`}
                                                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-brand-danger transition hover:bg-brand-bg"
                                                    >
                                                        <IconTrash size={16} />
                                                    </button>
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
                                                <th className="px-6 py-3 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-brand-border">
                                            {servicios.map((s) => (
                                                <tr key={s.id} className="hover:bg-brand-bg">
                                                    <td className="px-6 py-4 font-medium text-brand-text">{s.name}</td>
                                                    <td className="px-6 py-4 text-brand-text-secondary">
                                                        ${Number(s.price).toLocaleString('es-AR')}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Link
                                                                href={route('owner.servicios.edit', s.id)}
                                                                aria-label={`Editar ${s.name}`}
                                                                title={`Editar ${s.name}`}
                                                                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-brand-primary transition hover:bg-brand-accent-soft"
                                                            >
                                                                <IconEdit size={16} />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDeactivate(s)}
                                                                aria-label={`Dar de baja ${s.name}`}
                                                                title={`Dar de baja ${s.name}`}
                                                                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-brand-danger transition hover:bg-brand-bg"
                                                            >
                                                                <IconTrash size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
