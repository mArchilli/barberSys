import MetricCard from '@/Components/MetricCard';
import MonthSelector from '@/Components/MonthSelector';
import RankingList from '@/Components/RankingList';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';

function monthLabel(month) {
    const [year, m] = month.split('-').map(Number);
    return new Date(year, m - 1, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
}

export default function Dashboard({ period, totalFacturado, totalCortes, porBarbero, porServicio, porMedioPago }) {
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

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-5xl space-y-8 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm capitalize text-brand-text-secondary">{monthLabel(period.month)}</p>
                        <MonthSelector
                            month={period.month}
                            url={route('owner.barberias.dashboard', currentBarberia.id)}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <MetricCard label="Facturación del período" value={`$${totalFacturado.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} tone="success" />
                        <MetricCard label="Cortes cargados" value={totalCortes} />
                    </div>

                    <section className="space-y-3">
                        <h3 className="font-display text-lg font-bold text-brand-text">Facturación por barbero</h3>
                        <RankingList items={porBarbero} emptyLabel="Todavía no hay cortes cargados en este período." />
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
        </AuthenticatedLayout>
    );
}
