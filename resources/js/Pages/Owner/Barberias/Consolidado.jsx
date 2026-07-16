import MonthSelector from '@/Components/MonthSelector';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { IconBuildingStore, IconCash, IconChartBar, IconWallet } from '@tabler/icons-react';

function monthLabel(month) {
    const [year, m] = month.split('-').map(Number);
    const label = new Date(year, m - 1, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatPrice(value) {
    return Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatMoney(value) {
    return `$${formatPrice(value)}`;
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

export default function Consolidado({ period, totalFacturado, totalCortes, totalSueldos, totalGastos, totalNeto, comparativa }) {
    const maxFacturacion = Math.max(...comparativa.map((item) => item.total), 1);

    return (
        <AuthenticatedLayout
            headerClassName="bg-brand-bg"
            headerContainerClassName="mx-auto max-w-[1720px] px-2 py-4 sm:px-3 sm:py-5 lg:px-4"
            header={(
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="font-display text-3xl font-bold tracking-[-0.04em] text-brand-text sm:text-4xl">
                            Consolidado
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-brand-text-secondary">
                            Compara el rendimiento de todas tus barberias activas en un mismo periodo y entra a cada una cuando necesites profundizar.
                        </p>
                    </div>

                    <div className="w-full lg:w-auto lg:min-w-[260px]">
                        <MonthSelector month={period.month} url={route('owner.consolidado')} fullWidth />
                    </div>
                </div>
            )}
        >
            <Head title="Consolidado" />

            <div className="pb-12">
                <div className="mx-auto max-w-[1720px] space-y-8 px-2 sm:px-3 lg:px-4">
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)_minmax(320px,0.8fr)]">
                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-end justify-between gap-4">
                                <div className="flex min-w-0 items-start gap-4">
                                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-brand-primary/12 text-brand-primary shadow-sm">
                                        <IconWallet size={30} stroke={1.8} />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-brand-text-secondary">Neto total del negocio</p>
                                        <p className={`mt-2 break-words py-1 font-display text-4xl font-extrabold leading-[1.15] tracking-[-0.04em] sm:text-[3.25rem] ${totalNeto < 0 ? 'text-brand-danger' : 'text-brand-primary'}`}>
                                            {`${totalNeto < 0 ? '-' : ''}${formatMoney(Math.abs(totalNeto))}`}
                                        </p>
                                        <p className="mt-2 text-sm text-brand-text-secondary">
                                            Resultado consolidado de {monthLabel(period.month)} entre todas tus barberias.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                <MetricTile label="Facturacion total" value={formatMoney(totalFacturado)} />
                                <MetricTile label="Cortes cargados" value={totalCortes} />
                            </div>
                        </section>

                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-semibold tracking-[-0.03em] text-brand-text">
                                        Costos y estructura
                                    </h3>
                                    <p className="mt-2 text-xs text-brand-text-secondary">
                                        Mira rapidamente como se compone el resultado del periodo entre sueldos y gastos.
                                    </p>
                                </div>
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-link shadow-sm">
                                    <IconCash size={22} stroke={1.8} />
                                </span>
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                <MetricTile label="Sueldos totales" value={formatMoney(totalSueldos)} />
                                <MetricTile label="Gastos totales" value={formatMoney(totalGastos)} tone={totalGastos > 0 ? 'danger' : 'default'} />
                            </div>

                            <div className="mt-5 rounded-[22px] bg-brand-surface-alt px-4 py-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                    Periodo analizado
                                </p>
                                <p className="mt-2 text-lg font-bold text-brand-text">
                                    {monthLabel(period.month)}
                                </p>
                            </div>
                        </section>

                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-xl font-semibold tracking-[-0.03em] text-brand-text">
                                        Barberias comparadas
                                    </h3>
                                    <p className="mt-2 text-xs text-brand-text-secondary">
                                        Cantidad de sucursales con datos incluidos en este corte temporal.
                                    </p>
                                </div>
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-link shadow-sm">
                                    <IconBuildingStore size={22} stroke={1.8} />
                                </span>
                            </div>

                            <div className="mt-6 grid gap-3">
                                <MetricTile label="Barberias" value={comparativa.length} />
                                <MetricTile label="Promedio por barberia" value={comparativa.length > 0 ? formatMoney(totalFacturado / comparativa.length) : formatMoney(0)} />
                            </div>
                        </section>
                    </div>

                    <section className="space-y-4">
                        <div>
                            <h3 className="font-display text-lg font-bold text-brand-text">
                                Comparativa por barberia
                            </h3>
                        </div>

                        {comparativa.length === 0 ? (
                            <div className="rounded-[28px] border border-dashed border-brand-border bg-brand-surface-alt p-10 text-center shadow-brand-card">
                                <h4 className="font-display text-xl font-bold text-brand-text">
                                    Todavia no hay movimiento en este periodo
                                </h4>
                                <p className="mx-auto mt-3 max-w-xl text-sm text-brand-text-secondary">
                                    Cuando alguna barberia cargue cortes durante el mes seleccionado, su comparativa aparecera aqui.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
                                {comparativa.map((item) => {
                                    const width = item.total > 0 ? Math.max((item.total / maxFacturacion) * 100, 10) : 6;

                                    return (
                                        <article
                                            key={item.id}
                                            className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card transition hover:-translate-y-0.5 hover:shadow-brand-card-hover sm:p-7"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-brand-text-secondary">
                                                        Barberia
                                                    </p>
                                                    <h4 className="mt-2 truncate font-display text-2xl font-bold tracking-[-0.04em] text-brand-text">
                                                        {item.name}
                                                    </h4>
                                                </div>

                                                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                                                    item.neto < 0
                                                        ? 'bg-brand-danger/10 text-brand-danger'
                                                        : 'bg-brand-primary text-brand-on-primary'
                                                }`}>
                                                    {item.neto < 0 ? 'Neto negativo' : 'Neto positivo'}
                                                </span>
                                            </div>

                                            <div className="mt-6 rounded-[22px] bg-brand-surface-alt px-4 py-4">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                                    Neto del periodo
                                                </p>
                                                <p className={`mt-2 font-display text-3xl font-extrabold tracking-[-0.04em] ${item.neto < 0 ? 'text-brand-danger' : 'text-brand-primary'}`}>
                                                    {`${item.neto < 0 ? '-' : ''}${formatMoney(Math.abs(item.neto))}`}
                                                </p>
                                            </div>

                                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                                <div className="rounded-[20px] bg-brand-surface-alt px-4 py-4">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                                        Facturacion
                                                    </p>
                                                    <p className="mt-2 text-sm font-bold text-brand-text">
                                                        {formatMoney(item.total)}
                                                    </p>
                                                </div>
                                                <div className="rounded-[20px] bg-brand-surface-alt px-4 py-4">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                                        Sueldos
                                                    </p>
                                                    <p className="mt-2 text-sm font-bold text-brand-text">
                                                        {formatMoney(item.sueldos)}
                                                    </p>
                                                </div>
                                                <div className="rounded-[20px] bg-brand-surface-alt px-4 py-4">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                                        Gastos
                                                    </p>
                                                    <p className="mt-2 text-sm font-bold text-brand-text">
                                                        {formatMoney(item.gastos)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-5 rounded-[20px] bg-brand-surface-alt px-4 py-4">
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                                        Peso sobre la facturacion
                                                    </p>
                                                    <p className="text-sm font-semibold text-brand-text">
                                                        {item.total > 0 ? `${Math.round((item.total / maxFacturacion) * 100)}%` : '0%'}
                                                    </p>
                                                </div>
                                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-primary-soft">
                                                    <div
                                                        className="h-2 rounded-full bg-brand-primary transition-all"
                                                        style={{ width: `${width}%` }}
                                                    />
                                                </div>
                                                <p className="mt-3 text-sm text-brand-text-secondary">
                                                    {item.cantidad} {item.cantidad === 1 ? 'corte cargado' : 'cortes cargados'} en el periodo.
                                                </p>
                                            </div>

                                            <div className="mt-5 border-t border-brand-border-subtle pt-5">
                                                <Link
                                                    href={route('owner.barberias.dashboard', item.id)}
                                                    className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-brand-border bg-brand-surface-alt px-4 text-sm font-semibold text-brand-text transition hover:border-brand-primary/20 hover:bg-brand-primary/5 hover:text-brand-link"
                                                >
                                                    Ver dashboard
                                                </Link>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
