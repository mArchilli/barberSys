import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    IconAlertTriangle,
    IconChevronLeft,
    IconEdit,
    IconLock,
    IconMapPin,
    IconScissors,
} from '@tabler/icons-react';
import { useState } from 'react';

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

export default function Edit({ barberia, activeBarberosCount }) {
    const { errors: pageErrors } = usePage().props;
    const { data, setData, put, processing, errors } = useForm({
        name: barberia.name,
        address: barberia.address ?? '',
    });

    const [showCerrarModal, setShowCerrarModal] = useState(false);
    const [cerrando, setCerrando] = useState(false);
    const [reactivando, setReactivando] = useState(false);

    function submit(event) {
        event.preventDefault();
        put(route('owner.barberias.update', barberia.id));
    }

    function confirmarCierre() {
        setCerrando(true);
        router.patch(route('owner.barberias.deactivate', barberia.id), {}, {
            onFinish: () => {
                setCerrando(false);
                setShowCerrarModal(false);
            },
        });
    }

    function reactivar() {
        setReactivando(true);
        router.patch(route('owner.barberias.reactivate', barberia.id), {}, {
            onFinish: () => setReactivando(false),
        });
    }

    return (
        <AuthenticatedLayout
            headerClassName="bg-brand-bg"
            headerContainerClassName="mx-auto max-w-[1720px] px-2 py-4 sm:px-3 sm:py-5 lg:px-4"
            header={(
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-medium text-brand-text-secondary">
                            Configuracion de sucursal
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                            <h2 className="font-display text-3xl font-bold tracking-[-0.04em] text-brand-text sm:text-4xl">
                                Editar barberia
                            </h2>
                            {!barberia.active && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-brand-border px-3 py-1 text-xs font-semibold text-brand-text-secondary">
                                    <IconLock size={12} />
                                    Cerrada
                                </span>
                            )}
                        </div>
                        <p className="mt-2 max-w-2xl text-sm text-brand-text-secondary">
                            Actualiza el nombre y la direccion de la sucursal, o administra su estado operativo desde esta vista.
                        </p>
                    </div>

                    <Link
                        href={route('owner.barberias.index')}
                        className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-brand-text-secondary transition hover:text-brand-text"
                    >
                        <IconChevronLeft size={18} stroke={2} />
                        Volver a mis barberias
                    </Link>
                </div>
            )}
        >
            <Head title="Editar barberia" />

            <div className="pb-12">
                <div className="mx-auto max-w-[1720px] space-y-8 px-2 sm:px-3 lg:px-4">
                    {!barberia.active && (
                        <div className="rounded-[24px] border border-brand-border bg-brand-surface-alt px-5 py-4 text-sm text-brand-text-secondary shadow-brand-card">
                            Esta barberia esta cerrada. Puedes seguir editando su nombre y direccion, pero no se pueden cargar cortes, gastos ni barberos hasta reactivarla.
                        </div>
                    )}

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(320px,0.98fr)]">
                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex min-w-0 items-start gap-4">
                                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-brand-primary/12 text-brand-primary shadow-sm">
                                        <IconScissors size={30} stroke={1.8} />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-brand-text-secondary">
                                            Sucursal
                                        </p>
                                        <p className="mt-3 truncate font-display text-4xl font-extrabold tracking-[-0.04em] text-brand-text sm:text-[3.25rem]">
                                            {data.name || 'Sin nombre'}
                                        </p>
                                        <p className="mt-2 text-sm text-brand-text-secondary">
                                            Mantene actualizada la informacion principal que se muestra en tu panel.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                <MetricTile
                                    label="Estado"
                                    value={barberia.active ? 'Activa' : 'Cerrada'}
                                    tone={barberia.active ? 'success' : 'danger'}
                                />
                                <MetricTile label="Barberos activos" value={activeBarberosCount} />
                                <MetricTile label="Direccion" value={data.address ? 'Cargada' : 'Pendiente'} />
                            </div>
                        </section>

                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-brand-text-secondary">
                                        Estado operativo
                                    </p>
                                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-brand-text">
                                        Gestion de la barberia
                                    </h3>
                                    <p className="mt-2 text-xs text-brand-text-secondary">
                                        Cierra la sucursal temporalmente o vuelve a activarla cuando quieras retomar la operacion.
                                    </p>
                                </div>
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-link shadow-sm">
                                    <IconEdit size={22} stroke={1.8} />
                                </span>
                            </div>

                            <div className="mt-6 rounded-[22px] bg-brand-surface-alt px-4 py-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                    Estado actual
                                </p>
                                <p className={`mt-2 text-lg font-bold ${barberia.active ? 'text-brand-success' : 'text-brand-danger'}`}>
                                    {barberia.active ? 'Operativa' : 'Fuera de operacion'}
                                </p>
                            </div>

                            <div className="mt-4 rounded-[22px] bg-brand-surface-alt px-4 py-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                    Impacto
                                </p>
                                <p className="mt-2 text-sm text-brand-text-secondary">
                                    {barberia.active
                                        ? 'Si la cierras, la barberia y sus barberos activos quedaran inactivos hasta nueva accion.'
                                        : 'Si la reactivas, la sucursal vuelve a estar disponible para operar; los barberos siguen inactivos hasta reactivarlos manualmente.'}
                                </p>
                            </div>
                        </section>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.55fr)]">
                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <form onSubmit={submit} className="space-y-6">
                                <div className="rounded-[24px] bg-brand-surface-alt p-5">
                                    <InputLabel htmlFor="name" value="Nombre de la barberia *" />
                                    <TextInput
                                        id="name"
                                        value={data.name}
                                        onChange={(event) => setData('name', event.target.value)}
                                        className="mt-2 block w-full rounded-full border-brand-border bg-brand-surface px-4 py-3.5"
                                        autoFocus
                                        placeholder="Ej: Barberia Centro"
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div className="rounded-[24px] bg-brand-surface-alt p-5">
                                    <InputLabel htmlFor="address" value="Direccion" />
                                    <TextInput
                                        id="address"
                                        value={data.address}
                                        onChange={(event) => setData('address', event.target.value)}
                                        className="mt-2 block w-full rounded-full border-brand-border bg-brand-surface px-4 py-3.5"
                                        placeholder="Opcional"
                                    />
                                    <InputError message={errors.address} className="mt-2" />
                                </div>

                                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
                                    <Link
                                        href={route('owner.barberias.index')}
                                        className="flex min-h-[44px] items-center justify-center text-sm text-brand-text-secondary hover:text-brand-text sm:min-h-0"
                                    >
                                        Cancelar
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-brand-primary px-6 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                    >
                                        Guardar cambios
                                    </button>
                                </div>
                            </form>
                        </section>

                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-start gap-4">
                                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-brand-primary/12 text-brand-primary shadow-sm">
                                    <IconMapPin size={24} stroke={1.8} />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-brand-text-secondary">
                                        Vista rapida
                                    </p>
                                    <h3 className="mt-2 truncate font-display text-2xl font-bold tracking-[-0.04em] text-brand-text">
                                        {data.name || 'Barberia sin nombre'}
                                    </h3>
                                    <p className="mt-2 text-sm text-brand-text-secondary">
                                        {data.address || 'Sin direccion cargada'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 rounded-[22px] bg-brand-surface-alt px-4 py-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                    Acciones disponibles
                                </p>

                                {barberia.active ? (
                                    <div className="mt-3">
                                        <p className="text-sm text-brand-text-secondary">
                                            Puedes cerrar esta barberia temporalmente sin perder informacion historica.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setShowCerrarModal(true)}
                                            className="mt-4 inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-brand-danger px-5 text-sm font-semibold text-white shadow-brand-cta transition hover:opacity-90"
                                        >
                                            Cerrar barberia
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-3">
                                        <p className="text-sm text-brand-text-secondary">
                                            Reactiva la sucursal para volver a cargar cortes, gastos y nuevas altas.
                                        </p>
                                        {pageErrors?.plan_limit && (
                                            <p className="mt-3 text-sm text-brand-danger">{pageErrors.plan_limit}</p>
                                        )}
                                        <button
                                            type="button"
                                            onClick={reactivar}
                                            disabled={reactivando}
                                            className="mt-4 inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-brand-primary px-5 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            Reactivar barberia
                                        </button>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <Modal show={showCerrarModal} onClose={() => setShowCerrarModal(false)} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-danger/10 text-brand-danger">
                            <IconAlertTriangle size={20} stroke={1.75} />
                        </span>
                        <div>
                            <h2 className="font-display text-lg font-bold text-brand-text">
                                Cerrar "{barberia.name}"?
                            </h2>
                            <p className="mt-2 text-sm text-brand-text-secondary">
                                {activeBarberosCount > 0 ? (
                                    <>
                                        Esta accion tambien dara de baja en cascada a{' '}
                                        <span className="font-semibold text-brand-text">
                                            {activeBarberosCount} {activeBarberosCount === 1 ? 'barbero activo' : 'barberos activos'}
                                        </span>{' '}
                                        de esta barberia. Ninguno pierde su informacion: quedan inactivos y podras reactivarlos individualmente despues.
                                    </>
                                ) : (
                                    'Esta barberia no tiene barberos activos en este momento.'
                                )}
                            </p>
                            <p className="mt-2 text-sm text-brand-text-secondary">
                                La barberia deja de estar disponible para cargar cortes, gastos y nuevas altas hasta que la reactives. No se elimina ningun dato historico.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <SecondaryButton
                            type="button"
                            onClick={() => setShowCerrarModal(false)}
                            className="w-full justify-center sm:w-auto"
                        >
                            Cancelar
                        </SecondaryButton>
                        <DangerButton
                            type="button"
                            onClick={confirmarCierre}
                            disabled={cerrando}
                            className="w-full justify-center sm:w-auto"
                        >
                            Si, cerrar barberia
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
