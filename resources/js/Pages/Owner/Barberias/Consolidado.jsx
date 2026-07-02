import MetricCard from '@/Components/MetricCard';
import MonthSelector from '@/Components/MonthSelector';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

function monthLabel(month) {
    const [year, m] = month.split('-').map(Number);
    return new Date(year, m - 1, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
}

function formatPrice(value) {
    return Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Consolidado({ period, totalFacturado, totalCortes, totalSueldos, totalGastos, totalNeto, comparativa }) {
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

                    <MetricCard
                        label="Neto total del negocio"
                        value={`${totalNeto < 0 ? '-' : ''}$${formatPrice(Math.abs(totalNeto))}`}
                        tone={totalNeto < 0 ? 'danger' : 'success'}
                    />

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <MetricCard label="Facturación total" value={`$${formatPrice(totalFacturado)}`} />
                        <MetricCard label="Cortes cargados" value={totalCortes} />
                        <MetricCard label="Sueldos totales" value={`$${formatPrice(totalSueldos)}`} />
                        <MetricCard label="Gastos totales" value={`$${formatPrice(totalGastos)}`} />
                    </div>

                    <section className="space-y-3">
                        <h3 className="font-display text-lg font-bold text-brand-text">Comparativa por barbería</h3>
                        <p className="text-sm text-brand-text-secondary">Tocá una barbería para ir a su dashboard individual.</p>

                        {comparativa.length === 0 ? (
                            <p className="rounded-brand-md border border-dashed border-brand-border bg-brand-surface-alt p-4 text-sm text-brand-text-secondary">
                                Todavía no hay cortes cargados en este período.
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-brand-md border border-brand-border bg-brand-surface">
                                <table className="w-full min-w-[560px] text-left text-sm">
                                    <thead className="text-xs uppercase tracking-wide text-brand-text-secondary">
                                        <tr className="border-b border-brand-border-subtle">
                                            <th className="p-4 font-medium">Barbería</th>
                                            <th className="p-4 font-medium">Facturación</th>
                                            <th className="p-4 font-medium">Sueldos</th>
                                            <th className="p-4 font-medium">Gastos</th>
                                            <th className="p-4 font-medium">Neto</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-brand-border-subtle">
                                        {comparativa.map((item) => (
                                            <tr key={item.id} className="transition hover:bg-brand-surface-alt">
                                                <td className="p-4">
                                                    <Link
                                                        href={route('owner.barberias.dashboard', item.id)}
                                                        className="font-medium text-brand-text hover:text-brand-primary"
                                                    >
                                                        {item.name}
                                                    </Link>
                                                </td>
                                                <td className="p-4 text-brand-text">${formatPrice(item.total)}</td>
                                                <td className="p-4 text-brand-text-secondary">${formatPrice(item.sueldos)}</td>
                                                <td className="p-4 text-brand-text-secondary">${formatPrice(item.gastos)}</td>
                                                <td className={`p-4 font-semibold ${item.neto < 0 ? 'text-brand-danger' : 'text-brand-success'}`}>
                                                    ${formatPrice(item.neto)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
