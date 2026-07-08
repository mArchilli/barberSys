import { dayLabel } from '@/Components/DaySelector';
import DangerButton from '@/Components/DangerButton';
import MetricCard from '@/Components/MetricCard';
import Modal from '@/Components/Modal';
import MonthSelector from '@/Components/MonthSelector';
import RankingList from '@/Components/RankingList';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { IconAlertTriangle, IconBan, IconEdit, IconWallet } from '@tabler/icons-react';
import { useState } from 'react';

function formatPrice(value) {
    return Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function sueldoBadge(item) {
    if (item.salary_type === 'fixed') {
        return `Fijo $${formatPrice(item.salary_amount)}`;
    }
    if (item.salary_type === 'commission') {
        return `Comisión ${item.commission_pct}%`;
    }
    return null;
}

function GastoRow({ gasto, barbId }) {
    const registro = gasto.registro;
    const [confirmingBaja, setConfirmingBaja] = useState(false);

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
        router.patch(
            route('owner.barberias.gastos.deactivate', { barberia: barbId, gasto: gasto.id }),
            {},
            { onFinish: () => setConfirmingBaja(false) },
        );
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
                        <span className="text-sm text-brand-text-secondary">Monto este mes ($):</span>
                        <TextInput
                            type="number"
                            min="0"
                            step="0.01"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            onWheel={(e) => e.target.blur()}
                            className="h-9 w-28 text-sm"
                        />
                        {huboCambio && (
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-brand-pill bg-brand-primary px-3 py-1.5 text-xs font-medium text-brand-on-primary transition hover:bg-brand-primary-hover disabled:opacity-50"
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

            <div className="flex shrink-0 items-center gap-2 self-end border-t border-brand-border-subtle pt-3 sm:self-auto sm:border-t-0 sm:pt-0">
                <Link
                    href={route('owner.barberias.gastos.edit', { barberia: barbId, gasto: gasto.id })}
                    aria-label={`Editar plantilla de ${gasto.name}`}
                    title="Editar plantilla"
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-brand-link transition hover:bg-brand-primary-soft"
                >
                    <IconEdit size={16} />
                </Link>
                <button
                    type="button"
                    onClick={() => setConfirmingBaja(true)}
                    aria-label={`Dar de baja ${gasto.name}`}
                    className="flex min-h-[44px] items-center gap-1.5 rounded-md border border-brand-danger-soft px-3 text-xs font-medium text-brand-danger transition hover:bg-brand-danger-soft"
                >
                    <IconBan size={14} />
                    Dar de baja
                </button>
            </div>

            <Modal show={confirmingBaja} onClose={() => setConfirmingBaja(false)}>
                <div className="p-6">
                    <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-danger-soft text-brand-danger">
                            <IconAlertTriangle size={20} stroke={1.75} />
                        </span>
                        <div>
                            <h2 className="font-display text-lg font-bold text-brand-text">
                                ¿Dar de baja &ldquo;{gasto.name}&rdquo;?
                            </h2>
                            <p className="mt-1 text-sm text-brand-text-secondary">
                                Deja de generarse a partir del próximo mes. Los registros ya generados no se modifican.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setConfirmingBaja(false)}>
                            Cancelar
                        </SecondaryButton>
                        <DangerButton onClick={darDeBajaRecurrencia}>
                            Dar de baja
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </li>
    );
}

export default function Finanzas({ period, totalFacturado, totalSueldos, totalGastos, neto, sueldosPorBarbero, gastos, porDia }) {
    const { currentBarberia, flash } = usePage().props;
    const barbId = currentBarberia?.id;
    const todayIso = new Date().toLocaleDateString('sv-SE');

    const sueldosItems = sueldosPorBarbero.map((s) => ({ ...s, badge: sueldoBadge(s) }));

    return (
        <AuthenticatedLayout
            header={(
                <div className="flex items-center justify-between gap-3">
                    <h2 className="min-w-0 flex-1 truncate text-xl font-semibold leading-tight text-brand-text">
                        Finanzas
                    </h2>
                </div>
            )}
        >
            <Head title="Finanzas" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-5xl space-y-8 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
                    <div className="flex justify-center sm:justify-end">
                        <MonthSelector month={period.month} url={route('owner.barberias.finanzas', barbId)} fullWidth />
                    </div>

                    {flash?.success && (
                        <div className="rounded-brand-md border border-brand-success/30 bg-brand-success-soft p-4 text-sm text-brand-success">
                            {flash.success}
                        </div>
                    )}

                    <div className="rounded-brand-xl bg-brand-nav-bg p-6 shadow-brand-floating">
                        <div className="flex items-center gap-4">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-primary/20 text-brand-nav-active">
                                <IconWallet size={24} stroke={1.75} />
                            </span>
                            <div className="min-w-0">
                                <p className="text-sm text-brand-text-on-dark">Neto del período</p>
                                <p className={`truncate font-display text-3xl font-bold sm:text-4xl ${neto < 0 ? 'text-brand-danger' : 'text-brand-success'}`}>
                                    {`${neto < 0 ? '-' : ''}$${formatPrice(Math.abs(neto))}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Mobile: card consolidada de 3 columnas */}
                    <div className="rounded-brand-xl border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:hidden">
                        <div className="grid grid-cols-3 divide-x divide-brand-border-subtle">
                            <div className="pr-3">
                                <p className="text-[11px] font-medium uppercase tracking-wide text-brand-text-secondary">
                                    Facturación
                                </p>
                                <p className="mt-1 truncate text-lg font-bold text-brand-text">${formatPrice(totalFacturado)}</p>
                            </div>
                            <div className="px-3">
                                <p className="text-[11px] font-medium uppercase tracking-wide text-brand-text-secondary">
                                    Sueldos
                                </p>
                                <p className="mt-1 truncate text-lg font-bold text-brand-text">${formatPrice(totalSueldos)}</p>
                            </div>
                            <div className="pl-3">
                                <p className="text-[11px] font-medium uppercase tracking-wide text-brand-text-secondary">
                                    Gastos
                                </p>
                                <p className="mt-1 truncate text-lg font-bold text-brand-text">${formatPrice(totalGastos)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Desktop: cards individuales */}
                    <div className="hidden gap-4 sm:grid sm:grid-cols-3">
                        <MetricCard label="Facturación" value={`$${formatPrice(totalFacturado)}`} />
                        <MetricCard label="Sueldos" value={`$${formatPrice(totalSueldos)}`} />
                        <MetricCard label="Gastos" value={`$${formatPrice(totalGastos)}`} />
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <section className="space-y-3">
                            <h3 className="font-display text-lg font-bold text-brand-text">Sueldos por barbero</h3>
                            <RankingList
                                items={sueldosItems}
                                emptyLabel="Todavía no hay barberos activos en esta barbería."
                            />
                        </section>

                        <section className="space-y-3">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <h3 className="font-display text-lg font-bold text-brand-text">Gastos</h3>
                                <Link
                                    href={route('owner.barberias.gastos.create', { barberia: barbId })}
                                    className="inline-flex items-center justify-center rounded-brand-pill bg-brand-primary px-4 py-2.5 text-sm font-medium text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover"
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

                        <section className="space-y-3 lg:col-span-2">
                            <h3 className="font-display text-lg font-bold text-brand-text">Facturación por día</h3>

                            {porDia.length === 0 ? (
                                <p className="rounded-brand-md border border-dashed border-brand-border bg-brand-surface-alt p-4 text-sm text-brand-text-secondary">
                                    Todavía no hay cortes cargados en este período.
                                </p>
                            ) : (
                                <>
                                    {/* Mobile: cards */}
                                    <div className="space-y-2 md:hidden">
                                        {porDia.map((dia) => (
                                            <div
                                                key={dia.date}
                                                className="flex items-center justify-between gap-3 rounded-brand-md border border-brand-border bg-brand-surface p-4"
                                            >
                                                <p className="text-sm font-medium text-brand-text">
                                                    {dayLabel(dia.date, dia.date === todayIso)}
                                                </p>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-brand-text">${formatPrice(dia.total)}</p>
                                                    <p className="text-xs text-brand-text-secondary">
                                                        {dia.cantidad} {dia.cantidad === 1 ? 'corte' : 'cortes'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Desktop: tabla */}
                                    <div className="hidden overflow-x-auto rounded-brand-md border border-brand-border bg-brand-surface md:block">
                                        <table className="w-full min-w-[420px] text-left text-sm">
                                            <thead className="text-xs uppercase tracking-wide text-brand-text-secondary">
                                                <tr className="border-b border-brand-border-subtle">
                                                    <th className="p-4 font-medium">Día</th>
                                                    <th className="p-4 font-medium">Facturación</th>
                                                    <th className="p-4 font-medium">Cortes</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-brand-border-subtle">
                                                {porDia.map((dia) => (
                                                    <tr key={dia.date} className="transition hover:bg-brand-surface-alt">
                                                        <td className="p-4 font-medium text-brand-text">
                                                            {dayLabel(dia.date, dia.date === todayIso)}
                                                        </td>
                                                        <td className="p-4 text-brand-text">${formatPrice(dia.total)}</td>
                                                        <td className="p-4 text-brand-text-secondary">{dia.cantidad}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
