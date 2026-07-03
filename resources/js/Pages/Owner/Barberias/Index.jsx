import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { IconChevronDown, IconEdit, IconLock } from '@tabler/icons-react';
import { useState } from 'react';

export default function Index({ barberias, barberiasCerradas, planLimit }) {
    const { flash } = usePage().props;
    const atLimit = planLimit.max !== null && planLimit.current >= planLimit.max;
    const [showCerradas, setShowCerradas] = useState(false);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-brand-text">
                        Mis barberías
                    </h2>
                    <Link
                        href={route('owner.barberias.create')}
                        className={`inline-flex items-center justify-center rounded-brand-pill px-4 py-3 text-sm font-medium text-white shadow-sm transition sm:py-2 ${
                            atLimit
                                ? 'cursor-not-allowed bg-brand-text-secondary'
                                : 'bg-brand-primary hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2'
                        }`}
                        onClick={atLimit ? (e) => e.preventDefault() : undefined}
                    >
                        + Nueva barbería
                    </Link>
                </div>
            }
        >
            <Head title="Mis barberías" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-4xl space-y-4 px-4 sm:px-6 lg:px-8">

                    {flash?.success && (
                        <div className="rounded-brand-md border border-brand-success/30 bg-brand-success-soft p-4 text-sm text-brand-success">
                            {flash.success}
                        </div>
                    )}

                    {/* Contador de plan */}
                    <div className="rounded-brand-md border border-brand-border bg-brand-surface px-4 py-4 shadow-brand-card sm:px-6">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-brand-text-secondary">
                                Seleccioná la barbería que querés gestionar.
                            </p>
                            <div className="text-sm text-brand-text-secondary">
                                Barberías:{' '}
                                <span className={`font-semibold ${atLimit ? 'text-brand-danger' : 'text-brand-text'}`}>
                                    {planLimit.current}
                                    {planLimit.max !== null ? `/${planLimit.max}` : ''}
                                </span>
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
                                        style={{ width: `${Math.min(100, (planLimit.current / planLimit.max) * 100)}%` }}
                                    />
                                </div>
                                {atLimit && (
                                    <p className="mt-1.5 text-xs text-brand-danger">
                                        Alcanzaste el límite de tu plan — actualizá tu plan para agregar más barberías
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                    {barberias.length === 0 ? (
                        <div className="rounded-brand-lg border border-brand-border bg-brand-surface p-8 text-center text-brand-text-secondary shadow-brand-card">
                            No tenés barberías activas cargadas.{' '}
                            {! atLimit && (
                                <Link href={route('owner.barberias.create')} className="text-brand-primary hover:underline">
                                    Crear la primera
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {barberias.map((barberia) => (
                                <div
                                    key={barberia.id}
                                    className="group relative rounded-brand-lg border border-brand-border bg-brand-surface shadow-brand-card transition hover:border-brand-primary hover:shadow-brand-card-hover"
                                >
                                    <Link
                                        href={route('owner.barberias.dashboard', barberia.id)}
                                        className="flex flex-col gap-1 p-6"
                                    >
                                        <h3 className="pr-8 text-lg font-semibold text-brand-text transition group-hover:text-brand-primary">
                                            {barberia.name}
                                        </h3>
                                        {barberia.address && (
                                            <p className="text-sm text-brand-text-secondary">{barberia.address}</p>
                                        )}
                                        <span className="mt-3 text-sm font-medium text-brand-primary">
                                            Gestionar →
                                        </span>
                                    </Link>
                                    <Link
                                        href={route('owner.barberias.edit', barberia.id)}
                                        aria-label={`Editar ${barberia.name}`}
                                        title="Editar"
                                        className="absolute right-2 top-2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-brand-text-secondary transition hover:bg-brand-primary-soft hover:text-brand-primary"
                                    >
                                        <IconEdit size={16} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}

                    {barberiasCerradas.length > 0 && (
                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => setShowCerradas((v) => !v)}
                                className="flex min-h-[44px] w-full items-center justify-between rounded-brand-md border border-brand-border bg-brand-surface-alt px-4 text-sm font-medium text-brand-text-secondary transition hover:text-brand-text sm:px-6"
                            >
                                <span>Barberías cerradas ({barberiasCerradas.length})</span>
                                <IconChevronDown
                                    size={18}
                                    className={`transition-transform ${showCerradas ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {showCerradas && (
                                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                                    {barberiasCerradas.map((barberia) => (
                                        <Link
                                            key={barberia.id}
                                            href={route('owner.barberias.dashboard', barberia.id)}
                                            className="group flex flex-col gap-1 rounded-brand-lg border border-brand-border bg-brand-surface-alt p-6 opacity-80 shadow-brand-card transition hover:border-brand-primary hover:opacity-100"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="text-lg font-semibold text-brand-text transition group-hover:text-brand-primary">
                                                    {barberia.name}
                                                </h3>
                                                <span className="inline-flex items-center gap-1 rounded-brand-pill border border-brand-border bg-brand-surface px-2.5 py-1 text-xs font-medium text-brand-text-secondary">
                                                    <IconLock size={12} />
                                                    Cerrada
                                                </span>
                                            </div>
                                            {barberia.address && (
                                                <p className="text-sm text-brand-text-secondary">{barberia.address}</p>
                                            )}
                                            <span className="mt-3 text-sm font-medium text-brand-primary">
                                                Ver historial →
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
