import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    IconEdit,
    IconSearch,
    IconUserX,
    IconUsers,
} from '@tabler/icons-react';
import { useState } from 'react';

function initials(name) {
    return name
        .split(' ')
        .map((word) => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function Avatar({ name }) {
    return (
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-brand-primary/12 font-display text-xl font-bold tracking-[-0.04em] text-brand-primary shadow-sm">
            {initials(name)}
        </span>
    );
}

function SalaryBadge({ barbero }) {
    if (barbero.salary_type === 'fixed') {
        return (
            <span className="inline-flex items-center rounded-full bg-brand-border px-3 py-1 text-xs font-semibold text-brand-text-secondary">
                Fijo {`$${Number(barbero.salary_amount).toLocaleString('es-AR')}`}
            </span>
        );
    }

    return (
        <span className="inline-flex items-center rounded-full border border-brand-border bg-brand-surface-alt px-3 py-1 text-xs font-semibold text-brand-text">
            Comision {barbero.commission_pct}%
        </span>
    );
}

function MetricTile({ label, value, tone = 'default' }) {
    const toneClassName = tone === 'success'
        ? 'text-brand-success'
        : tone === 'danger'
            ? 'text-brand-danger'
            : 'text-brand-text';

    return (
        <div className="rounded-[22px] bg-brand-surface-alt px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                {label}
            </p>
            <p className={`mt-2 text-2xl font-bold ${toneClassName}`}>
                {value}
            </p>
        </div>
    );
}

export default function Index({ barberos, planLimit }) {
    const { flash, currentBarberia } = usePage().props;
    const credentialFlash = flash.newBarbero || flash.resetPassword;
    const [showCredential, setShowCredential] = useState(Boolean(credentialFlash));
    const [busqueda, setBusqueda] = useState('');

    const barbId = currentBarberia?.id;
    const atLimit = planLimit.max !== null && planLimit.totalOwner >= planLimit.max;
    const progresoPlan = planLimit.max !== null ? Math.min(100, (planLimit.totalOwner / planLimit.max) * 100) : 0;
    const cuposDisponibles = planLimit.max === null ? 'Sin limite' : Math.max(planLimit.max - planLimit.totalOwner, 0);
    const conSueldoFijo = barberos.filter((barbero) => barbero.salary_type === 'fixed').length;
    const aComision = barberos.length - conSueldoFijo;

    const barberosFiltrados = barberos.filter((barbero) => {
        const termino = busqueda.toLowerCase();

        return [
            barbero.name,
            barbero.email,
            barbero.phone || '',
        ].some((value) => value.toLowerCase().includes(termino));
    });

    function handleDeactivate(barbero) {
        if (! confirm(`Dar de baja a "${barbero.name}"? Su cuenta dejara de estar activa.`)) return;
        router.patch(route('owner.barberias.barberos.deactivate', { barberia: barbId, barbero: barbero.id }));
    }

    return (
        <AuthenticatedLayout
            headerClassName="bg-brand-bg"
            headerContainerClassName="mx-auto max-w-[1720px] px-2 py-4 sm:px-3 sm:py-5 lg:px-4"
            header={(
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="font-display text-3xl font-bold tracking-[-0.04em] text-brand-text sm:text-4xl">
                            Barberos
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-brand-text-secondary">
                            Administra tu equipo, revisa el esquema de pago de cada barbero y entra rapido a su perfil para seguir su rendimiento.
                        </p>
                    </div>

                    <Link
                        href={route('owner.barberias.barberos.create', { barberia: barbId })}
                        className={`inline-flex min-h-[46px] items-center justify-center rounded-full px-5 text-sm font-semibold shadow-brand-cta transition ${
                            atLimit
                                ? 'cursor-not-allowed bg-brand-text-secondary text-brand-on-primary'
                                : 'bg-brand-primary text-brand-on-primary hover:bg-brand-primary-hover'
                        }`}
                        onClick={atLimit ? (event) => event.preventDefault() : undefined}
                    >
                        + Nuevo barbero
                    </Link>
                </div>
            )}
        >
            <Head title="Barberos" />

            <div className="pb-12">
                <div className="mx-auto max-w-[1720px] space-y-8 px-2 sm:px-3 lg:px-4">
                    {showCredential && credentialFlash && (
                        <div className="rounded-[24px] border border-brand-success/20 bg-brand-success-soft px-5 py-5 shadow-brand-card sm:px-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-brand-success">
                                        {flash.newBarbero ? 'Barbero creado exitosamente' : 'Contrasena reseteada'}
                                    </p>
                                    <p className="mt-2 text-sm text-brand-success-soft-text">
                                        Comparte esta clave con <span className="font-semibold">{credentialFlash.name}</span>. Solo se muestra una vez.
                                    </p>
                                    <p className="mt-4 inline-flex rounded-2xl border border-brand-success/20 bg-brand-surface px-4 py-2 font-mono text-lg font-bold tracking-[0.18em] text-brand-text">
                                        {credentialFlash.password}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowCredential(false)}
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-brand-success/20 bg-brand-surface text-sm font-semibold text-brand-success transition hover:bg-brand-success/10"
                                    aria-label="Cerrar alerta"
                                >
                                    X
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex min-w-0 items-start gap-4">
                                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-brand-primary/12 text-brand-primary shadow-sm">
                                        <IconUsers size={30} stroke={1.8} />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-brand-text-secondary">
                                            Equipo activo
                                        </p>
                                        <p className="mt-3 truncate font-display text-4xl font-extrabold tracking-[-0.04em] text-brand-text sm:text-[3.25rem]">
                                            {barberos.length}
                                        </p>
                                        <p className="mt-2 text-sm text-brand-text-secondary">
                                            {barberos.length === 1 ? 'Barbero activo' : 'Barberos activos'} en esta barberia.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                <MetricTile label="Sueldo fijo" value={conSueldoFijo} />
                                <MetricTile label="A comision" value={aComision} />
                                <MetricTile
                                    label="Cupos disponibles"
                                    value={cuposDisponibles}
                                    tone={atLimit ? 'danger' : 'default'}
                                />
                            </div>
                        </section>

                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-semibold tracking-[-0.03em] text-brand-text">
                                        Filtra el equipo y revisa tu capacidad
                                    </h3>
                                    <p className="mt-2 text-xs text-brand-text-secondary">
                                        Busca por nombre, mail o telefono y controla cuanto espacio te queda dentro del plan.
                                    </p>
                                </div>
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-link shadow-sm">
                                    <IconSearch size={22} stroke={1.8} />
                                </span>
                            </div>

                            <div className="mt-6 rounded-[22px] bg-brand-surface-alt p-3">
                                <div className="relative">
                                    <IconSearch
                                        size={18}
                                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-secondary"
                                    />
                                    <input
                                        type="search"
                                        value={busqueda}
                                        onChange={(event) => setBusqueda(event.target.value)}
                                        placeholder="Buscar barbero..."
                                        className="w-full rounded-full border border-brand-border bg-brand-surface py-3.5 pl-11 pr-4 text-sm text-brand-text placeholder-brand-text-secondary shadow-sm transition focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                    />
                                </div>
                            </div>

                            <div className="mt-5 rounded-[22px] bg-brand-surface-alt px-4 py-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                        Uso del plan
                                    </p>
                                    <p className={`text-sm font-semibold ${atLimit ? 'text-brand-danger' : 'text-brand-text'}`}>
                                        {planLimit.totalOwner}
                                        {planLimit.max !== null ? `/${planLimit.max}` : ''}
                                    </p>
                                </div>

                                {planLimit.max !== null ? (
                                    <>
                                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-primary-soft">
                                            <div
                                                className={`h-2 rounded-full transition-all ${atLimit ? 'bg-brand-danger' : 'bg-brand-primary'}`}
                                                style={{ width: `${progresoPlan}%` }}
                                            />
                                        </div>
                                        <p className={`mt-3 text-sm ${atLimit ? 'text-brand-danger' : 'text-brand-text-secondary'}`}>
                                            {atLimit
                                                ? 'Alcanzaste el limite de tu plan para sumar mas barberos.'
                                                : `Tienes ${cuposDisponibles} cupo${cuposDisponibles === 1 ? '' : 's'} disponible${cuposDisponibles === 1 ? '' : 's'} entre todas tus barberias.`}
                                        </p>
                                    </>
                                ) : (
                                    <p className="mt-3 text-sm text-brand-text-secondary">
                                        Tu plan actual no tiene limite de barberos.
                                    </p>
                                )}
                            </div>
                        </section>
                    </div>

                    <section className="space-y-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h3 className="font-display text-lg font-bold text-brand-text">
                                    Tu equipo
                                </h3>
                                <p className="text-sm text-brand-text-secondary">
                                    {busqueda
                                        ? `${barberosFiltrados.length} resultado${barberosFiltrados.length === 1 ? '' : 's'} para "${busqueda}".`
                                        : 'Entra al perfil de cada barbero, edita sus datos o dalo de baja cuando lo necesites.'}
                                </p>
                            </div>
                        </div>

                        {barberosFiltrados.length === 0 ? (
                            <div className="rounded-[28px] border border-dashed border-brand-border bg-brand-surface-alt p-10 text-center shadow-brand-card">
                                <h4 className="font-display text-xl font-bold text-brand-text">
                                    {busqueda ? 'No encontramos ese barbero' : 'Todavia no tienes barberos activos'}
                                </h4>
                                <p className="mx-auto mt-3 max-w-xl text-sm text-brand-text-secondary">
                                    {busqueda
                                        ? 'Prueba con otro termino o limpia la busqueda para volver a ver todo el equipo.'
                                        : 'Crea tu primer barbero para empezar a asignar trabajo, seguir su rendimiento y registrar cortes.'}
                                </p>
                                {!busqueda && !atLimit && (
                                    <Link
                                        href={route('owner.barberias.barberos.create', { barberia: barbId })}
                                        className="mt-5 inline-flex min-h-[46px] items-center justify-center rounded-full bg-brand-primary px-5 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover"
                                    >
                                        Crear el primero
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
                                {barberosFiltrados.map((barbero) => (
                                    <article
                                        key={barbero.id}
                                        className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card transition hover:-translate-y-0.5 hover:shadow-brand-card-hover sm:p-7"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex min-w-0 items-start gap-4">
                                                <Avatar name={barbero.name} />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-brand-text-secondary">
                                                        Barbero
                                                    </p>
                                                    <h4 className="mt-2 truncate font-display text-2xl font-bold tracking-[-0.04em] text-brand-text">
                                                        {barbero.name}
                                                    </h4>
                                                    <div className="mt-3">
                                                        <SalaryBadge barbero={barbero} />
                                                    </div>
                                                </div>
                                            </div>

                                            <span className="shrink-0 rounded-full bg-brand-success-soft px-3 py-1 text-xs font-semibold text-brand-success-soft-text">
                                                Activo
                                            </span>
                                        </div>

                                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-[22px] bg-brand-surface-alt px-4 py-4">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                                    Contacto
                                                </p>
                                                <p className="mt-2 truncate text-sm font-semibold text-brand-text">
                                                    {barbero.email}
                                                </p>
                                                <p className="mt-1 text-sm text-brand-text-secondary">
                                                    {barbero.phone || 'Sin telefono cargado'}
                                                </p>
                                            </div>

                                            <div className="rounded-[22px] bg-brand-surface-alt px-4 py-4">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                                    Modalidad
                                                </p>
                                                <p className="mt-2 text-sm font-semibold text-brand-text">
                                                    {barbero.salary_type === 'fixed' ? 'Sueldo fijo' : 'Comision'}
                                                </p>
                                                <p className="mt-1 text-sm text-brand-text-secondary">
                                                    {barbero.salary_type === 'fixed'
                                                        ? `Monto mensual ${`$${Number(barbero.salary_amount).toLocaleString('es-AR')}`}`
                                                        : `${barbero.commission_pct}% por corte`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-5 flex items-center justify-between gap-3 rounded-[18px] bg-brand-surface-alt px-4 py-3 text-sm">
                                            <span className="font-medium text-brand-text-secondary">
                                                Perfil listo para seguimiento y gestion.
                                            </span>
                                            <span className="rounded-full bg-brand-surface px-2.5 py-1 text-xs font-semibold text-brand-text-secondary">
                                                Equipo
                                            </span>
                                        </div>

                                        <div className="mt-5 flex items-center justify-between gap-3 border-t border-brand-border-subtle pt-5">
                                            <Link
                                                href={route('owner.barberias.barberos.show', { barberia: barbId, barbero: barbero.id })}
                                                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-brand-border bg-brand-surface-alt px-4 text-sm font-semibold text-brand-text transition hover:border-brand-primary/20 hover:bg-brand-primary/5 hover:text-brand-link"
                                            >
                                                Ver perfil
                                            </Link>

                                            <div className="flex shrink-0 items-center gap-2">
                                                <Link
                                                    href={route('owner.barberias.barberos.edit', { barberia: barbId, barbero: barbero.id })}
                                                    aria-label={`Editar ${barbero.name}`}
                                                    title="Editar"
                                                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-border bg-brand-surface-alt text-brand-link transition hover:border-brand-primary/20 hover:bg-brand-primary/5"
                                                >
                                                    <IconEdit size={17} />
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDeactivate(barbero)}
                                                    aria-label={`Dar de baja a ${barbero.name}`}
                                                    title="Dar de baja"
                                                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-danger/20 bg-brand-danger/5 text-brand-danger transition hover:bg-brand-danger/10"
                                                >
                                                    <IconUserX size={17} />
                                                </button>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
