import MetricCard from '@/Components/MetricCard';
import MonthSelector from '@/Components/MonthSelector';
import RankingList from '@/Components/RankingList';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

function monthLabel(month) {
    const [year, m] = month.split('-').map(Number);
    return new Date(year, m - 1, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
}

export default function Consolidado({ period, totalFacturado, totalCortes, comparativa }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Consolidado de barberías
                </h2>
            }
        >
            <Head title="Consolidado" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-5xl space-y-8 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm capitalize text-brand-text-secondary">{monthLabel(period.month)}</p>
                        <MonthSelector month={period.month} url={route('owner.consolidado')} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <MetricCard
                            label="Facturación total del período"
                            value={`$${totalFacturado.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                            tone="success"
                        />
                        <MetricCard label="Cortes cargados" value={totalCortes} />
                    </div>

                    <section className="space-y-3">
                        <h3 className="font-display text-lg font-bold text-brand-text">Comparativa por barbería</h3>
                        <p className="text-sm text-brand-text-secondary">Tocá una barbería para ir a su dashboard individual.</p>
                        <RankingList
                            items={comparativa}
                            emptyLabel="Todavía no hay cortes cargados en este período."
                            hrefFor={(item) => route('owner.barberias.dashboard', item.id)}
                        />
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
