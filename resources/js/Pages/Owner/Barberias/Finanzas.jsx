import { dayLabel } from '@/Components/DaySelector';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import MonthSelector from '@/Components/MonthSelector';
import RankingList from '@/Components/RankingList';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    IconAlertTriangle,
    IconBan,
    IconCalendarMonth,
    IconChartBar,
    IconEdit,
    IconReceipt2,
    IconWallet,
} from '@tabler/icons-react';
import { useState } from 'react';

function formatPrice(value) {
    return Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatMoney(value) {
    return `$${formatPrice(value)}`;
}

function monthLabel(month) {
    const [year, m] = month.split('-').map(Number);
    const label = new Date(year, m - 1, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
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

function sueldoBadge(item) {
    if (item.salary_type === 'fixed') {
        return `Fijo ${formatMoney(item.salary_amount)}`;
    }

    if (item.salary_type === 'commission') {
        return `Comision ${item.commission_pct}%`;
    }

    return null;
}

function GastoRow({ gasto, barbId }) {
    const registro = gasto.registro;
    const [confirmingBaja, setConfirmingBaja] = useState(false);

    const { data, setData, patch, processing } = useForm({
        amount: registro ? String(registro.amount) : '',
    });

    function guardarMonto(event) {
        event.preventDefault();
        patch(route('owner.barberias.gasto-registros.update', { barberia: barbId, gastoRegistro: registro.id }));
    }

    function excluirDelMes() {
        if (!confirm(`Excluir "${gasto.name}" del calculo de este mes? La plantilla y los meses futuros no se modifican.`)) return;
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
        <>
            <article className="rounded-[24px] border border-brand-border bg-brand-surface-alt p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-brand-text">{gasto.name}</p>
                            <span className="inline-flex items-center rounded-full bg-brand-surface px-2.5 py-1 text-xs font-semibold text-brand-text-secondary">
                                {gasto.type === 'fijo' ? 'Fijo' : 'Variable'}
                            </span>
                            {gasto.is_recurring && (
                                <span className="inline-flex items-center rounded-full bg-brand-primary/12 px-2.5 py-1 text-xs font-semibold text-brand-primary">
                                    Recurrente
                                </span>
                            )}
                            {registro?.is_deleted_for_month && (
                                <span className="inline-flex items-center rounded-full bg-brand-danger/10 px-2.5 py-1 text-xs font-semibold text-brand-danger">
                                    Excluido este mes
                                </span>
                            )}
                        </div>

                        {registro ? (
                            <form onSubmit={guardarMonto} className="mt-4 space-y-3">
                                <div className="rounded-[20px] bg-brand-surface px-4 py-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                        Monto de este mes
                                    </p>
                                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                                        <TextInput
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.amount}
                                            onChange={(event) => setData('amount', event.target.value)}
                                            onWheel={(event) => event.target.blur()}
                                            className="h-11 w-full rounded-full border-brand-border bg-brand-surface-alt px-4 text-sm sm:max-w-[180px]"
                                        />
                                        {huboCambio && (
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="inline-flex min-h-[42px] items-center justify-center rounded-full bg-brand-primary px-4 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover disabled:opacity-60"
                                            >
                                                Guardar monto
                                            </button>
                                        )}
                                        {!registro.is_deleted_for_month && (
                                            <button
                                                type="button"
                                                onClick={excluirDelMes}
                                                className="text-sm font-medium text-brand-danger transition hover:underline"
                                            >
                                                Excluir este mes
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="mt-4 rounded-[20px] bg-brand-surface px-4 py-4 text-sm text-brand-text-secondary">
                                Sin registro generado en este mes.
                            </div>
                        )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <Link
                            href={route('owner.barberias.gastos.edit', { barberia: barbId, gasto: gasto.id })}
                            aria-label={`Editar plantilla de ${gasto.name}`}
                            title="Editar plantilla"
                            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-border bg-brand-surface text-brand-link transition hover:border-brand-primary/20 hover:bg-brand-primary/5"
                        >
                            <IconEdit size={17} />
                        </Link>

                        <button
                            type="button"
                            onClick={() => setConfirmingBaja(true)}
                            aria-label={`Dar de baja ${gasto.name}`}
                            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-brand-danger/20 bg-brand-danger/5 px-4 text-sm font-semibold text-brand-danger transition hover:bg-brand-danger/10"
                        >
                            <IconBan size={15} className="mr-1.5" />
                            Dar de baja
                        </button>
                    </div>
                </div>
            </article>

            <Modal show={confirmingBaja} onClose={() => setConfirmingBaja(false)}>
                <div className="p-6">
                    <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-danger/10 text-brand-danger">
                            <IconAlertTriangle size={20} stroke={1.75} />
                        </span>
                        <div>
                            <h2 className="font-display text-lg font-bold text-brand-text">
                                Dar de baja "{gasto.name}"?
                            </h2>
                            <p className="mt-1 text-sm text-brand-text-secondary">
                                Deja de generarse a partir del proximo mes. Los registros ya creados no se modifican.
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
        </>
    );
}

export default function Finanzas({ period, totalFacturado, totalSueldos, totalGastos, neto, sueldosPorBarbero, gastos, porDia }) {
    const { currentBarberia, flash } = usePage().props;
    const barbId = currentBarberia?.id;
    const todayIso = new Date().toLocaleDateString('sv-SE');

    const sueldosItems = sueldosPorBarbero.map((item) => ({ ...item, badge: sueldoBadge(item) }));
    const maxFacturacionDiaria = Math.max(...porDia.map((item) => item.total), 1);

    return (
        <AuthenticatedLayout
            headerClassName="bg-brand-bg"
            headerContainerClassName="mx-auto max-w-[1720px] px-2 py-4 sm:px-3 sm:py-5 lg:px-4"
            header={(
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-medium text-brand-text-secondary">
                            Resultado economico
                        </p>
                        <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] text-brand-text sm:text-4xl">
                            Finanzas
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-brand-text-secondary">
                            Sigue la rentabilidad del periodo, controla sueldos y gastos y ajusta el mes operativo sin salir del panel.
                        </p>
                    </div>

                    <div className="w-full lg:w-auto lg:min-w-[260px]">
                        <MonthSelector month={period.month} url={route('owner.barberias.finanzas', barbId)} fullWidth />
                    </div>
                </div>
            )}
        >
            <Head title="Finanzas" />

            <div className="pb-12">
                <div className="mx-auto max-w-[1720px] space-y-8 px-2 sm:px-3 lg:px-4">
                    {flash?.success && (
                        <div className="rounded-[24px] border border-brand-success/20 bg-brand-success-soft px-5 py-4 text-sm text-brand-success shadow-brand-card">
                            {flash.success}
                        </div>
                    )}

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)_minmax(320px,0.8fr)]">
                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-end justify-between gap-4">
                                <div className="flex min-w-0 items-start gap-4">
                                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-brand-primary/12 text-brand-primary shadow-sm">
                                        <IconWallet size={30} stroke={1.8} />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-brand-text-secondary">Neto del periodo</p>
                                        <p className={`mt-2 break-words py-1 font-display text-4xl font-extrabold leading-[1.15] tracking-[-0.04em] sm:text-[3.25rem] ${neto < 0 ? 'text-brand-danger' : 'text-brand-primary'}`}>
                                            {`${neto < 0 ? '-' : ''}${formatMoney(Math.abs(neto))}`}
                                        </p>
                                        <p className="mt-2 text-sm text-brand-text-secondary">
                                            Resultado estimado de {monthLabel(period.month)} para {currentBarberia?.name}.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                <MetricTile label="Facturacion" value={formatMoney(totalFacturado)} />
                                <MetricTile label="Sueldos" value={formatMoney(totalSueldos)} />
                                <MetricTile label="Gastos" value={formatMoney(totalGastos)} tone={totalGastos > 0 ? 'danger' : 'default'} />
                            </div>
                        </section>

                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-brand-text-secondary">Distribucion del periodo</p>
                                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-brand-text">
                                        Facturacion por dia
                                    </h3>
                                    <p className="mt-2 text-xs text-brand-text-secondary">
                                        Vista rapida de los dias que ya tuvieron movimiento dentro del mes seleccionado.
                                    </p>
                                </div>
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-link shadow-sm">
                                    <IconChartBar size={22} stroke={1.8} />
                                </span>
                            </div>

                            <div className="mt-6 rounded-[22px] bg-brand-surface-alt px-4 py-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                    Dias con actividad
                                </p>
                                <p className="mt-2 font-display text-3xl font-extrabold tracking-[-0.04em] text-brand-text">
                                    {porDia.length}
                                </p>
                            </div>

                            {porDia.length === 0 ? (
                                <div className="mt-6 rounded-[24px] border border-dashed border-brand-border bg-brand-surface-alt p-6 text-center">
                                    <p className="text-sm text-brand-text-secondary">
                                        Todavia no hay cortes cargados en este periodo.
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-6 flex h-48 items-end gap-3 sm:gap-4">
                                    {porDia.slice().reverse().map((dia) => {
                                        const height = dia.total > 0 ? Math.max((dia.total / maxFacturacionDiaria) * 100, 10) : 6;
                                        const esHoy = dia.date === todayIso;

                                        return (
                                            <div key={dia.date} className="flex flex-1 flex-col items-center justify-end gap-2">
                                                <p className={`text-[11px] font-semibold ${esHoy ? 'text-brand-link' : 'text-brand-text-secondary'}`}>
                                                    {dia.total > 0
                                                        ? Number(dia.total).toLocaleString('es-AR', { maximumFractionDigits: 0 })
                                                        : '0'}
                                                </p>
                                                <div className="flex h-32 w-full items-end rounded-full bg-brand-surface-alt/80 px-1.5 py-1.5">
                                                    <div
                                                        className={`w-full rounded-full transition-all ${
                                                            esHoy
                                                                ? 'bg-[linear-gradient(180deg,#48D5FC_0%,#4E75A5_100%)] shadow-[0_12px_24px_rgba(72,213,252,0.22)]'
                                                                : 'bg-brand-primary/45'
                                                        }`}
                                                        style={{ height: `${height}%` }}
                                                    />
                                                </div>
                                                <div className="text-center">
                                                    <p className={`text-xs font-semibold uppercase ${esHoy ? 'text-brand-link' : 'text-brand-text-secondary'}`}>
                                                        {new Date(`${dia.date}T00:00:00`).toLocaleDateString('es-AR', { weekday: 'short' }).replace('.', '')}
                                                    </p>
                                                    <p className="text-[11px] text-brand-text-secondary">
                                                        {dia.date.slice(8, 10)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-brand-text-secondary">Contexto mensual</p>
                                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-brand-text">
                                        Operacion del mes
                                    </h3>
                                    <p className="mt-2 text-xs text-brand-text-secondary">
                                        Referencias rapidas para entender que esta impactando en el resultado del periodo.
                                    </p>
                                </div>
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-link shadow-sm">
                                    <IconCalendarMonth size={22} stroke={1.8} />
                                </span>
                            </div>

                            <div className="mt-6 grid gap-3">
                                <MetricTile label="Barberos liquidados" value={sueldosPorBarbero.length} />
                                <MetricTile label="Gastos activos" value={gastos.length} />
                                <MetricTile label="Mes analizado" value={monthLabel(period.month)} />
                            </div>
                        </section>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                        <section className="space-y-4">
                            <div>
                                <h3 className="font-display text-lg font-bold text-brand-text">
                                    Sueldos por barbero
                                </h3>
                                <p className="text-sm text-brand-text-secondary">
                                    Cuanto representa cada liquidacion dentro del total de sueldos del periodo.
                                </p>
                            </div>

                            <div className="rounded-[28px] border border-brand-border bg-brand-surface p-5 shadow-brand-card sm:p-6">
                                <RankingList
                                    items={sueldosItems}
                                    emptyLabel="Todavia no hay barberos activos en esta barberia."
                                />
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h3 className="font-display text-lg font-bold text-brand-text">
                                        Gastos del periodo
                                    </h3>
                                    <p className="text-sm text-brand-text-secondary">
                                        Ajusta montos del mes, excluye registros puntuales o da de baja recurrencias futuras.
                                    </p>
                                </div>

                                <Link
                                    href={route('owner.barberias.gastos.create', { barberia: barbId })}
                                    className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-brand-primary px-5 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover"
                                >
                                    + Nuevo gasto
                                </Link>
                            </div>

                            <div className="rounded-[28px] border border-brand-border bg-brand-surface p-5 shadow-brand-card sm:p-6">
                                {gastos.length === 0 ? (
                                    <div className="rounded-[24px] border border-dashed border-brand-border bg-brand-surface-alt p-8 text-center">
                                        <p className="text-sm text-brand-text-secondary">
                                            Todavia no cargaste ningun gasto para esta barberia.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {gastos.map((gasto) => (
                                            <GastoRow key={gasto.id} gasto={gasto} barbId={barbId} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    <section className="space-y-4">
                        <div>
                            <h3 className="font-display text-lg font-bold text-brand-text">
                                Detalle diario
                            </h3>
                            <p className="text-sm text-brand-text-secondary">
                                Desglose de facturacion y cantidad de cortes para cada dia con actividad del periodo.
                            </p>
                        </div>

                        {porDia.length === 0 ? (
                            <div className="rounded-[28px] border border-dashed border-brand-border bg-brand-surface-alt p-10 text-center shadow-brand-card">
                                <p className="text-sm text-brand-text-secondary">
                                    Todavia no hay cortes cargados en este periodo.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                {porDia.map((dia) => (
                                    <article
                                        key={dia.date}
                                        className="rounded-[24px] border border-brand-border bg-brand-surface p-5 shadow-brand-card transition hover:-translate-y-0.5 hover:shadow-brand-card-hover"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-medium text-brand-text-secondary">
                                                    Dia operativo
                                                </p>
                                                <h4 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-brand-text">
                                                    {dayLabel(dia.date, dia.date === todayIso)}
                                                </h4>
                                            </div>
                                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-link shadow-sm">
                                                <IconReceipt2 size={20} stroke={1.8} />
                                            </span>
                                        </div>

                                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                            <div className="rounded-[20px] bg-brand-surface-alt px-4 py-4">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                                    Facturacion
                                                </p>
                                                <p className="mt-2 text-lg font-bold text-brand-text">
                                                    {formatMoney(dia.total)}
                                                </p>
                                            </div>
                                            <div className="rounded-[20px] bg-brand-surface-alt px-4 py-4">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                                    Cortes
                                                </p>
                                                <p className="mt-2 text-lg font-bold text-brand-text">
                                                    {dia.cantidad}
                                                </p>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
