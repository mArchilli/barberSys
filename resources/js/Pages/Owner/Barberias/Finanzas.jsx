import MetricCard from '@/Components/MetricCard';
import MonthSelector from '@/Components/MonthSelector';
import RankingList from '@/Components/RankingList';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { IconEdit } from '@tabler/icons-react';

function monthLabel(month) {
    const [year, m] = month.split('-').map(Number);
    return new Date(year, m - 1, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
}

function formatPrice(value) {
    return Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function GastoRow({ gasto, barbId }) {
    const registro = gasto.registro;

    const { data, setData, patch, processing } = useForm({
        amount: registro ? String(registro.amount) : '',
    });

    function guardarMonto(e) {
        e.preventDefault();
        patch(route('owner.barberias.gasto-registros.update', { barberia: barbId, gastoRegistro: registro.id }));
    }

    function excluirDelMes() {
        if (! confirm(`¿Excluir "${gasto.name}" del cálculo de este mes? La plantilla y los meses futuros no se ven afectados.`)) return;
        router.patch(route('owner.barberias.gasto-registros.excluir', { barberia: barbId, gastoRegistro: registro.id }));
    }

    function darDeBajaRecurrencia() {
        if (! confirm(`¿Dar de baja "${gasto.name}"? Deja de generarse a partir del próximo mes. Los registros ya generados no se modifican.`)) return;
        router.patch(route('owner.barberias.gastos.deactivate', { barberia: barbId, gasto: gasto.id }));
    }

    const huboCambio = registro && data.amount !== String(registro.amount);

    return (
        <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-brand-text">{gasto.name}</p>
                    <span className="inline-flex items-center rounded-brand-pill bg-brand-surface-alt px-2 py-0.5 text-xs font-medium text-brand-text-secondary">
                        {gasto.type === 'fijo' ? 'Fijo' : 'Variable'}
                    </span>
                    {gasto.is_recurring && (
                        <span className="inline-flex items-center rounded-brand-pill bg-brand-primary-soft px-2 py-0.5 text-xs font-medium text-brand-primary-soft-text">
                            Recurrente
                        </span>
                    )}
                    {registro?.is_deleted_for_month && (
                        <span className="inline-flex items-center rounded-brand-pill bg-brand-danger-soft px-2 py-0.5 text-xs font-medium text-brand-danger">
                            Excluido este mes
                        </span>
                    )}
                </div>

                {registro ? (
                    <form onSubmit={guardarMonto} className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-sm text-brand-text-secondary">Monto este mes:</span>
                        <TextInput
                            type="number"
                            min="0"
                            step="0.01"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            className="h-9 w-28 text-sm"
                        />
                        {huboCambio && (
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-brand-pill bg-brand-primary px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-primary-hover disabled:opacity-50"
                            >
                                Guardar
                            </button>
                        )}
                        {! registro.is_deleted_for_month && (
                            <button
                                type="button"
                                onClick={excluirDelMes}
                                className="text-xs text-brand-danger hover:underline"
                            >
                                Excluir este mes
                            </button>
                        )}
                    </form>
                ) : (
                    <p className="mt-1 text-sm text-brand-text-secondary">Sin registro en este mes.</p>
                )}
            </div>

            <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
                <Link
                    href={route('owner.barberias.gastos.edit', { barberia: barbId, gasto: gasto.id })}
                    aria-label={`Editar plantilla de ${gasto.name}`}
                    title="Editar plantilla"
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-brand-primary transition hover:bg-brand-primary-soft"
                >
                    <IconEdit size={16} />
                </Link>
                <button
                    type="button"
                    onClick={darDeBajaRecurrencia}
                    className="min-h-[44px] rounded-md px-2 text-xs font-medium text-brand-danger transition hover:bg-brand-danger-soft"
                >
                    Dar de baja
                </button>
            </div>
        </li>
    );
}

export default function Finanzas({ period, totalFacturado, totalSueldos, totalGastos, neto, sueldosPorBarbero, gastos }) {
    const { currentBarberia, flash } = usePage().props;
    const barbId = currentBarberia?.id;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Finanzas — {currentBarberia?.name}
                </h2>
            }
        >
            <Head title="Finanzas" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-5xl space-y-8 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm capitalize text-brand-text-secondary">{monthLabel(period.month)}</p>
                        <MonthSelector month={period.month} url={route('owner.barberias.finanzas', barbId)} />
                    </div>

                    {flash?.success && (
                        <div className="rounded-brand-md border border-brand-success/30 bg-brand-success-soft p-4 text-sm text-brand-success">
                            {flash.success}
                        </div>
                    )}

                    <MetricCard
                        label="Neto del período"
                        value={`${neto < 0 ? '-' : ''}$${formatPrice(Math.abs(neto))}`}
                        tone={neto < 0 ? 'danger' : 'success'}
                    />

                    <div className="grid gap-4 sm:grid-cols-3">
                        <MetricCard label="Facturación" value={`$${formatPrice(totalFacturado)}`} />
                        <MetricCard label="Sueldos" value={`$${formatPrice(totalSueldos)}`} />
                        <MetricCard label="Gastos" value={`$${formatPrice(totalGastos)}`} />
                    </div>

                    <section className="space-y-3">
                        <h3 className="font-display text-lg font-bold text-brand-text">Sueldos por barbero</h3>
                        <RankingList
                            items={sueldosPorBarbero}
                            emptyLabel="Todavía no hay barberos activos en esta barbería."
                        />
                    </section>

                    <section className="space-y-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h3 className="font-display text-lg font-bold text-brand-text">Gastos</h3>
                            <Link
                                href={route('owner.barberias.gastos.create', { barberia: barbId })}
                                className="inline-flex items-center justify-center rounded-brand-pill bg-brand-primary px-4 py-2.5 text-sm font-medium text-white shadow-brand-cta transition hover:bg-brand-primary-hover"
                            >
                                + Nuevo gasto
                            </Link>
                        </div>

                        {gastos.length === 0 ? (
                            <p className="rounded-brand-md border border-dashed border-brand-border bg-brand-surface-alt p-4 text-sm text-brand-text-secondary">
                                Todavía no cargaste ningún gasto para esta barbería.
                            </p>
                        ) : (
                            <ul className="divide-y divide-brand-border-subtle overflow-hidden rounded-brand-md border border-brand-border bg-brand-surface">
                                {gastos.map((gasto) => (
                                    <GastoRow key={gasto.id} gasto={gasto} barbId={barbId} />
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
