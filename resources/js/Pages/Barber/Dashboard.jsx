import MetricCard from '@/Components/MetricCard';
import MonthSelector from '@/Components/MonthSelector';
import RankingList from '@/Components/RankingList';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

function monthLabel(month) {
    const [year, m] = month.split('-').map(Number);
    return new Date(year, m - 1, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
}

export default function Dashboard({ period, totalFacturado, totalCortes, porServicio, liquidacion }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Mi panel
                </h2>
            }
        >
            <Head title="Mi panel" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-3xl space-y-8 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm capitalize text-brand-text-secondary">{monthLabel(period.month)}</p>
                        <MonthSelector month={period.month} url={route('barber.dashboard')} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <MetricCard label="Tu facturación del período" value={`$${totalFacturado.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} tone="success" />
                        <MetricCard label="Tus cortes" value={totalCortes} />
                    </div>

                    <MetricCard
                        label={liquidacion.salaryType === 'fixed' ? 'Tu liquidación estimada (sueldo fijo)' : 'Tu liquidación estimada (comisión)'}
                        value={`$${liquidacion.monto.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        tone="success"
                    />

                    <section className="space-y-3">
                        <h3 className="font-display text-lg font-bold text-brand-text">Tus servicios más prestados</h3>
                        <RankingList items={porServicio} emptyLabel="Todavía no cargaste ningún corte en este período." />
                    </section>

                    <Link
                        href={route('barber.cortes.index')}
                        className="inline-flex h-11 items-center justify-center rounded-brand-pill bg-brand-primary px-6 text-sm font-semibold text-white shadow-brand-cta transition hover:bg-brand-primary-hover"
                    >
                        Cargar un corte
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
