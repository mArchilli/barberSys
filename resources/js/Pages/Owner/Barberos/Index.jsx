import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { IconEdit, IconKey, IconUserX } from '@tabler/icons-react';
import { useState } from 'react';

function initials(name) {
    return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function Avatar({ name }) {
    return (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-accent-soft text-xs font-semibold text-brand-accent-soft-text">
            {initials(name)}
        </span>
    );
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

function ActionButton({ onClick, label, icon: Icon, colorClass }) {
    return (
        <button
            onClick={onClick}
            aria-label={label}
            title={label}
            className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 transition hover:bg-brand-bg ${colorClass}`}
        >
            <Icon size={16} />
        </button>
    );
}

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
    const pct = planLimit.max ? Math.min(100, (planLimit.current / planLimit.max) * 100) : 0;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-brand-text">
                        Barberos
                    </h2>
                    <Link
                        href={route('owner.barberos.create')}
                        className={`inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium text-white shadow-sm transition sm:py-2 ${
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
                        <div className="rounded-xl border border-brand-success/30 bg-brand-success/10 p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="font-semibold text-brand-success">
                                        {flash.newBarbero ? 'Barbero creado exitosamente' : 'Contraseña reseteada'}
                                    </p>
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

                    <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-card">

                        {/* Barra de progreso del plan */}
                        <div className="border-b border-brand-border px-4 py-4 sm:px-6">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm text-brand-text-secondary">Barberos activos</span>
                                <span className="text-sm font-semibold text-brand-text">
                                    {planLimit.current}
                                    {planLimit.max !== null ? ` / ${planLimit.max}` : (
                                        <span className="ml-1 text-xs font-normal text-brand-text-secondary">sin límite</span>
                                    )}
                                </span>
                            </div>
                            {planLimit.max !== null ? (
                                <>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-accent-soft">
                                        <div
                                            className={`h-1.5 rounded-full transition-all ${atLimit ? 'bg-brand-danger' : 'bg-brand-primary'}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    {atLimit && (
                                        <p className="mt-1.5 text-xs text-brand-danger">
                                            Límite alcanzado — actualizá tu plan para agregar más barberos
                                        </p>
                                    )}
                                </>
                            ) : (
                                <div className="h-1.5 w-full rounded-full bg-brand-accent-soft" />
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
                                <ul className="divide-y divide-brand-border md:hidden">
                                    {barberos.map((b) => (
                                        <li key={b.id} className="px-4 py-4">
                                            <div className="flex items-start gap-3">
                                                <Avatar name={b.name} />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium text-brand-text">{b.name}</p>
                                                    <p className="truncate text-sm text-brand-text-secondary">{b.barberia.name}</p>
                                                    <div className="mt-1.5">
                                                        <SalaryBadge barbero={b} />
                                                    </div>
                                                </div>
                                                <Link
                                                    href={route('owner.barberos.edit', b.id)}
                                                    aria-label={`Editar ${b.name}`}
                                                    title={`Editar ${b.name}`}
                                                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-brand-primary transition hover:bg-brand-accent-soft"
                                                >
                                                    <IconEdit size={16} />
                                                </Link>
                                            </div>
                                            <div className="mt-3 flex gap-1 border-t border-brand-border pt-3">
                                                <ActionButton
                                                    onClick={() => handleResetPassword(b)}
                                                    label={`Resetear contraseña de ${b.name}`}
                                                    icon={IconKey}
                                                    colorClass="text-brand-text-secondary"
                                                />
                                                <ActionButton
                                                    onClick={() => handleDeactivate(b)}
                                                    label={`Dar de baja a ${b.name}`}
                                                    icon={IconUserX}
                                                    colorClass="text-brand-danger"
                                                />
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                {/* ── Desktop: tabla ── */}
                                <table className="hidden w-full text-left text-sm md:table">
                                    <thead className="bg-brand-bg text-xs uppercase text-brand-text-secondary">
                                        <tr>
                                            <th className="px-6 py-3">Nombre</th>
                                            <th className="px-6 py-3">Contacto</th>
                                            <th className="px-6 py-3">Barbería</th>
                                            <th className="px-6 py-3">Sueldo</th>
                                            <th className="px-6 py-3 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-border">
                                        {barberos.map((b) => (
                                            <tr key={b.id} className="hover:bg-brand-bg">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar name={b.name} />
                                                        <span className="font-medium text-brand-text">{b.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-brand-text-secondary">{b.email}</p>
                                                    {b.phone && (
                                                        <p className="text-xs text-brand-text-secondary">{b.phone}</p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-brand-text-secondary">{b.barberia.name}</td>
                                                <td className="px-6 py-4">
                                                    <SalaryBadge barbero={b} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={route('owner.barberos.edit', b.id)}
                                                            aria-label={`Editar ${b.name}`}
                                                            title={`Editar ${b.name}`}
                                                            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-brand-primary transition hover:bg-brand-accent-soft"
                                                        >
                                                            <IconEdit size={16} />
                                                        </Link>
                                                        <ActionButton
                                                            onClick={() => handleResetPassword(b)}
                                                            label={`Resetear contraseña de ${b.name}`}
                                                            icon={IconKey}
                                                            colorClass="text-brand-text-secondary"
                                                        />
                                                        <ActionButton
                                                            onClick={() => handleDeactivate(b)}
                                                            label={`Dar de baja a ${b.name}`}
                                                            icon={IconUserX}
                                                            colorClass="text-brand-danger"
                                                        />
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
