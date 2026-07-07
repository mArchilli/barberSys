import DaySelector, { dayLabel } from '@/Components/DaySelector';
import MonthSelector from '@/Components/MonthSelector';
import RankingList from '@/Components/RankingList';
import BarberLayout from '@/Layouts/BarberLayout';
import { Head, usePage } from '@inertiajs/react';

function formatMoney(value) {
    return `$${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Dashboard({ period, barberia, totalFacturado, totalCortes, dia, porServicio, liquidacion }) {
    const { auth } = usePage().props;
    const primerNombre = auth.user.name.split(' ')[0];
    const etiquetaDia = dayLabel(dia.date, dia.esHoy);

    return (
        <BarberLayout>
            <Head title="Mi panel" />

            <div className="mx-auto max-w-3xl space-y-6 px-4 pt-8 sm:px-6">
                <div>
                    <h1 className="font-display text-2xl font-bold text-brand-text">Hola, {primerNombre}</h1>
                    <p className="text-sm text-brand-text-secondary">{barberia.name}</p>
                </div>

                <div className="rounded-brand-xl bg-brand-nav-bg p-6 shadow-brand-floating">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-brand-nav-text">{etiquetaDia}</p>
                        <DaySelector date={dia.date} esHoy={dia.esHoy} url={route('barber.dashboard')} />
                    </div>
                    <p className="mt-3 font-display text-3xl font-extrabold text-brand-nav-active">
                        {formatMoney(dia.totalFacturado)}
                    </p>
                    <p className="mt-1 text-sm text-brand-nav-text">
                        {dia.totalCortes} {dia.totalCortes === 1 ? 'corte cargado' : 'cortes cargados'}
                    </p>
                </div>

                <div className="rounded-brand-xl border border-brand-border bg-brand-surface p-6 shadow-brand-card">
                    <div className="flex items-center justify-between gap-3">
                        <p className="font-display text-lg font-bold text-brand-text">Este mes</p>
                        <MonthSelector month={period.month} url={route('barber.dashboard')} />
                    </div>

                    <div className="mt-4 grid grid-cols-2 divide-x divide-brand-border-subtle">
                        <div className="pr-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-brand-text-secondary">
                                Facturación
                            </p>
                            <p className="mt-1 text-xl font-bold text-brand-text">{formatMoney(totalFacturado)}</p>
                            <p className="mt-0.5 text-xs text-brand-text-secondary">
                                {totalCortes} {totalCortes === 1 ? 'corte' : 'cortes'}
                            </p>
                        </div>
                        <div className="pl-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-brand-text-secondary">
                                Liquidación estimada
                            </p>
                            <p className="mt-1 text-xl font-bold text-brand-primary">{formatMoney(liquidacion.monto)}</p>
                            <p className="mt-0.5 text-xs text-brand-text-secondary">
                                {liquidacion.salaryType === 'fixed' ? 'Sueldo fijo' : 'Por comisión'}
                            </p>
                        </div>
                    </div>
                </div>

                <section className="space-y-3">
                    <h2 className="font-display text-lg font-bold text-brand-text">Tus servicios más pedidos</h2>
                    <RankingList items={porServicio} emptyLabel="Todavía no cargaste ningún corte en este período." />
                </section>

                <section className="space-y-3">
                    <h2 className="font-display text-lg font-bold text-brand-text">
                        {dia.esHoy ? 'Cortes de hoy' : `Cortes · ${etiquetaDia}`}
                    </h2>
                    {dia.cortes.length === 0 ? (
                        <p className="rounded-brand-md border border-dashed border-brand-border bg-brand-surface-alt p-4 text-sm text-brand-text-secondary">
                            {dia.esHoy ? 'Todavía no cargaste ningún corte hoy.' : 'No cargaste cortes ese día.'}
                        </p>
                    ) : (
                        <ul className="divide-y divide-brand-border-subtle overflow-hidden rounded-brand-md border border-brand-border bg-brand-surface">
                            {dia.cortes.map((corte) => (
                                <li key={corte.id} className="flex items-center justify-between gap-3 p-4">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-brand-text">{corte.cliente}</p>
                                        <p className="text-xs text-brand-text-secondary">
                                            {corte.hora} · {corte.servicio}
                                        </p>
                                    </div>
                                    <p className="shrink-0 text-sm font-semibold text-brand-text">
                                        {formatMoney(corte.price)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </BarberLayout>
    );
}
