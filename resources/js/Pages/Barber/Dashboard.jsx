import MonthSelector from '@/Components/MonthSelector';
import RankingList from '@/Components/RankingList';
import BarberLayout from '@/Layouts/BarberLayout';
import { Head, usePage } from '@inertiajs/react';

function formatMoney(value) {
    return `$${Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Dashboard({ period, barberia, totalFacturado, totalCortes, hoy, porServicio, liquidacion }) {
    const { auth } = usePage().props;
    const primerNombre = auth.user.name.split(' ')[0];

    return (
        <BarberLayout>
            <Head title="Mi panel" />

            <div className="mx-auto max-w-3xl space-y-6 px-4 pt-8 sm:px-6">
                <div>
                    <h1 className="font-display text-2xl font-bold text-brand-text">Hola, {primerNombre}</h1>
                    <p className="text-sm text-brand-text-secondary">{barberia.name}</p>
                </div>

                <div className="rounded-brand-xl bg-brand-nav-bg p-6 shadow-brand-floating">
                    <p className="text-sm font-medium text-brand-nav-text">Hoy</p>
                    <p className="mt-1 font-display text-3xl font-extrabold text-brand-nav-active">
                        {formatMoney(hoy.totalFacturado)}
                    </p>
                    <p className="mt-1 text-sm text-brand-nav-text">
                        {hoy.totalCortes} {hoy.totalCortes === 1 ? 'corte cargado' : 'cortes cargados'}
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
                    <h2 className="font-display text-lg font-bold text-brand-text">Cortes de hoy</h2>
                    {hoy.cortes.length === 0 ? (
                        <p className="rounded-brand-md border border-dashed border-brand-border bg-brand-surface-alt p-4 text-sm text-brand-text-secondary">
                            Todavía no cargaste ningún corte hoy.
                        </p>
                    ) : (
                        <ul className="divide-y divide-brand-border-subtle overflow-hidden rounded-brand-md border border-brand-border bg-brand-surface">
                            {hoy.cortes.map((corte) => (
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
