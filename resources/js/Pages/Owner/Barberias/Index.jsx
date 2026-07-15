import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { IconChevronDown, IconEdit, IconLock, IconMapPin, IconScissors } from '@tabler/icons-react';
import { useState } from 'react';

function MetricTile({ label, value, tone = 'default' }) {
    const toneClassName = tone === 'success'
        ? 'text-brand-success'
        : tone === 'danger'
            ? 'text-brand-danger'
            : 'text-brand-text';

    return (
        <div className="flex min-h-[112px] flex-col justify-between rounded-[20px] border border-brand-border-subtle bg-brand-surface-alt p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                {label}
            </p>
            <p className={`mt-3 font-display text-3xl font-extrabold tracking-[-0.04em] ${toneClassName}`}>
                {value}
            </p>
        </div>
    );
}

export default function Index({ barberias, barberiasCerradas, planLimit }) {
    const { flash } = usePage().props;
    const atLimit = planLimit.max !== null && planLimit.current >= planLimit.max;
    const [showCerradas, setShowCerradas] = useState(false);
    const cuposDisponibles = planLimit.max === null ? 'Sin limite' : Math.max(planLimit.max - planLimit.current, 0);
    const progresoPlan = planLimit.max !== null ? Math.min(100, (planLimit.current / planLimit.max) * 100) : 0;

    return (
        <AuthenticatedLayout
            headerClassName="bg-brand-bg"
            headerContainerClassName="mx-auto max-w-[1720px] px-2 py-4 sm:px-3 sm:py-5 lg:px-4"
            header={(
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] text-brand-text sm:text-4xl">
                            Mis barberias
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-brand-text-secondary">
                            Eligi que sucursal gestionar, revisa el uso de tu plan y mantene ordenadas las barberias.
                        </p>
                    </div>

                    <Link
                        href={route('owner.barberias.create')}
                        className={`inline-flex min-h-[46px] items-center justify-center rounded-full px-5 text-sm font-semibold shadow-brand-cta transition ${
                            atLimit
                                ? 'cursor-not-allowed bg-brand-primary-hover text-brand-on-primary'
                                : 'bg-brand-primary text-brand-on-primary hover:bg-brand-primary-hover'
                        }`}
                        onClick={atLimit ? (event) => event.preventDefault() : undefined}
                    >
                        + Nueva barberia
                    </Link>
                </div>
            )}
        >
            <Head title="Mis barberias" />

            <div className="pb-12">
                <div className="mx-auto max-w-[1720px] space-y-8 px-2 sm:px-3 lg:px-4">
                    {flash?.success && (
                        <div className="rounded-[24px] border border-brand-success/20 bg-brand-success-soft px-5 py-4 text-sm text-brand-success shadow-brand-card">
                            {flash.success}
                        </div>
                    )}

                    <section className="space-y-4">
                        {barberias.length === 0 ? (
                            <div className="rounded-[28px] border border-dashed border-brand-border bg-brand-surface-alt p-10 text-center shadow-brand-card">
                                <h4 className="font-display text-xl font-bold text-brand-text">
                                    Todavia no tienes barberias activas
                                </h4>
                                <p className="mx-auto mt-3 max-w-xl text-sm text-brand-text-secondary">
                                    Crea tu primera barberia para empezar a registrar cortes, barberos, servicios y finanzas desde el panel.
                                </p>
                                {!atLimit && (
                                    <Link
                                        href={route('owner.barberias.create')}
                                        className="mt-5 inline-flex min-h-[46px] items-center justify-center rounded-full bg-brand-primary px-5 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover"
                                    >
                                        Crear la primera
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
                                {barberias.map((barberia) => (
                                    <article
                                        key={barberia.id}
                                        className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card transition hover:-translate-y-0.5 hover:shadow-brand-card-hover sm:p-7"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <h4 className="truncate font-display text-2xl font-bold tracking-[-0.04em] text-brand-text">
                                                    {barberia.name}
                                                </h4>
                                            </div>

                                            <span className="shrink-0 rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-brand-on-primary">
                                                Activa
                                            </span>
                                        </div>

                                        <div className="mt-6 rounded-[22px] bg-brand-surface-alt px-4 py-4">
                                            <div className="flex items-start gap-2">
                                                <IconMapPin size={16} stroke={1.8} className="mt-0.5 shrink-0 text-brand-primary" />
                                                <p className="text-sm font-semibold text-brand-text">
                                                    {barberia.address || 'Sin direccion cargada'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-5 flex items-center justify-between gap-3 border-t border-brand-border-subtle pt-5">
                                            <Link
                                                href={route('owner.barberias.dashboard', barberia.id)}
                                                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-brand-border bg-brand-surface-alt px-4 text-sm font-semibold text-brand-text transition hover:border-brand-primary/20 hover:bg-brand-primary/5 hover:text-brand-link"
                                            >
                                                Gestionar
                                            </Link>

                                            <Link
                                                href={route('owner.barberias.edit', barberia.id)}
                                                aria-label={`Editar ${barberia.name}`}
                                                title="Editar"
                                                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-border bg-brand-surface-alt text-brand-primary transition hover:border-brand-primary/20 hover:bg-brand-primary/5"
                                            >
                                                <IconEdit size={17} />
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="rounded-[28px] border border-brand-border bg-brand-surface p-5 shadow-brand-card sm:p-8 lg:p-10">
                        <div className="mx-auto max-w-4xl">
                            <div className="flex flex-col items-center text-center">
                                <span className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-brand-primary/12 text-brand-primary shadow-sm">
                                    <IconScissors size={24} stroke={1.8} />
                                </span>
                                <p className="mt-4 text-sm font-semibold text-brand-text-secondary">
                                    Resumen de tu red
                                </p>
                                <div className="mt-4 flex flex-wrap items-end justify-center gap-x-3 gap-y-1">
                                    <p className="font-display text-5xl font-extrabold tracking-[-0.05em] text-brand-text sm:text-6xl">
                                        {barberias.length}
                                    </p>
                                    <p className="pb-1.5 text-base font-medium text-brand-text-secondary sm:pb-2 sm:text-lg">
                                        {barberias.length === 1 ? 'barberia operativa' : 'barberias operativas'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 rounded-[24px] border border-brand-border-subtle bg-brand-surface-alt p-5 sm:p-6">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <IconLock size={16} stroke={1.8} className="shrink-0 text-brand-link" />
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                            Capacidad del plan
                                        </p>
                                    </div>
                                    <p className={`text-base font-bold ${atLimit ? 'text-brand-danger' : 'text-brand-text'}`}>
                                        {planLimit.current}
                                        {planLimit.max !== null ? `/${planLimit.max}` : ''}
                                    </p>
                                </div>

                                {planLimit.max !== null ? (
                                    <>
                                        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-brand-primary-soft">
                                            <div
                                                className={`h-2.5 rounded-full transition-all ${atLimit ? 'bg-brand-danger' : 'bg-brand-primary'}`}
                                                style={{ width: `${progresoPlan}%` }}
                                            />
                                        </div>
                                        <p className={`mt-4 border-t border-brand-border-subtle pt-4 text-sm leading-6 ${atLimit ? 'text-brand-danger' : 'text-brand-text-secondary'}`}>
                                            {atLimit
                                                ? 'Alcanzaste el limite de tu plan para sumar mas barberias.'
                                                : `Tienes ${cuposDisponibles} cupo${cuposDisponibles === 1 ? '' : 's'} disponible${cuposDisponibles === 1 ? '' : 's'} para nuevas barberias.`}
                                        </p>
                                    </>
                                ) : (
                                    <p className="mt-3 text-sm text-brand-text-secondary">
                                        Tu plan actual no tiene limite de barberias activas.
                                    </p>
                                )}
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <MetricTile label="Activas" value={barberias.length} tone="success" />
                                <MetricTile
                                    label="Cerradas"
                                    value={barberiasCerradas.length}
                                    tone={barberiasCerradas.length > 0 ? 'danger' : 'default'}
                                />
                                <MetricTile
                                    label="Cupos"
                                    value={cuposDisponibles}
                                    tone={atLimit ? 'danger' : 'default'}
                                />
                            </div>
                        </div>
                    </section>

                    {barberiasCerradas.length > 0 && (
                        <section className="space-y-4">
                            <button
                                type="button"
                                onClick={() => setShowCerradas((value) => !value)}
                                className="flex min-h-[56px] w-full items-center justify-between rounded-[24px] border border-brand-border bg-brand-surface px-5 text-left shadow-brand-card transition hover:border-brand-primary/20 hover:bg-brand-primary/5 sm:px-6"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-brand-text">
                                        Barberias cerradas
                                    </p>
                                    <p className="mt-1 text-sm text-brand-text-secondary">
                                        {barberiasCerradas.length} {barberiasCerradas.length === 1 ? 'sucursal fuera de operacion' : 'sucursales fuera de operacion'}.
                                    </p>
                                </div>
                                <IconChevronDown
                                    size={20}
                                    className={`shrink-0 text-brand-text-secondary transition-transform ${showCerradas ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {showCerradas && (
                                <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
                                    {barberiasCerradas.map((barberia) => (
                                        <article
                                            key={barberia.id}
                                            className="rounded-[28px] border border-brand-border bg-brand-surface-alt p-6 opacity-90 shadow-brand-card transition hover:-translate-y-0.5 hover:opacity-100 hover:shadow-brand-card-hover sm:p-7"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-brand-text-secondary">
                                                        Barberia cerrada
                                                    </p>
                                                    <h4 className="mt-2 truncate font-display text-2xl font-bold tracking-[-0.04em] text-brand-text">
                                                        {barberia.name}
                                                    </h4>
                                                </div>

                                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-surface px-3 py-1 text-xs font-semibold text-brand-text-secondary">
                                                    <IconLock size={12} />
                                                    Cerrada
                                                </span>
                                            </div>

                                            <div className="mt-6 rounded-[22px] bg-brand-surface px-4 py-4">
                                                <div className="flex items-start gap-2">
                                                    <IconMapPin size={16} stroke={1.8} className="mt-0.5 shrink-0 text-brand-primary" />
                                                    <p className="text-sm font-semibold text-brand-text">
                                                        {barberia.address || 'Sin direccion cargada'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between gap-3 rounded-[18px] bg-brand-surface px-4 py-3 text-sm">
                                                <span className="font-medium text-brand-text-secondary">
                                                    Acceso en solo lectura e historial.
                                                </span>
                                                <span className="rounded-full bg-brand-surface-alt px-2.5 py-1 text-xs font-semibold text-brand-text-secondary">
                                                    Historial
                                                </span>
                                            </div>

                                            <div className="mt-5 border-t border-brand-border-subtle pt-5">
                                                <Link
                                                    href={route('owner.barberias.dashboard', barberia.id)}
                                                    className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-brand-border bg-brand-surface px-4 text-sm font-semibold text-brand-text transition hover:border-brand-primary/20 hover:bg-brand-primary/5 hover:text-brand-link"
                                                >
                                                    Ver historial
                                                </Link>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
