import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { IconEdit, IconToggleLeft } from '@tabler/icons-react';
import { useState } from 'react';

export default function Index({ clientes }) {
    const { flash, currentBarberia } = usePage().props;
    const barbId = currentBarberia?.id;

    const [busqueda, setBusqueda] = useState('');

    const clientesFiltrados = clientes.filter((c) =>
        c.name.toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.phone && c.phone.includes(busqueda)),
    );

    function handleDeactivate(cliente) {
        if (! confirm(`¿Desactivar a "${cliente.name}"? Dejará de aparecer disponible para nuevos cortes.`)) return;
        router.patch(route('owner.barberias.clientes.deactivate', { barberia: barbId, cliente: cliente.id }));
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Clientes
                </h2>
            }
        >
            <Head title="Clientes" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-xl border border-brand-success/30 bg-brand-success/10 p-4 text-sm text-brand-success">
                            {flash.success}
                        </div>
                    )}

                    {/* Buscador */}
                    <div className="mb-4">
                        <input
                            type="search"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar por nombre o teléfono…"
                            className="w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-3 text-sm text-brand-text placeholder-brand-text-secondary shadow-sm focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary sm:max-w-sm sm:py-2"
                        />
                    </div>

                    <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-brand-card">
                        {clientesFiltrados.length === 0 ? (
                            <div className="p-8 text-center text-brand-text-secondary">
                                {busqueda
                                    ? 'No se encontraron clientes con ese criterio.'
                                    : 'Todavía no hay clientes registrados. Se crean automáticamente al cargar un corte.'
                                }
                            </div>
                        ) : (
                            <>
                                {/* ── Mobile: cards ── */}
                                <ul className="divide-y divide-brand-border md:hidden">
                                    {clientesFiltrados.map((c) => (
                                        <li key={c.id} className="flex items-center gap-3 px-4 py-4">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium text-brand-text">{c.name}</p>
                                                {c.phone && (
                                                    <p className="mt-0.5 text-sm text-brand-text-secondary">{c.phone}</p>
                                                )}
                                                {! c.active && (
                                                    <span className="mt-1 inline-flex items-center rounded-full bg-brand-border px-2 py-0.5 text-xs font-medium text-brand-text-secondary">
                                                        Inactivo
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex shrink-0 items-center gap-1">
                                                <Link
                                                    href={route('owner.barberias.clientes.edit', { barberia: barbId, cliente: c.id })}
                                                    aria-label={`Editar ${c.name}`}
                                                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-brand-link transition hover:bg-brand-primary-soft"
                                                >
                                                    <IconEdit size={16} />
                                                </Link>
                                                {c.active && (
                                                    <button
                                                        onClick={() => handleDeactivate(c)}
                                                        aria-label={`Desactivar ${c.name}`}
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
                                            <th className="px-6 py-3">Teléfono</th>
                                            <th className="px-6 py-3">Estado</th>
                                            <th className="px-6 py-3 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-border">
                                        {clientesFiltrados.map((c) => (
                                            <tr key={c.id} className="hover:bg-brand-bg">
                                                <td className="px-6 py-4 font-medium text-brand-text">{c.name}</td>
                                                <td className="px-6 py-4 text-brand-text-secondary">
                                                    {c.phone ?? <span className="text-brand-text-secondary/40">—</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {c.active ? (
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
                                                            href={route('owner.barberias.clientes.edit', { barberia: barbId, cliente: c.id })}
                                                            aria-label={`Editar ${c.name}`}
                                                            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-brand-link transition hover:bg-brand-primary-soft"
                                                        >
                                                            <IconEdit size={16} />
                                                        </Link>
                                                        {c.active && (
                                                            <button
                                                                onClick={() => handleDeactivate(c)}
                                                                aria-label={`Desactivar ${c.name}`}
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
