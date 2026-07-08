import RegistroCorteForm from '@/Components/Cortes/RegistroCorteForm';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { IconCalendar, IconReceipt2, IconScissors } from '@tabler/icons-react';

function formatMoney(value) {
    return `$${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function MetricTile({ label, value, tone = 'default' }) {
    const toneClassName = tone === 'success'
        ? 'text-brand-success'
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

export default function Index({ servicios, mediosPago, cortesHoy, routes }) {
    const { currentBarberia } = usePage().props;
    const totalHoy = cortesHoy.reduce((sum, corte) => sum + Number(corte.price), 0);

    return (
        <AuthenticatedLayout
            headerClassName="bg-brand-bg"
            headerContainerClassName="mx-auto max-w-[1720px] px-2 py-4 sm:px-3 sm:py-5 lg:px-4"
            header={(
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-medium text-brand-text-secondary">
                            Operacion diaria
                        </p>
                        <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] text-brand-text sm:text-4xl">
                            Cargar corte
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-brand-text-secondary">
                            Registra cada corte con su cliente, servicio y medio de pago para mantener la facturacion del dia siempre al dia.
                        </p>
                    </div>

                    <Link
                        href={route('owner.barberias.dashboard', { barberia: currentBarberia.id })}
                        className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-brand-text-secondary transition hover:text-brand-text"
                    >
                        Volver al dashboard
                    </Link>
                </div>
            )}
        >
            <Head title="Cargar corte" />

            <div className="pb-12">
                <div className="mx-auto max-w-[1720px] space-y-8 px-2 sm:px-3 lg:px-4">
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex min-w-0 items-start gap-4">
                                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-brand-primary/12 text-brand-primary shadow-sm">
                                        <IconScissors size={30} stroke={1.8} />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-brand-text-secondary">
                                            Registro del dia
                                        </p>
                                        <p className="mt-3 truncate font-display text-4xl font-extrabold tracking-[-0.04em] text-brand-text sm:text-[3.25rem]">
                                            {cortesHoy.length}
                                        </p>
                                        <p className="mt-2 text-sm text-brand-text-secondary">
                                            {cortesHoy.length === 1 ? 'Corte cargado hoy' : 'Cortes cargados hoy'} en esta barberia.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                <MetricTile label="Facturado hoy" value={formatMoney(totalHoy)} tone="success" />
                                <MetricTile label="Servicios activos" value={servicios.length} />
                                <MetricTile label="Medios de pago" value={mediosPago.length} />
                            </div>
                        </section>

                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-brand-text-secondary">
                                        Flujo de carga
                                    </p>
                                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-brand-text">
                                        Todo listo para registrar
                                    </h3>
                                    <p className="mt-2 text-xs text-brand-text-secondary">
                                        Elige cliente, servicio y medio de pago para que el corte impacte automaticamente en tu operacion diaria.
                                    </p>
                                </div>
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-link shadow-sm">
                                    <IconReceipt2 size={22} stroke={1.8} />
                                </span>
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-[22px] bg-brand-surface-alt px-4 py-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                        Fecha operativa
                                    </p>
                                    <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-brand-text">
                                        <IconCalendar size={16} stroke={1.8} />
                                        Hoy
                                    </div>
                                </div>

                                <div className="rounded-[22px] bg-brand-surface-alt px-4 py-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                        Barberia
                                    </p>
                                    <p className="mt-2 truncate text-sm font-semibold text-brand-text">
                                        {currentBarberia?.name}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <RegistroCorteForm
                        servicios={servicios}
                        mediosPago={mediosPago}
                        cortesHoy={cortesHoy}
                        routes={routes}
                        variant="owner"
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
