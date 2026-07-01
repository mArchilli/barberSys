import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ barberos, planLimit }) {
    const { flash } = usePage().props;
    const credentialFlash = flash.newBarbero || flash.resetPassword;
    const [showCredential, setShowCredential] = useState(!!credentialFlash);

    function handleResetPassword(barbero) {
        if (! confirm(`¿Resetear la contraseña de ${barbero.name}? Se generará una nueva contraseña aleatoria y el barbero deberá cambiarla al ingresar.`)) return;
        router.patch(route('owner.barberos.resetPassword', barbero.id));
    }

    function handleDeactivate(barbero) {
        if (! confirm(`¿Dar de baja a ${barbero.name}? Su cuenta quedará inactiva.`)) return;
        router.patch(route('owner.barberos.deactivate', barbero.id));
    }

    const atLimit = planLimit.max !== null && planLimit.current >= planLimit.max;

    const salaryLabel = (b) =>
        b.salary_type === 'fixed'
            ? `Fijo: $${Number(b.salary_amount).toLocaleString('es-AR')}`
            : `Comisión: ${b.commission_pct}%`;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-brand-text">
                        Barberos
                    </h2>
                    <Link
                        href={route('owner.barberos.create')}
                        className={`inline-flex items-center justify-center rounded-md px-4 py-3 text-sm font-medium text-white shadow-sm transition sm:py-2 ${
                            atLimit
                                ? 'cursor-not-allowed bg-brand-text-secondary'
                                : 'bg-brand-primary hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2'
                        }`}
                        onClick={atLimit ? (e) => e.preventDefault() : undefined}
                    >
                        + Nuevo barbero
                    </Link>
                </div>
            }
        >
            <Head title="Barberos" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">

                    {/* Contraseña generada — se muestra una sola vez */}
                    {showCredential && credentialFlash && (
                        <div className="rounded-lg border border-brand-success/30 bg-brand-success/10 p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="font-semibold text-brand-success">
                                        {flash.newBarbero ? 'Barbero creado exitosamente' : 'Contraseña reseteada'}
                                    </p>
                                    <p className="mt-1 text-sm text-brand-text-secondary">
                                        Pasale esta contraseña a{' '}
                                        <span className="font-medium text-brand-text">{credentialFlash.name}</span>.
                                        No se va a mostrar de nuevo.
                                    </p>
                                    <p className="mt-2 inline-block rounded border border-brand-success/20 bg-brand-surface px-3 py-2 font-mono text-lg font-bold tracking-widest text-brand-text">
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

                    <div className="overflow-hidden bg-brand-surface shadow-sm sm:rounded-lg">
                        {/* Indicador de plan */}
                        <div className="flex items-center justify-between border-b border-brand-border px-4 py-3 sm:px-6">
                            <span className="text-sm text-brand-text-secondary">
                                Barberos activos:{' '}
                                <span className={`font-semibold ${atLimit ? 'text-brand-danger' : 'text-brand-text'}`}>
                                    {planLimit.current}
                                    {planLimit.max !== null && ` / ${planLimit.max}`}
                                </span>
                                {planLimit.max === null && ' (sin límite)'}
                            </span>
                            {atLimit && (
                                <span className="rounded-full bg-brand-danger/10 px-2 py-1 text-xs font-medium text-brand-danger">
                                    Límite alcanzado
                                </span>
                            )}
                        </div>

                        {barberos.length === 0 ? (
                            <div className="p-8 text-center text-brand-text-secondary">
                                Todavía no hay barberos cargados.{' '}
                                {! atLimit && (
                                    <Link
                                        href={route('owner.barberos.create')}
                                        className="text-brand-primary hover:underline"
                                    >
                                        Crear el primero
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* ── Mobile: cards ── */}
                                <ul className="divide-y divide-brand-border/50 md:hidden">
                                    {barberos.map((b) => (
                                        <li key={b.id} className="px-4 py-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="font-medium text-brand-text">{b.name}</p>
                                                    <p className="text-sm text-brand-text-secondary">{b.barberia.name}</p>
                                                    <p className="mt-0.5 text-sm text-brand-text-secondary">{salaryLabel(b)}</p>
                                                </div>
                                                <Link
                                                    href={route('owner.barberos.edit', b.id)}
                                                    className="shrink-0 text-sm font-medium text-brand-primary"
                                                >
                                                    Editar
                                                </Link>
                                            </div>
                                            <div className="mt-3 flex gap-2 border-t border-brand-border/50 pt-3">
                                                <button
                                                    onClick={() => handleResetPassword(b)}
                                                    className="min-h-[44px] flex-1 text-sm text-brand-text-secondary"
                                                >
                                                    Resetear clave
                                                </button>
                                                <button
                                                    onClick={() => handleDeactivate(b)}
                                                    className="min-h-[44px] flex-1 text-sm text-brand-danger"
                                                >
                                                    Dar de baja
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
                                            <th className="px-6 py-3">Email</th>
                                            <th className="px-6 py-3">Teléfono</th>
                                            <th className="px-6 py-3">Barbería</th>
                                            <th className="px-6 py-3">Sueldo</th>
                                            <th className="px-6 py-3 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-border/50">
                                        {barberos.map((b) => (
                                            <tr key={b.id} className="hover:bg-brand-bg">
                                                <td className="px-6 py-4 font-medium text-brand-text">{b.name}</td>
                                                <td className="px-6 py-4 text-brand-text-secondary">{b.email}</td>
                                                <td className="px-6 py-4 text-brand-text-secondary">{b.phone ?? '—'}</td>
                                                <td className="px-6 py-4 text-brand-text-secondary">{b.barberia.name}</td>
                                                <td className="px-6 py-4 text-brand-text-secondary">{salaryLabel(b)}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <Link
                                                            href={route('owner.barberos.edit', b.id)}
                                                            className="font-medium text-brand-primary hover:underline"
                                                        >
                                                            Editar
                                                        </Link>
                                                        <button
                                                            onClick={() => handleResetPassword(b)}
                                                            className="font-medium text-brand-text-secondary hover:underline"
                                                        >
                                                            Resetear clave
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeactivate(b)}
                                                            className="font-medium text-brand-danger hover:underline"
                                                        >
                                                            Dar de baja
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
