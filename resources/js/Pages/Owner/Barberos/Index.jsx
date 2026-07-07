import MobileMenuButton from '@/Components/MobileMenuButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

function initials(name) {
    return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function Avatar({ name }) {
    return (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-xs font-semibold text-brand-primary-soft-text">
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

export default function Index({ barberos, planLimit }) {
    const { flash, currentBarberia } = usePage().props;
    const credentialFlash = flash.newBarbero || flash.resetPassword;
    const [showCredential, setShowCredential] = useState(!!credentialFlash);

    const barbId = currentBarberia?.id;

    const atLimit = planLimit.max !== null && planLimit.totalOwner >= planLimit.max;

    return (
        <AuthenticatedLayout
            header={({ onOpenMobileMenu }) => (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-xl font-semibold leading-tight text-brand-text">
                            Barberos
                        </h2>
                        <MobileMenuButton onClick={onOpenMobileMenu} />
                    </div>
                    <Link
                        href={route('owner.barberias.barberos.create', { barberia: barbId })}
                        className={`inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium text-brand-on-primary shadow-sm transition sm:py-2 ${
                            atLimit
                                ? 'cursor-not-allowed bg-brand-text-secondary'
                                : 'bg-brand-primary hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2'
                        }`}
                        onClick={atLimit ? (e) => e.preventDefault() : undefined}
                    >
                        + Nuevo barbero
                    </Link>
                </div>
            )}
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

                    {/* Contador de plan */}
                    <div className="rounded-xl border border-brand-border bg-brand-surface px-4 py-4 shadow-brand-card sm:px-6">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm text-brand-text-secondary">
                                Barberos en esta barbería:{' '}
                                <span className="font-semibold text-brand-text">{planLimit.inBarberia}</span>
                            </div>
                            <div className="text-sm text-brand-text-secondary">
                                Total del plan:{' '}
                                <span className={`font-semibold ${atLimit ? 'text-brand-danger' : 'text-brand-text'}`}>
                                    {planLimit.totalOwner}
                                    {planLimit.max !== null ? `/${planLimit.max}` : ''}
                                </span>
                                {planLimit.max !== null && (
                                    <span className="ml-1 text-xs text-brand-text-secondary">(todas tus barberías)</span>
                                )}
                                {planLimit.max === null && (
                                    <span className="ml-1 text-xs font-normal text-brand-text-secondary">sin límite</span>
                                )}
                            </div>
                        </div>
                        {planLimit.max !== null && (
                            <>
                                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-brand-primary-soft">
                                    <div
                                        className={`h-1.5 rounded-full transition-all ${atLimit ? 'bg-brand-danger' : 'bg-brand-primary'}`}
                                        style={{ width: `${Math.min(100, (planLimit.totalOwner / planLimit.max) * 100)}%` }}
                                    />
                                </div>
                                {atLimit && (
                                    <p className="mt-1.5 text-xs text-brand-danger">
                                        Alcanzaste el límite de tu plan — actualizá tu plan para agregar más barberos
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                    {barberos.length === 0 ? (
                        <div className="rounded-xl border border-brand-border bg-brand-surface p-8 text-center text-brand-text-secondary shadow-brand-card">
                            Todavía no hay barberos en esta barbería.{' '}
                            {! atLimit && (
                                <Link
                                    href={route('owner.barberias.barberos.create', { barberia: barbId })}
                                    className="text-brand-link hover:underline"
                                >
                                    Crear el primero
                                </Link>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* ── Mobile: cards ── */}
                            <div className="grid gap-4 sm:grid-cols-2 md:hidden">
                                {barberos.map((b) => (
                                    <Link
                                        key={b.id}
                                        href={route('owner.barberias.barberos.show', { barberia: barbId, barbero: b.id })}
                                        className="flex items-center gap-3 rounded-brand-lg border border-brand-border bg-brand-surface p-5 shadow-brand-card transition hover:shadow-brand-card-hover"
                                    >
                                        <Avatar name={b.name} />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-semibold text-brand-text">{b.name}</p>
                                            <div className="mt-1.5">
                                                <SalaryBadge barbero={b} />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* ── Desktop: tabla ── */}
                            <div className="hidden overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-brand-card md:block">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-brand-bg text-xs uppercase text-brand-text-secondary">
                                        <tr>
                                            <th className="px-6 py-3">Nombre</th>
                                            <th className="px-6 py-3">Contacto</th>
                                            <th className="px-6 py-3">Sueldo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-border">
                                        {barberos.map((b) => (
                                            <tr
                                                key={b.id}
                                                onClick={() => router.visit(route('owner.barberias.barberos.show', { barberia: barbId, barbero: b.id }))}
                                                className="cursor-pointer hover:bg-brand-bg"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar name={b.name} />
                                                        <Link
                                                            href={route('owner.barberias.barberos.show', { barberia: barbId, barbero: b.id })}
                                                            className="font-medium text-brand-text hover:text-brand-link hover:underline"
                                                        >
                                                            {b.name}
                                                        </Link>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-brand-text-secondary">{b.email}</p>
                                                    {b.phone && (
                                                        <p className="text-xs text-brand-text-secondary">{b.phone}</p>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <SalaryBadge barbero={b} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
