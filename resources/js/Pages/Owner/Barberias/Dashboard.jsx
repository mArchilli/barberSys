import DaySelector from '@/Components/DaySelector';
import MonthSelector from '@/Components/MonthSelector';
import PeriodModeToggle from '@/Components/PeriodModeToggle';
import RankingList from '@/Components/RankingList';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    IconChartBar,
    IconChartPie,
    IconEye,
    IconEyeOff,
    IconLock,
    IconLockSquareRounded,
    IconReportMoney,
} from '@tabler/icons-react';
import { useState } from 'react';

function formatMoney(value) {
    return `$${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatAmount(value) {
    return Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function monthLabel(month) {
    const [year, m] = month.split('-').map(Number);
    const label = new Date(year, m - 1, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
}

function dayShortLabel(date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '');
}

function CurrencyBadge() {
    return (
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-brand-primary/12 text-brand-primary shadow-sm">
            <svg viewBox="0 0 48 48" aria-hidden="true" className="h-10 w-10">
                <text
                    x="50%"
                    y="55%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="31"
                    fontWeight="700"
                    fill="currentColor"
                    fontFamily="Inter, sans-serif"
                >
                    $
                </text>
            </svg>
        </span>
    );
}

const paymentMethodPalette = ['#48D5FC', '#4E75A5', '#0EA5E9', '#14B8A6', '#F59E0B', '#8B5CF6', '#F97316', '#10B981'];

function PaymentMethodsDonut({ items }) {
    if (items.length === 0) {
        return (
            <div className="flex h-44 items-center justify-center rounded-[24px] bg-brand-surface-alt">
                <p className="max-w-[12rem] text-center text-sm text-brand-text-secondary">
                    Todavía no hay movimientos cargados hoy.
                </p>
            </div>
        );
    }

    let accumulated = 0;
    const segments = items.map((item, index) => {
        const start = accumulated;
        const end = accumulated + item.pct;
        accumulated = end;

        return {
            ...item,
            color: paymentMethodPalette[index % paymentMethodPalette.length],
            start,
            end,
        };
    });

    const background = `conic-gradient(${segments
        .map((item) => `${item.color} ${item.start}% ${item.end}%`)
        .join(', ')})`;

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative flex h-44 w-44 items-center justify-center rounded-full" style={{ background }}>
                <div className="flex h-[68%] w-[68%] flex-col items-center justify-center rounded-full bg-brand-surface shadow-inner">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                        Total del día
                    </span>
                    <span className="mt-2 text-center font-display text-2xl font-extrabold tracking-[-0.04em] text-brand-text">
                        {formatMoney(items.reduce((sum, item) => sum + Number(item.total), 0))}
                    </span>
                </div>
            </div>

            <div className="grid w-full gap-2">
                {segments.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-[18px] border border-brand-border-subtle bg-brand-surface-alt px-3 py-2.5"
                    >
                        <div className="flex min-w-0 items-center gap-2.5">
                            <span
                                className="h-3 w-3 shrink-0 rounded-full"
                                style={{ backgroundColor: item.color }}
                                aria-hidden="true"
                            />
                            <span className="truncate text-sm font-medium text-brand-text">{item.name}</span>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-brand-text">{formatMoney(item.total)}</p>
                            <p className="text-[11px] text-brand-text-secondary">{item.pct}%</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
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
    facturacionUltimosSieteDias,
    porMedioPagoHoy,
}) {
    const { currentBarberia, auth } = usePage().props;
    const dashboardUrl = route('owner.barberias.dashboard', currentBarberia.id);
    const primerNombre = auth.user.name.split(' ')[0];
    const maxFacturacionDiaria = Math.max(...facturacionUltimosSieteDias.map((item) => item.total), 1);
    const facturacionHoy = facturacionUltimosSieteDias.at(-1)?.total ?? 0;
    const [showFacturacion, setShowFacturacion] = useState(true);

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
            headerClassName="bg-brand-bg"
            headerContainerClassName="mx-auto max-w-[1720px] px-2 py-4 sm:px-3 sm:py-5 lg:px-4"
            header={(
                <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-display text-3xl font-bold tracking-[-0.04em] text-brand-text sm:text-4xl">
                        Bienvenido {primerNombre}
                    </p>
                    <p className="font-display text-2xl font-semibold tracking-[-0.04em] text-brand-text sm:text-3xl sm:text-right">
                        {currentBarberia?.name}
                    </p>
                </div>
            )}
        >
            <Head title="Dashboard" />

            <div className="pb-12">
                <div className="mx-auto max-w-[1720px] space-y-8 px-2 sm:px-3 lg:px-4">
                    {! currentBarberia?.active && (
                        <div className="flex items-center gap-3 rounded-brand-md border border-brand-border bg-brand-surface-alt px-4 py-3 text-sm text-brand-text-secondary">
                            <IconLockSquareRounded size={20} className="shrink-0" stroke={1.75} />
                            <span>
                                Esta barbería está cerrada - estás viendo su información en solo lectura.{' '}
                                <Link href={route('owner.barberias.edit', currentBarberia.id)} className="font-medium text-brand-link hover:underline">
                                    Reactivarla
                                </Link>
                            </span>
                        </div>
                    )}

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)_minmax(320px,0.8fr)]">
                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-end justify-between gap-4">
                                <div className="flex min-w-0 items-start gap-4">
                                    <CurrencyBadge />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-brand-text-secondary">Facturación del período</p>
                                        <p className="mt-3 truncate font-display text-4xl font-extrabold tracking-[-0.04em] text-brand-text sm:text-[3.25rem]">
                                            {showFacturacion ? formatAmount(totalFacturado) : '***'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowFacturacion((value) => !value)}
                                    aria-label={showFacturacion ? 'Ocultar facturación' : 'Mostrar facturación'}
                                    className="mb-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-brand-border bg-brand-surface-alt text-brand-link transition hover:border-brand-primary/20 hover:bg-brand-primary/5"
                                >
                                    {showFacturacion ? (
                                        <IconEye size={22} stroke={1.8} />
                                    ) : (
                                        <IconEyeOff size={22} stroke={1.8} />
                                    )}
                                </button>
                            </div>

                            <div className="mt-6 flex flex-col gap-3 border-t border-brand-border-subtle pt-5 lg:flex-row lg:items-center lg:justify-between">
                                <PeriodModeToggle mode={period.mode} onChange={handleModeChange} />

                                <div className="w-full lg:w-auto">
                                    {period.mode === 'day' ? (
                                        <DaySelector date={period.day} esHoy={period.diaEsHoy} url={dashboardUrl} onDark={false} fullWidth />
                                    ) : (
                                        <MonthSelector month={period.month} url={dashboardUrl} fullWidth />
                                    )}
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-3">
                                <div className="rounded-[22px] bg-brand-surface-alt px-4 py-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                        Cortes cargados
                                    </p>
                                    <p className="mt-2 text-2xl font-bold text-brand-text">{totalCortes}</p>
                                </div>
                                <div className="rounded-[22px] bg-brand-surface-alt px-4 py-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                        Barberos activos
                                    </p>
                                    <p className="mt-2 text-2xl font-bold text-brand-text">{barberosActivos}</p>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-brand-text-secondary">Facturación diaria</p>
                                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-brand-text">
                                        Hoy + últimos 6 días
                                    </h3>
                                </div>
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-link shadow-sm">
                                    <IconChartBar size={24} stroke={1.8} />
                                </span>
                            </div>

                            <div className="mt-5 rounded-[22px] bg-brand-surface-alt px-4 py-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                    Lo que va de hoy
                                </p>
                                <p className="mt-2 font-display text-3xl font-extrabold tracking-[-0.04em] text-brand-text">
                                    {formatMoney(facturacionHoy)}
                                </p>
                            </div>

                            <div className="mt-6">
                                <div>
                                    <div className="flex h-48 items-end gap-3 sm:gap-4">
                                        {facturacionUltimosSieteDias.map((item) => {
                                            const height = item.total > 0 ? Math.max((item.total / maxFacturacionDiaria) * 100, 10) : 6;
                                            const esHoy = item.date === facturacionUltimosSieteDias.at(-1)?.date;

                                            return (
                                                <div key={item.date} className="flex flex-1 flex-col items-center justify-end gap-2">
                                                    <p className={`text-[11px] font-semibold ${esHoy ? 'text-brand-link' : 'text-brand-text-secondary'}`}>
                                                        {item.total > 0
                                                            ? Number(item.total).toLocaleString('es-AR', { maximumFractionDigits: 0 })
                                                            : '0'}
                                                    </p>
                                                    <div className="flex h-32 w-full items-end rounded-full bg-brand-surface-alt/80 px-1.5 py-1.5">
                                                        <div
                                                            className={`w-full rounded-full transition-all ${
                                                                esHoy
                                                                    ? 'bg-[linear-gradient(180deg,#48D5FC_0%,#4E75A5_100%)] shadow-[0_12px_24px_rgba(72,213,252,0.22)]'
                                                                    : 'bg-brand-primary/45'
                                                            }`}
                                                            style={{ height: `${height}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className={`text-xs font-semibold uppercase ${esHoy ? 'text-brand-link' : 'text-brand-text-secondary'}`}>
                                                            {dayShortLabel(item.date)}
                                                        </p>
                                                        <p className="text-[11px] text-brand-text-secondary">
                                                            {item.date.slice(8, 10)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                            </div>
                        </section>

                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-brand-text-secondary">Medios de pago de hoy</p>
                                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-brand-text">
                                        Distribución porcentual
                                    </h3>
                                    <p className="mt-2 text-xs text-brand-text-secondary">
                                        Incluye efectivo, transferencia, tarjeta y cualquier método nuevo cargado.
                                    </p>
                                </div>
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-link shadow-sm">
                                    <IconChartPie size={22} stroke={1.8} />
                                </span>
                            </div>

                            <div className="mt-6">
                                <PaymentMethodsDonut items={porMedioPagoHoy} />
                            </div>
                        </section>
                    </div>

                    {miRendimiento && (
                        <section className="space-y-3">
                            <h3 className="font-display text-lg font-bold text-brand-text">Mi rendimiento</h3>
                            <div className="rounded-brand-xl border border-brand-border bg-brand-surface p-6 shadow-brand-card">
                                <div className="grid grid-cols-3 divide-x divide-brand-border-subtle">
                                    <div className="pr-3 sm:pr-4">
                                        <p className="text-[11px] font-medium uppercase tracking-wide text-brand-text-secondary sm:text-xs">
                                            Mi facturación
                                        </p>
                                        <p className="mt-1 truncate text-lg font-bold text-brand-text sm:text-xl">
                                            {formatMoney(miRendimiento.totalFacturado)}
                                        </p>
                                    </div>
                                    <div className="px-3 sm:px-4">
                                        <p className="text-[11px] font-medium uppercase tracking-wide text-brand-text-secondary sm:text-xs">
                                            Mis cortes
                                        </p>
                                        <p className="mt-1 text-lg font-bold text-brand-text sm:text-xl">
                                            {miRendimiento.totalCortes}
                                        </p>
                                    </div>
                                    <div className="pl-3 sm:px-4">
                                        <p className="text-[11px] font-medium uppercase tracking-wide text-brand-text-secondary sm:text-xs">
                                            % del total
                                        </p>
                                        <p className="mt-1 text-lg font-bold text-brand-text sm:text-xl">
                                            {miRendimiento.pct}%
                                        </p>
                                    </div>
                                </div>
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
                            Ver Finanzas {'->'}
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
                                        Ver planes {'->'}
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

        </AuthenticatedLayout>
    );
}

