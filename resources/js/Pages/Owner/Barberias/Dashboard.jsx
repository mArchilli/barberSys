import RankingList from '@/Components/RankingList';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    IconAlertCircle,
    IconAlertTriangle,
    IconCalendar,
    IconChartBar,
    IconChartPie,
    IconClock,
    IconEye,
    IconEyeOff,
    IconInfoCircle,
    IconLock,
    IconLockSquareRounded,
    IconReceipt2,
    IconReportMoney,
    IconScissors,
    IconSparkles,
    IconTrendingUp,
    IconWallet,
} from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';

function formatMoney(value) {
    return `$${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatAmount(value) {
    return Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatCompactMoney(value) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(Number(value));
}

function dateFromIso(date) {
    return new Date(`${date}T00:00:00`);
}

function monthLabel(month) {
    const [year, number] = month.split('-').map(Number);
    const label = new Date(year, number - 1, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
}

function shortDateLabel(date) {
    return dateFromIso(date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }).replace('.', '');
}

function periodLabel(period) {
    if (period.mode === 'day') return `Hoy, ${shortDateLabel(period.start)}`;
    if (period.mode === 'week') return `Semana del ${shortDateLabel(period.start)}`;
    if (period.mode === 'month') return monthLabel(period.start.slice(0, 7));

    return `${shortDateLabel(period.start)} — ${shortDateLabel(period.end)}`;
}

function bucketLabel(item, granularity) {
    if (granularity === 'month') {
        return dateFromIso(item.start).toLocaleDateString('es-AR', { month: 'short', year: '2-digit' }).replace('.', '');
    }

    if (granularity === 'week') {
        return `${shortDateLabel(item.start)}–${shortDateLabel(item.end)}`;
    }

    return dateFromIso(item.start).toLocaleDateString('es-AR', {
        weekday: 'short',
        day: 'numeric',
    }).replace('.', '');
}

function activityDateLabel(date, today) {
    if (date === today) return 'Hoy';

    return dateFromIso(date).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'short',
    }).replace('.', '');
}

function timeLabel(value) {
    if (! value) return 'Sin movimientos';

    return new Date(value).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

function CurrencyBadge({ children = '$' }) {
    return (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-primary shadow-sm">
            <span className="font-display text-2xl font-bold" aria-hidden="true">{children}</span>
        </span>
    );
}

const paymentMethodPalette = ['#48D5FC', '#4E75A5', '#0EA5E9', '#14B8A6', '#F59E0B', '#8B5CF6', '#F97316', '#10B981'];

function PaymentMethodsDonut({ items, totalLabel = 'Total del período', emptyLabel = 'Todavía no hay movimientos en este período.' }) {
    if (items.length === 0) {
        return (
            <div className="flex h-44 items-center justify-center rounded-[24px] bg-brand-surface-alt">
                <p className="max-w-[14rem] text-center text-sm text-brand-text-secondary">
                    {emptyLabel}
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

    const total = items.reduce((sum, item) => sum + Number(item.total), 0);
    const background = `conic-gradient(${segments
        .map((item) => `${item.color} ${item.start}% ${item.end}%`)
        .join(', ')})`;

    return (
        <div className="flex flex-col items-center gap-4">
            <div
                className="relative flex aspect-square w-full max-w-44 items-center justify-center rounded-full"
                style={{ background }}
                role="img"
                aria-label={`${totalLabel}: ${formatMoney(total)}`}
            >
                <div className="flex h-[68%] w-[68%] flex-col items-center justify-center rounded-full bg-brand-surface shadow-inner">
                    <span className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                        {totalLabel}
                    </span>
                    <span className="mt-2 text-center font-display text-2xl font-extrabold tracking-[-0.04em] text-brand-text">
                        {formatCompactMoney(total)}
                    </span>
                </div>
            </div>

            <div className="grid w-full min-w-0 grid-cols-1 gap-2">
                {segments.map((item) => (
                    <div
                        key={item.id}
                        className="flex min-w-0 items-center justify-between gap-3 rounded-[18px] border border-brand-border-subtle bg-brand-surface-alt px-3 py-2.5"
                    >
                        <div className="flex min-w-0 items-center gap-2.5">
                            <span
                                className="h-3 w-3 shrink-0 rounded-full"
                                style={{ backgroundColor: item.color }}
                                aria-hidden="true"
                            />
                            <span className="min-w-0 break-words text-sm font-medium leading-5 text-brand-text">{item.name}</span>
                        </div>
                        <div className="max-w-[55%] shrink-0 text-right">
                            <p className="break-words text-sm font-semibold tabular-nums text-brand-text">{formatMoney(item.total)}</p>
                            <p className="text-[11px] text-brand-text-secondary">{item.pct}%</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DashboardPeriodFilter({ period, url }) {
    const [rangeOpen, setRangeOpen] = useState(period.mode === 'range');
    const [from, setFrom] = useState(period.start);
    const [to, setTo] = useState(period.end);
    const fromInputRef = useRef(null);

    useEffect(() => {
        setRangeOpen(period.mode === 'range');
        setFrom(period.start);
        setTo(period.end);
    }, [period.mode, period.start, period.end]);

    function visit(params) {
        router.get(url, params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    function selectPreset(mode) {
        if (mode === 'range') {
            setRangeOpen(true);
            requestAnimationFrame(() => fromInputRef.current?.focus());
            return;
        }

        setRangeOpen(false);

        if (mode === 'day') visit({ day: period.today });
        if (mode === 'week') visit({ preset: 'week' });
        if (mode === 'month') visit({ month: period.currentMonth });
    }

    function applyRange(event) {
        event.preventDefault();
        if (! from || ! to) return;

        const [normalizedFrom, normalizedTo] = from <= to ? [from, to] : [to, from];
        visit({ from: normalizedFrom, to: normalizedTo });
    }

    const options = [
        { value: 'day', label: 'Hoy', mobileLabel: 'Hoy' },
        { value: 'week', label: 'Semana', mobileLabel: 'Semana' },
        { value: 'month', label: 'Mes', mobileLabel: 'Mes' },
        { value: 'range', label: 'Rango personalizado', mobileLabel: 'Rango' },
    ];

    return (
        <div className="flex min-w-0 flex-col gap-3">
            <div className="flex w-full min-w-0 flex-col gap-3 md:flex-row md:items-center md:justify-center">
                <div
                    className="grid w-full min-w-0 grid-cols-2 gap-1 rounded-[24px] border border-brand-border bg-brand-surface p-1 shadow-brand-card sm:flex sm:w-auto sm:rounded-brand-pill"
                    role="group"
                    aria-label="Filtrar dashboard por período"
                >
                    {options.map((option) => {
                        const selected = period.mode === option.value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                aria-label={option.label}
                                aria-pressed={selected}
                                aria-expanded={option.value === 'range' ? rangeOpen : undefined}
                                aria-controls={option.value === 'range' ? 'dashboard-custom-range' : undefined}
                                onClick={() => selectPreset(option.value)}
                                className={`min-h-[44px] w-full min-w-0 rounded-brand-pill px-2 py-2 text-[13px] font-semibold leading-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary sm:h-11 sm:w-auto sm:shrink-0 sm:px-4 sm:py-0 sm:text-sm ${
                                    selected
                                        ? 'bg-brand-primary text-brand-on-primary'
                                        : 'text-brand-text-secondary hover:bg-brand-primary/10 hover:text-brand-primary'
                                }`}
                            >
                                <span className="sm:hidden">{option.mobileLabel}</span>
                                <span className="hidden sm:inline">{option.label}</span>
                            </button>
                        );
                    })}
                </div>

            </div>

            {rangeOpen && (
                <form id="dashboard-custom-range" onSubmit={applyRange} className="flex w-full min-w-0 flex-col justify-center gap-2 sm:flex-row sm:items-end">
                    <label className="grid w-full min-w-0 grid-cols-1 gap-1 text-xs font-medium text-brand-text-secondary sm:w-auto">
                        Desde
                        <input
                            ref={fromInputRef}
                            type="date"
                            value={from}
                            max={period.today}
                            onChange={(event) => setFrom(event.target.value)}
                            className="h-11 w-full min-w-0 max-w-full rounded-brand-pill border-brand-border bg-brand-surface px-4 text-sm text-brand-text shadow-brand-card focus:border-brand-primary focus:ring-brand-primary sm:w-[10.5rem]"
                        />
                    </label>
                    <label className="grid w-full min-w-0 grid-cols-1 gap-1 text-xs font-medium text-brand-text-secondary sm:w-auto">
                        Hasta
                        <input
                            type="date"
                            value={to}
                            max={period.today}
                            onChange={(event) => setTo(event.target.value)}
                            className="h-11 w-full min-w-0 max-w-full rounded-brand-pill border-brand-border bg-brand-surface px-4 text-sm text-brand-text shadow-brand-card focus:border-brand-primary focus:ring-brand-primary sm:w-[10.5rem]"
                        />
                    </label>
                    <button
                        type="submit"
                        disabled={! from || ! to}
                        className="inline-flex min-h-[44px] w-full items-center justify-center rounded-brand-pill bg-brand-primary px-5 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                        Aplicar
                    </button>
                </form>
            )}
        </div>
    );
}

function KpiCard({ label, value, caption, icon: Icon, tone = 'default', action }) {
    const toneClassName = tone === 'success'
        ? 'text-brand-success'
        : tone === 'danger'
            ? 'text-brand-danger'
            : 'text-brand-text';

    return (
        <div className="min-w-0 rounded-[28px] border border-brand-border bg-brand-surface p-5 shadow-brand-card sm:p-6">
            <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-primary shadow-sm">
                    <Icon size={21} stroke={1.8} aria-hidden="true" />
                </span>
                {action}
            </div>
            <dt className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">{label}</dt>
            <dd className={`mt-2 break-words font-display text-2xl font-extrabold leading-tight tabular-nums tracking-[-0.04em] ${toneClassName}`}>
                {value}
            </dd>
            {caption && (
                <dd className="mt-2 break-words text-xs leading-relaxed text-brand-text-secondary">{caption}</dd>
            )}
        </div>
    );
}

function MetricTile({ label, value, tone = 'default' }) {
    const toneClassName = tone === 'success'
        ? 'text-brand-success'
        : tone === 'danger'
            ? 'text-brand-danger'
            : 'text-brand-text';

    return (
        <div className="min-w-0 rounded-[22px] bg-brand-surface-alt px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">{label}</p>
            <p className={`mt-2 break-words text-lg font-bold leading-tight tabular-nums sm:text-xl ${toneClassName}`}>{value}</p>
        </div>
    );
}

function EvolutionChart({ evolution, today }) {
    const { granularity, items } = evolution;
    const maxTotal = Math.max(...items.map((item) => Number(item.total)), 1);
    const minWidth = items.length > 10 ? `${items.length * 62}px` : '100%';

    return (
        <div
            className="w-full min-w-0 max-w-full snap-x snap-proximity overflow-x-auto overscroll-x-contain pb-2 focus-visible:rounded-brand-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            role="region"
            aria-label="Gráfico desplazable de evolución de facturación"
            tabIndex={items.length > 10 ? 0 : undefined}
        >
            <div className="flex h-64 items-end gap-3 sm:gap-4" style={{ minWidth }} role="list" aria-label="Evolución de facturación">
                {items.map((item) => {
                    const height = item.total > 0 ? Math.max((Number(item.total) / maxTotal) * 100, 9) : 5;
                    const includesToday = item.start <= today && item.end >= today;

                    return (
                        <div
                            key={`${item.start}-${item.end}`}
                            className="flex min-w-[42px] flex-1 snap-start flex-col items-center justify-end gap-2"
                            role="listitem"
                            aria-label={`${bucketLabel(item, granularity)}: ${formatMoney(item.total)}, ${item.cantidad} cortes`}
                        >
                            <p className={`max-w-full truncate text-[11px] font-semibold ${includesToday ? 'text-brand-primary' : 'text-brand-text-secondary'}`} title={formatMoney(item.total)}>
                                {formatCompactMoney(item.total)}
                            </p>
                            <div className="flex h-36 w-full items-end rounded-full bg-brand-surface-alt/80 px-1.5 py-1.5" aria-hidden="true">
                                <div
                                    className={`w-full rounded-full transition-all ${
                                        includesToday
                                            ? 'bg-[linear-gradient(180deg,#48D5FC_0%,#4E75A5_100%)] shadow-[0_12px_24px_rgba(72,213,252,0.22)]'
                                            : 'bg-brand-primary/45'
                                    }`}
                                    style={{ height: `${height}%` }}
                                />
                            </div>
                            <p className={`max-w-full truncate text-center text-[11px] font-semibold uppercase ${includesToday ? 'text-brand-primary' : 'text-brand-text-secondary'}`} title={bucketLabel(item, granularity)}>
                                {bucketLabel(item, granularity)}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const alertStyles = {
    danger: {
        wrapper: 'border-brand-danger/20 bg-brand-danger/5',
        icon: 'bg-brand-danger/10 text-brand-danger',
        Icon: IconAlertTriangle,
    },
    warning: {
        wrapper: 'border-brand-warning/20 bg-brand-warning/5',
        icon: 'bg-brand-warning/10 text-brand-warning',
        Icon: IconAlertCircle,
    },
    success: {
        wrapper: 'border-brand-success/25 bg-brand-success/10',
        icon: 'bg-brand-success/10 text-brand-success',
        Icon: IconTrendingUp,
    },
    info: {
        wrapper: 'border-brand-primary/20 bg-brand-primary/5',
        icon: 'bg-brand-primary/12 text-brand-primary',
        Icon: IconInfoCircle,
    },
};

export default function Dashboard({
    period,
    kpis,
    evolucionFacturacion,
    porMedioPago,
    rankingBarberosEnabled,
    porBarbero,
    porServicio,
    cierreCaja,
    gestion,
    actividadReciente,
    alertas,
}) {
    const { currentBarberia } = usePage().props;
    const dashboardUrl = route('owner.barberias.dashboard', currentBarberia.id);
    const [showFacturacion, setShowFacturacion] = useState(true);
    const selectedPeriodLabel = periodLabel(period);

    return (
        <AuthenticatedLayout
            headerClassName="bg-brand-bg"
            headerContainerClassName="mx-auto max-w-[1720px] px-2 py-4 sm:px-3 sm:py-5 lg:px-4"
            header={(
                <div className="grid w-full min-w-0 grid-cols-1 gap-4 pt-1 xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] xl:items-start xl:gap-6">
                    <h1 className="min-w-0 break-words font-display text-3xl font-bold tracking-[-0.04em] text-brand-text sm:text-4xl xl:pt-1">
                        {selectedPeriodLabel}
                    </h1>

                    <div className="min-w-0 xl:justify-self-center">
                        <DashboardPeriodFilter period={period} url={dashboardUrl} />
                    </div>

                    <p className="min-w-0 break-words font-display text-2xl font-semibold tracking-[-0.04em] text-brand-text sm:text-3xl xl:justify-self-end xl:pt-1 xl:text-right">
                        {currentBarberia?.name}
                    </p>
                </div>
            )}
        >
            <Head title="Dashboard" />

            <div className="w-full min-w-0 max-w-full pb-12">
                <div className="mx-auto grid w-full min-w-0 max-w-[1720px] gap-6 px-2 sm:px-3 lg:px-4">
                    {! currentBarberia?.active && (
                        <div className="flex items-center gap-3 rounded-brand-md border border-brand-border bg-brand-surface-alt px-4 py-3 text-sm text-brand-text-secondary">
                            <IconLockSquareRounded size={20} className="shrink-0" stroke={1.75} />
                            <span>
                                Esta barbería está cerrada - estás viendo su información en solo lectura.{' '}
                                <Link href={route('owner.barberias.edit', currentBarberia.id)} className="font-medium text-brand-primary hover:underline">
                                    Reactivarla
                                </Link>
                            </span>
                        </div>
                    )}

                    <section className="min-w-0" aria-label="Métricas del dashboard">
                        <dl className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                            <KpiCard
                                label="Facturación"
                                value={showFacturacion ? formatMoney(kpis.facturacion) : '$***'}
                                icon={IconReportMoney}
                                action={(
                                    <button
                                        type="button"
                                        onClick={() => setShowFacturacion((value) => ! value)}
                                        aria-label={showFacturacion ? 'Ocultar facturación' : 'Mostrar facturación'}
                                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-brand-border bg-brand-surface-alt text-brand-primary transition hover:border-brand-primary/20 hover:bg-brand-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                                    >
                                        {showFacturacion ? <IconEye size={19} stroke={1.8} /> : <IconEyeOff size={19} stroke={1.8} />}
                                    </button>
                                )}
                            />
                            <KpiCard
                                label="Neto"
                                value={`${kpis.neto < 0 ? '-' : ''}${formatMoney(Math.abs(kpis.neto))}`}
                                caption={`Estimado · ${monthLabel(gestion.month)}`}
                                icon={IconWallet}
                                tone={kpis.neto < 0 ? 'danger' : 'success'}
                            />
                            <KpiCard
                                label="Cortes"
                                value={Number(kpis.cortes).toLocaleString('es-AR')}
                                icon={IconScissors}
                            />
                            <KpiCard
                                label="Ticket promedio"
                                value={formatMoney(kpis.ticketPromedio)}
                                caption="Promedio por corte"
                                icon={IconReceipt2}
                            />
                            <KpiCard
                                label="Hoy"
                                value={formatMoney(kpis.hoy)}
                                icon={IconCalendar}
                            />
                        </dl>
                    </section>

                    <section className="min-w-0" aria-label="Facturación y pagos">
                        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
                            <article className="min-w-0 rounded-[28px] border border-brand-border bg-brand-surface p-5 shadow-brand-card sm:p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <h3 className="text-xl font-semibold tracking-[-0.03em] text-brand-text">Evolución de facturación</h3>
                                        <p className="mt-2 break-words text-xs text-brand-text-secondary">Comportamiento de {selectedPeriodLabel.toLowerCase()}.</p>
                                    </div>
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-primary shadow-sm">
                                        <IconChartBar size={24} stroke={1.8} aria-hidden="true" />
                                    </span>
                                </div>

                                <div className="mt-6 min-w-0">
                                    {evolucionFacturacion.items.length > 10 && (
                                        <p className="mb-3 text-xs text-brand-text-secondary sm:hidden">Deslizá horizontalmente para recorrer todos los días.</p>
                                    )}
                                    <EvolutionChart evolution={evolucionFacturacion} today={period.today} />
                                </div>
                            </article>

                            <article className="min-w-0 rounded-[28px] border border-brand-border bg-brand-surface p-5 shadow-brand-card sm:p-6">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="text-xl font-semibold tracking-[-0.03em] text-brand-text">Medios de pago</h3>
                                        <p className="mt-2 break-words text-xs text-brand-text-secondary">Distribución de cobros del período seleccionado.</p>
                                    </div>
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-primary shadow-sm">
                                        <IconChartPie size={22} stroke={1.8} aria-hidden="true" />
                                    </span>
                                </div>

                                <div className="mt-5">
                                    <PaymentMethodsDonut items={porMedioPago} />
                                </div>
                            </article>
                        </div>
                    </section>

                    <section className="min-w-0" aria-label="Rankings">
                        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
                            <article className="min-w-0 space-y-3">
                                <h3 className="font-display text-lg font-bold text-brand-text">Ranking de barberos</h3>
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
                                        <p className="max-w-sm text-xs text-brand-text-secondary">Descubrí qué barbero factura más y tomá mejores decisiones sobre tu equipo.</p>
                                    </div>
                                )}
                            </article>

                            <article className="min-w-0 space-y-3">
                                <h3 className="font-display text-lg font-bold text-brand-text">Servicios más vendidos</h3>
                                <RankingList items={porServicio} emptyLabel="Todavía no hay servicios cargados en este período." />
                            </article>
                        </div>
                    </section>

                    <section className="min-w-0" aria-label="Caja y finanzas">
                        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
                            <article className="min-w-0 rounded-[28px] border border-brand-border bg-brand-surface p-5 shadow-brand-card sm:p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <h3 className="text-xl font-semibold tracking-[-0.03em] text-brand-text">Cierre de caja</h3>
                                        <p className="mt-2 break-words text-xs text-brand-text-secondary">Resumen informativo de los movimientos registrados hoy.</p>
                                    </div>
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-primary shadow-sm">
                                        <IconReceipt2 size={22} stroke={1.8} aria-hidden="true" />
                                    </span>
                                </div>

                                <div className="mt-6 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-3">
                                    <MetricTile label="Facturación" value={formatMoney(cierreCaja.total)} />
                                    <MetricTile label="Cortes" value={String(cierreCaja.cortes)} />
                                    <MetricTile label="Ticket promedio" value={formatMoney(cierreCaja.ticketPromedio)} />
                                </div>

                                <div className="mt-5 flex min-w-0 flex-col gap-3 border-t border-brand-border-subtle pt-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex min-w-0 items-start gap-2 text-sm text-brand-text-secondary">
                                        <IconClock size={18} className="mt-0.5 shrink-0" stroke={1.8} aria-hidden="true" />
                                        <span className="min-w-0 break-words">Último movimiento: <strong className="font-semibold text-brand-text">{timeLabel(cierreCaja.ultimoMovimientoAt)}</strong></span>
                                    </div>
                                    <Link href={route('owner.barberias.cortes.index', currentBarberia.id)} className="min-h-[44px] self-start py-3 text-sm font-semibold text-brand-primary hover:text-brand-link-hover sm:min-h-0 sm:self-auto sm:py-0">
                                        Ver movimientos {'->'}
                                    </Link>
                                </div>

                                {cierreCaja.mediosPago.length > 0 && (
                                    <div className="mt-5 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
                                        {cierreCaja.mediosPago.map((item) => (
                                            <div key={item.id} className="flex min-w-0 items-start justify-between gap-3 rounded-[18px] bg-brand-surface-alt px-3 py-3">
                                                <span className="min-w-0 break-words text-sm font-medium leading-5 text-brand-text-secondary">{item.name}</span>
                                                <span className="max-w-[55%] shrink-0 break-words text-right text-sm font-semibold tabular-nums text-brand-text">{formatMoney(item.total)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </article>

                            <article className="min-w-0 rounded-[28px] border border-brand-border bg-brand-surface p-5 shadow-brand-card sm:p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-brand-text-secondary">{monthLabel(gestion.month)}</p>
                                        <h3 className="mt-2 break-words text-xl font-semibold tracking-[-0.03em] text-brand-text">Gastos / Neto estimado</h3>
                                    </div>
                                    <CurrencyBadge />
                                </div>

                                <p className={`mt-6 break-words font-display text-3xl font-extrabold leading-tight tabular-nums tracking-[-0.04em] sm:text-4xl ${gestion.neto < 0 ? 'text-brand-danger' : 'text-brand-success'}`}>
                                    {`${gestion.neto < 0 ? '-' : ''}${formatMoney(Math.abs(gestion.neto))}`}
                                </p>
                                <p className="mt-2 text-xs text-brand-text-secondary">Facturación mensual menos sueldos y gastos registrados.</p>

                                <div className="mt-6 grid min-w-0 grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-3">
                                    <MetricTile label="Facturación" value={formatMoney(gestion.facturacion)} />
                                    <MetricTile label="Sueldos" value={formatMoney(gestion.sueldos)} />
                                    <MetricTile label="Gastos" value={formatMoney(gestion.gastos)} tone={gestion.gastos > 0 ? 'danger' : 'default'} />
                                </div>

                                <Link href={route('owner.barberias.finanzas', currentBarberia.id)} className="mt-3 inline-flex min-h-[44px] items-center text-sm font-semibold text-brand-primary hover:text-brand-link-hover">
                                    Ver Finanzas {'->'}
                                </Link>
                            </article>
                        </div>
                    </section>

                    <section className="min-w-0" aria-label="Actividad y alertas">
                        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
                            <article className="min-w-0 rounded-[28px] border border-brand-border bg-brand-surface p-5 shadow-brand-card sm:p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <h3 className="text-xl font-semibold tracking-[-0.03em] text-brand-text">Actividad reciente</h3>
                                        <p className="mt-2 break-words text-xs text-brand-text-secondary">Últimos cortes cargados en la barbería.</p>
                                    </div>
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-primary shadow-sm">
                                        <IconClock size={22} stroke={1.8} aria-hidden="true" />
                                    </span>
                                </div>

                                {actividadReciente.length === 0 ? (
                                    <div className="mt-6 rounded-[24px] border border-dashed border-brand-border bg-brand-surface-alt p-8 text-center">
                                        <p className="text-sm text-brand-text-secondary">Todavía no hay actividad registrada.</p>
                                    </div>
                                ) : (
                                    <ul className="mt-5 divide-y divide-brand-border-subtle">
                                        {actividadReciente.map((item) => (
                                            <li key={item.id} className="grid min-w-0 grid-cols-[40px_minmax(0,1fr)] gap-x-3 gap-y-2 py-4 first:pt-0 last:pb-0 sm:grid-cols-[40px_minmax(0,1fr)_auto] sm:items-center">
                                                <span className="row-span-2 flex h-10 w-10 shrink-0 items-center justify-center self-start rounded-2xl bg-brand-primary/12 text-brand-primary sm:row-span-1 sm:self-center">
                                                    <IconScissors size={18} stroke={1.8} aria-hidden="true" />
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="break-words text-sm font-semibold leading-5 text-brand-text">{item.servicio} · {item.cliente}</p>
                                                    <p className="mt-1 break-words text-xs leading-relaxed text-brand-text-secondary">{item.barbero} · {item.medioPago} · {activityDateLabel(item.date, period.today)}</p>
                                                </div>
                                                <p className="col-start-2 break-words text-sm font-bold tabular-nums text-brand-text sm:col-start-auto sm:max-w-[10rem] sm:text-right">{formatMoney(item.total)}</p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </article>

                            <article className="min-w-0 rounded-[28px] border border-brand-border bg-brand-surface p-5 shadow-brand-card sm:p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <h3 className="text-xl font-semibold tracking-[-0.03em] text-brand-text">Alertas inteligentes</h3>
                                        <p className="mt-2 break-words text-xs text-brand-text-secondary">Señales automáticas sobre facturación, caja y operación.</p>
                                    </div>
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-primary shadow-sm">
                                        <IconSparkles size={22} stroke={1.8} aria-hidden="true" />
                                    </span>
                                </div>

                                <ul className="mt-5 space-y-3">
                                    {alertas.map((alert, index) => {
                                        const style = alertStyles[alert.type] ?? alertStyles.info;
                                        const AlertIcon = style.Icon;

                                        return (
                                            <li key={`${alert.title}-${index}`} className={`flex min-w-0 items-start gap-3 rounded-[20px] border p-4 ${style.wrapper}`}>
                                                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${style.icon}`}>
                                                    <AlertIcon size={19} stroke={1.8} aria-hidden="true" />
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="break-words text-sm font-semibold text-brand-text">{alert.title}</p>
                                                    <p className="mt-1 break-words text-xs leading-5 text-brand-text-secondary">{alert.message}</p>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </article>
                        </div>
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
