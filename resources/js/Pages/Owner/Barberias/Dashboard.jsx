import DaySelector from '@/Components/DaySelector';
import MetricCard from '@/Components/MetricCard';
import MonthSelector from '@/Components/MonthSelector';
import PeriodModeToggle from '@/Components/PeriodModeToggle';
import RankingList from '@/Components/RankingList';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { IconCoin, IconLock, IconLockSquareRounded, IconReceipt2 } from '@tabler/icons-react';

function formatMoney(value) {
    return `$${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function monthLabel(month) {
    const [year, m] = month.split('-').map(Number);
    const label = new Date(year, m - 1, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
}

// Al pasar a vista Día sin un día previamente elegido, arranca en hoy si el
// mes seleccionado es el actual, o en el día 1 si es un mes distinto.
function defaultDayForMonth(month) {
    const todayIso = new Date().toLocaleDateString('sv-SE');
    return month === todayIso.slice(0, 7) ? todayIso : `${month}-01`;
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
    miRendimiento,
    neto,
}) {
    const { currentBarberia } = usePage().props;
    const dashboardUrl = route('owner.barberias.dashboard', currentBarberia.id);

    function handleModeChange(newMode) {
        if (newMode === period.mode) return;

        if (newMode === 'day') {
            router.get(
                dashboardUrl,
                { day: defaultDayForMonth(period.month) },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        } else {
            router.get(
                dashboardUrl,
                { month: period.month },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Dashboard — {currentBarberia?.name}
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className={`pt-6 sm:pt-12 ${currentBarberia?.active ? 'pb-36 sm:pb-24' : 'pb-12'}`}>
                <div className="mx-auto max-w-5xl space-y-8 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    {! currentBarberia?.active && (
                        <div className="flex items-center gap-3 rounded-brand-md border border-brand-border bg-brand-surface-alt px-4 py-3 text-sm text-brand-text-secondary">
                            <IconLockSquareRounded size={20} className="shrink-0" stroke={1.75} />
                            <span>
                                Esta barbería está cerrada — estás viendo su información en solo lectura.{' '}
                                <Link href={route('owner.barberias.edit', currentBarberia.id)} className="font-medium text-brand-link hover:underline">
                                    Reactivarla
                                </Link>
                            </span>
                        </div>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <PeriodModeToggle mode={period.mode} onChange={handleModeChange} />

                        {period.mode === 'day' ? (
                            <DaySelector date={period.day} esHoy={period.diaEsHoy} url={dashboardUrl} onDark={false} />
                        ) : (
                            <MonthSelector month={period.month} url={dashboardUrl} />
                        )}
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

                    {miRendimiento && (
                        <section className="space-y-3">
                            <h3 className="font-display text-lg font-bold text-brand-text">Mi rendimiento</h3>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <MetricCard label="Mi facturación" value={formatMoney(miRendimiento.totalFacturado)} />
                                <MetricCard label="Mis cortes" value={miRendimiento.totalCortes} />
                                <MetricCard label="% del total de la barbería" value={`${miRendimiento.pct}%`} />
                            </div>
                        </section>
                    )}

                    <div className="rounded-brand-lg border border-brand-border bg-brand-surface p-5 shadow-brand-card">
                        <p className="text-sm font-medium text-brand-text-secondary">
                            Neto estimado de {monthLabel(period.month)}
                        </p>
                        <p className={`mt-1 font-display text-3xl font-bold ${neto < 0 ? 'text-brand-danger' : 'text-brand-success'}`}>
                            {`${neto < 0 ? '-' : ''}${formatMoney(Math.abs(neto))}`}
                        </p>
                        <Link
                            href={route('owner.barberias.finanzas', currentBarberia.id)}
                            className="mt-3 inline-block text-sm font-semibold text-brand-link hover:text-brand-link-hover"
                        >
                            Ver Finanzas →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                                    <a href="#" className="text-sm font-semibold text-brand-link hover:text-brand-link-hover">
                                        Ver planes →
                                    </a>
                                </div>
                            )}
                        </section>

                        <section className="space-y-3">
                            <h3 className="font-display text-lg font-bold text-brand-text">Servicios más vendidos</h3>
                            <RankingList items={porServicio} emptyLabel="Todavía no hay servicios cargados en este período." />
                        </section>

                        <section className="space-y-3 lg:col-span-2">
                            <h3 className="font-display text-lg font-bold text-brand-text">Medios de pago</h3>
                            <RankingList
                                items={porMedioPago}
                                emptyLabel="Todavía no hay cortes cargados en este período."
                                columns={3}
                            />
                        </section>
                    </div>
                </div>
            </div>

            {currentBarberia?.active && (
                <Link
                    href={route('owner.barberias.cortes.index', currentBarberia.id)}
                    className="fixed bottom-4 right-4 z-30 inline-flex h-12 items-center gap-2 rounded-brand-pill bg-brand-primary px-5 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover sm:bottom-6 sm:right-6"
                >
                    <IconReceipt2 size={20} stroke={1.75} />
                    Cargar corte
                </Link>
            )}
        </AuthenticatedLayout>
    );
}
