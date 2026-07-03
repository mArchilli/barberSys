import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { IconEdit, IconToggleLeft } from '@tabler/icons-react';

export default function Index({ mediosPago }) {
    const { flash, currentBarberia } = usePage().props;
    const barbId = currentBarberia?.id;

    function handleDeactivate(medio) {
        if (! confirm(`¿Desactivar "${medio.name}"? Dejará de estar disponible para nuevos cobros.`)) return;
        router.patch(route('owner.barberias.medios-pago.deactivate', { barberia: barbId, medioPago: medio.id }));
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-brand-text">
                        Medios de pago
                    </h2>
                    <Link
                        href={route('owner.barberias.medios-pago.create', { barberia: barbId })}
                        className="inline-flex items-center justify-center rounded-xl bg-brand-primary px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 sm:py-2"
                    >
                        + Nuevo medio de pago
                    </Link>
                </div>
            }
        >
            <Head title="Medios de pago" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-xl border border-brand-success/30 bg-brand-success/10 p-4 text-sm text-brand-success">
                            {flash.success}
                        </div>
                    )}

                    <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-brand-card">
                        {mediosPago.length === 0 ? (
                            <div className="p-8 text-center text-brand-text-secondary">
                                No hay medios de pago cargados.{' '}
                                <Link
                                    href={route('owner.barberias.medios-pago.create', { barberia: barbId })}
                                    className="text-brand-primary hover:underline"
                                >
                                    Crear el primero
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* ── Mobile: cards ── */}
                                <ul className="divide-y divide-brand-border md:hidden">
                                    {mediosPago.map((m) => (
                                        <li key={m.id} className="flex items-center gap-3 px-4 py-4">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium text-brand-text">{m.name}</p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-1">
                                                <Link
                                                    href={route('owner.barberias.medios-pago.edit', { barberia: barbId, medioPago: m.id })}
                                                    aria-label={`Editar ${m.name}`}
                                                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-brand-primary transition hover:bg-brand-primary-soft"
                                                >
                                                    <IconEdit size={16} />
                                                </Link>
                                                {m.active && (
                                                    <button
                                                        onClick={() => handleDeactivate(m)}
                                                        aria-label={`Desactivar ${m.name}`}
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
                                            <th className="px-6 py-3">Estado</th>
                                            <th className="px-6 py-3 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-border">
                                        {mediosPago.map((m) => (
                                            <tr key={m.id} className="hover:bg-brand-bg">
                                                <td className="px-6 py-4 font-medium text-brand-text">{m.name}</td>
                                                <td className="px-6 py-4">
                                                    {m.active ? (
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
                                                            href={route('owner.barberias.medios-pago.edit', { barberia: barbId, medioPago: m.id })}
                                                            aria-label={`Editar ${m.name}`}
                                                            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-brand-primary transition hover:bg-brand-primary-soft"
                                                        >
                                                            <IconEdit size={16} />
                                                        </Link>
                                                        {m.active && (
                                                            <button
                                                                onClick={() => handleDeactivate(m)}
                                                                aria-label={`Desactivar ${m.name}`}
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
