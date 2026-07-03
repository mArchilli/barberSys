import MonthSelector from '@/Components/MonthSelector';
import RankingList from '@/Components/RankingList';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { IconCoin, IconLock, IconReceipt2 } from '@tabler/icons-react';

function formatMoney(value) {
    return `$${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Dashboard({
    period,
    totalFacturado,
    totalCortes,
    barberosActivos,
    rankingBarberosEnabled,
    porBarbero,
    porServicio,
    porMedioPago,
}) {
    const { currentBarberia } = usePage().props;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Dashboard — {currentBarberia?.name}
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="pt-6 pb-24 sm:pt-12 sm:pb-16">
                <div className="mx-auto max-w-5xl space-y-8 px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-end">
                        <MonthSelector
                            month={period.month}
                            url={route('owner.barberias.dashboard', currentBarberia.id)}
                        />
                    </div>

                    <div className="rounded-brand-xl bg-brand-nav-bg p-6 shadow-brand-floating">
                        <div className="flex items-center gap-4">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-primary/20 text-brand-nav-active">
                                <IconCoin size={24} stroke={1.75} />
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm text-brand-text-on-dark">Facturación del período</p>
                                <p className="truncate font-display text-3xl font-bold text-white sm:text-4xl">
                                    {formatMoney(totalFacturado)}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-2 divide-x divide-white/10 border-t border-white/10 pt-4">
                            <div className="pr-4">
                                <p className="text-xs text-brand-text-on-dark">Cortes cargados</p>
                                <p className="mt-1 text-lg font-semibold text-white">{totalCortes}</p>
                            </div>
                            <div className="pl-4">
                                <p className="text-xs text-brand-text-on-dark">Barberos activos</p>
                                <p className="mt-1 text-lg font-semibold text-white">{barberosActivos}</p>
                            </div>
                        </div>
                    </div>

                    <section className="space-y-3">
                        <h3 className="font-display text-lg font-bold text-brand-text">Facturación por barbero</h3>
                        {rankingBarberosEnabled ? (
                            <RankingList
                                items={porBarbero}
                                emptyLabel="Todavía no hay cortes cargados en este período."
                                avatars
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-2 rounded-brand-md border border-dashed border-brand-border bg-brand-surface-alt p-6 text-center">
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary-soft-text">
                                    <IconLock size={20} stroke={1.75} />
                                </span>
                                <p className="text-sm font-semibold text-brand-text">Disponible desde el plan Crecimiento</p>
                                <p className="max-w-sm text-xs text-brand-text-secondary">
                                    Descubrí qué barbero factura más y tomá mejores decisiones sobre tu equipo.
                                </p>
                                {/* Placeholder: todavía no existe un flujo de upgrade de plan dentro del panel */}
                                <a href="#" className="text-sm font-semibold text-brand-primary hover:text-brand-primary-hover">
                                    Ver planes →
                                </a>
                            </div>
                        )}
                    </section>

                    <section className="space-y-3">
                        <h3 className="font-display text-lg font-bold text-brand-text">Servicios más vendidos</h3>
                        <RankingList items={porServicio} emptyLabel="Todavía no hay servicios cargados en este período." />
                    </section>

                    <section className="space-y-3">
                        <h3 className="font-display text-lg font-bold text-brand-text">Medios de pago</h3>
                        <RankingList items={porMedioPago} emptyLabel="Todavía no hay cortes cargados en este período." />
                    </section>
                </div>
            </div>

            <Link
                href={route('owner.barberias.cortes.index', currentBarberia.id)}
                className="fixed bottom-4 right-4 z-30 inline-flex h-12 items-center gap-2 rounded-brand-pill bg-brand-primary px-5 text-sm font-semibold text-white shadow-brand-cta transition hover:bg-brand-primary-hover sm:bottom-6 sm:right-6"
            >
                <IconReceipt2 size={20} stroke={1.75} />
                Cargar corte
            </Link>
        </AuthenticatedLayout>
    );
}
