import DaySelector, { dayLabel } from '@/Components/DaySelector';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    IconAlertTriangle,
    IconEdit,
    IconLockDollar,
    IconLockOpen,
    IconReceipt2,
    IconX,
} from '@tabler/icons-react';
import axios from 'axios';
import { useRef, useState } from 'react';

function formatPrice(value) {
    return Number(value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatMoney(value) {
    return `$${formatPrice(value)}`;
}

function CierreMedioCard({ medio, cerrado, detalle, conteoValue, onConteoChange, error }) {
    if (cerrado) {
        if (!detalle || detalle.countedAmount === null) {
            return (
                <div className="rounded-[22px] bg-brand-surface-alt px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                        {medio.name}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-brand-text-secondary">Sin verificar</p>
                    <p className="mt-1 text-xs text-brand-text-secondary">
                        Esperado: {formatMoney(detalle ? detalle.expectedAmount : medio.expectedAmount)}
                    </p>
                </div>
            );
        }

        const coincide = Number(detalle.difference) === 0;

        return (
            <div className="rounded-[22px] bg-brand-surface-alt px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                    {medio.name}
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                    <div>
                        <p className="text-[10px] uppercase tracking-wide text-brand-text-secondary">Esperado</p>
                        <p className="mt-1 text-sm font-semibold text-brand-text">{formatMoney(detalle.expectedAmount)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wide text-brand-text-secondary">Contado</p>
                        <p className="mt-1 text-sm font-semibold text-brand-text">{formatMoney(detalle.countedAmount)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wide text-brand-text-secondary">Diferencia</p>
                        <p className={`mt-1 text-sm font-semibold ${coincide ? 'text-brand-success' : 'text-brand-danger'}`}>
                            {formatMoney(detalle.difference)}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-[22px] bg-brand-surface-alt px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                {medio.name}
            </p>
            <p className="mt-2 text-sm text-brand-text-secondary">
                Esperado: <span className="font-semibold text-brand-text">{formatMoney(medio.expectedAmount)}</span>
            </p>
            <div className="mt-3">
                <InputLabel htmlFor={`conteo-${medio.id}`} value="Contado (opcional)" />
                <TextInput
                    id={`conteo-${medio.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Sin verificar"
                    value={conteoValue}
                    onChange={(event) => onConteoChange(medio.id, event.target.value)}
                    onWheel={(event) => event.target.blur()}
                    className="mt-2 block h-11 w-full rounded-full border-brand-border bg-brand-surface px-4 text-sm"
                />
                <InputError message={error} className="mt-1" />
            </div>
        </div>
    );
}

function MovimientoRow({ corte, servicios, mediosPago, barbId, searchUrl, cerrado }) {
    const [editing, setEditing] = useState(false);
    const { data, setData, patch, processing, errors, reset } = useForm({
        servicio_id: String(corte.servicio.id),
        cliente_id: corte.cliente.id,
        medio_pago_id: String(corte.medioPago.id),
        price: String(corte.price),
    });

    const [clienteQuery, setClienteQuery] = useState(corte.cliente.name);
    const [clienteResults, setClienteResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const searchTimeout = useRef(null);

    function handleClienteQueryChange(event) {
        const value = event.target.value;
        setClienteQuery(value);
        setData('cliente_id', '');
        setShowResults(true);
        clearTimeout(searchTimeout.current);

        if (value.trim().length < 2) {
            setClienteResults([]);
            return;
        }

        searchTimeout.current = setTimeout(async () => {
            try {
                const response = await axios.get(searchUrl, { params: { q: value.trim() } });
                setClienteResults(response.data);
            } catch {
                setClienteResults([]);
            }
        }, 300);
    }

    function selectCliente(cliente) {
        setData('cliente_id', cliente.id);
        setClienteQuery(cliente.name);
        setClienteResults([]);
        setShowResults(false);
    }

    function cancelar() {
        reset();
        setClienteQuery(corte.cliente.name);
        setClienteResults([]);
        setEditing(false);
    }

    function submit(event) {
        event.preventDefault();
        patch(route('owner.barberias.cortes.update', { barberia: barbId, corte: corte.id }), {
            preserveScroll: true,
            onSuccess: () => setEditing(false),
        });
    }

    if (!editing) {
        return (
            <article className="rounded-[22px] bg-brand-surface-alt px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-brand-text">{corte.cliente.name}</p>
                    <div className="flex shrink-0 items-center gap-3">
                        <p className="text-sm font-bold text-brand-text">{formatMoney(corte.price)}</p>
                        <button
                            type="button"
                            onClick={() => setEditing(true)}
                            aria-label={`Corregir corte de ${corte.cliente.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-border bg-brand-surface text-brand-link transition hover:border-brand-primary/20 hover:bg-brand-primary/5"
                        >
                            <IconEdit size={15} />
                        </button>
                    </div>
                </div>
                <p className="mt-2 text-sm text-brand-text-secondary">
                    {corte.servicio.name} - {corte.medioPago.name}
                </p>
                <p className="mt-1 text-xs text-brand-text-secondary">
                    Atendió: <span className="font-medium text-brand-text">{corte.barbero.name}</span>
                </p>
            </article>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-3 rounded-[22px] border border-brand-border bg-brand-surface-alt px-4 py-4">
            <p className="text-xs text-brand-text-secondary">
                Atendió: <span className="font-medium text-brand-text">{corte.barbero.name}</span>
            </p>

            {cerrado && (
                <div className="flex items-start gap-2 rounded-[16px] border border-brand-warning/30 bg-brand-warning-soft px-3 py-2 text-xs text-brand-text">
                    <IconAlertTriangle size={16} className="mt-0.5 shrink-0 text-brand-warning" />
                    <span>Este día ya está cerrado. Corregir este corte no vuelve a abrir ni actualiza el cierre ya registrado.</span>
                </div>
            )}

            <div className="relative">
                <InputLabel htmlFor={`cliente-${corte.id}`} value="Cliente" />
                <TextInput
                    id={`cliente-${corte.id}`}
                    value={clienteQuery}
                    onChange={handleClienteQueryChange}
                    onFocus={() => setShowResults(true)}
                    onBlur={() => setTimeout(() => setShowResults(false), 150)}
                    autoComplete="off"
                    className="mt-2 block h-11 w-full rounded-full border-brand-border bg-brand-surface px-4 text-sm"
                />
                {showResults && clienteResults.length > 0 && (
                    <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-[18px] border border-brand-border bg-brand-surface shadow-brand-card">
                        {clienteResults.map((cliente) => (
                            <li key={cliente.id}>
                                <button
                                    type="button"
                                    onMouseDown={() => selectCliente(cliente)}
                                    className="flex min-h-[42px] w-full items-center px-4 text-left text-sm text-brand-text transition hover:bg-brand-primary/5"
                                >
                                    {cliente.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                <InputError message={errors.cliente_id} className="mt-1" />
            </div>

            <div>
                <InputLabel htmlFor={`servicio-${corte.id}`} value="Servicio" />
                <select
                    id={`servicio-${corte.id}`}
                    value={data.servicio_id}
                    onChange={(event) => setData('servicio_id', event.target.value)}
                    className="mt-2 block h-11 w-full rounded-full border-brand-border bg-brand-surface px-4 text-sm"
                >
                    {servicios.map((servicio) => (
                        <option key={servicio.id} value={servicio.id}>{servicio.name}</option>
                    ))}
                </select>
                <InputError message={errors.servicio_id} className="mt-1" />
            </div>

            <div>
                <InputLabel htmlFor={`medio-${corte.id}`} value="Medio de pago" />
                <select
                    id={`medio-${corte.id}`}
                    value={data.medio_pago_id}
                    onChange={(event) => setData('medio_pago_id', event.target.value)}
                    className="mt-2 block h-11 w-full rounded-full border-brand-border bg-brand-surface px-4 text-sm"
                >
                    {mediosPago.map((medio) => (
                        <option key={medio.id} value={medio.id}>{medio.name}</option>
                    ))}
                </select>
                <InputError message={errors.medio_pago_id} className="mt-1" />
            </div>

            <div>
                <InputLabel htmlFor={`precio-${corte.id}`} value="Precio" />
                <TextInput
                    id={`precio-${corte.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={data.price}
                    onChange={(event) => setData('price', event.target.value)}
                    onWheel={(event) => event.target.blur()}
                    className="mt-2 block h-11 w-full rounded-full border-brand-border bg-brand-surface px-4 text-sm"
                />
                <InputError message={errors.price} className="mt-1" />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
                <SecondaryButton type="button" onClick={cancelar}>
                    <IconX size={14} className="mr-1" />
                    Cancelar
                </SecondaryButton>
                <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex min-h-[38px] items-center justify-center rounded-full bg-brand-primary px-4 text-xs font-semibold uppercase tracking-widest text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover disabled:opacity-60"
                >
                    Guardar
                </button>
            </div>
        </form>
    );
}

export default function Index({ day, esHoy, resumen, movimientos, mediosPago, servicios, cerrado, cierre, routes }) {
    const { currentBarberia, flash } = usePage().props;
    const barbId = currentBarberia?.id;
    const [confirmingReabrir, setConfirmingReabrir] = useState(false);

    // Si la caja ya se cerró alguna vez (incluso si se reabrió después), sus
    // detalles siguen ahí: se usan para no obligar a retipear los conteos
    // que ya estaban cargados, y el owner solo corrige el que hizo falta.
    const detallesPorMedio = cierre
        ? Object.fromEntries(cierre.detalles.map((detalle) => [detalle.medioPagoId, detalle]))
        : {};

    const { data, setData, post, processing, errors } = useForm({
        day,
        conteos: Object.fromEntries(mediosPago.map((medio) => {
            const previo = detallesPorMedio[medio.id];
            return [medio.id, previo && previo.countedAmount !== null ? String(previo.countedAmount) : ''];
        })),
    });

    function setConteo(medioId, value) {
        setData('conteos', { ...data.conteos, [medioId]: value });
    }

    function submitCierre(event) {
        event.preventDefault();
        post(routes.cerrar, { preserveScroll: true });
    }

    function reabrirCaja() {
        router.patch(routes.reabrir, { day }, {
            preserveScroll: true,
            onFinish: () => setConfirmingReabrir(false),
        });
    }

    return (
        <AuthenticatedLayout
            headerClassName="bg-brand-bg"
            headerContainerClassName="mx-auto max-w-[1720px] px-2 py-4 sm:px-3 sm:py-5 lg:px-4"
            header={(
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-medium text-brand-text-secondary">Control diario</p>
                        <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] text-brand-text sm:text-4xl">
                            Caja
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-brand-text-secondary">
                            Revisá los movimientos del día y, si querés, dejá registro de tu conteo contra la realidad.
                        </p>
                    </div>

                    <DaySelector date={day} esHoy={esHoy} url={routes.index} onDark={false} fullWidth />
                </div>
            )}
        >
            <Head title="Caja" />

            <div className="pb-12">
                <div className="mx-auto max-w-[1720px] space-y-8 px-2 sm:px-3 lg:px-4">
                    {flash?.success && (
                        <div className="rounded-[24px] border border-brand-success/20 bg-brand-success-soft px-5 py-4 text-sm text-brand-success shadow-brand-card">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="rounded-[24px] border border-brand-danger/20 bg-brand-danger/5 px-5 py-4 text-sm text-brand-danger shadow-brand-card">
                            {flash.error}
                        </div>
                    )}

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-brand-text-secondary">
                                        {dayLabel(day, esHoy)}
                                    </p>
                                    <p className="mt-2 break-words py-1 font-display text-4xl font-extrabold leading-[1.15] tracking-[-0.04em] text-brand-primary sm:text-[3.25rem]">
                                        {formatMoney(resumen.totalFacturado)}
                                    </p>
                                    <p className="mt-2 text-sm text-brand-text-secondary">
                                        {resumen.cantidadCortes} {resumen.cantidadCortes === 1 ? 'corte cargado' : 'cortes cargados'} en {currentBarberia?.name}.
                                    </p>
                                </div>
                                <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
                                    cerrado
                                        ? 'bg-brand-success-soft text-brand-success'
                                        : 'bg-brand-surface-alt text-brand-text-secondary'
                                }`}>
                                    {cerrado ? 'Caja cerrada' : 'Caja abierta'}
                                </span>
                            </div>

                            {cerrado && (
                                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-xs text-brand-text-secondary">
                                        Cerrada por {cierre.closedByName} el {new Date(cierre.closedAt).toLocaleString('es-AR')}.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setConfirmingReabrir(true)}
                                        className="inline-flex min-h-[38px] items-center gap-2 rounded-full border border-brand-border bg-brand-surface px-4 text-xs font-semibold text-brand-text transition hover:border-brand-primary/20 hover:bg-brand-primary/5"
                                    >
                                        <IconLockOpen size={15} stroke={1.9} />
                                        Reabrir caja
                                    </button>
                                </div>
                            )}

                            <div className="mt-6">
                                <h3 className="text-sm font-semibold text-brand-text">
                                    {cerrado ? 'Conteo por medio de pago' : 'Conteo por medio de pago (opcional)'}
                                </h3>
                                <p className="mt-1 text-xs text-brand-text-secondary">
                                    Cada medio se verifica por separado — podés cargar solo el efectivo, todos, o ninguno.
                                </p>

                                {mediosPago.length === 0 ? (
                                    <div className="mt-4 rounded-[22px] border border-dashed border-brand-border bg-brand-surface-alt p-6 text-center text-sm text-brand-text-secondary">
                                        No hay medios de pago activos para esta barbería.
                                    </div>
                                ) : (
                                    <form onSubmit={submitCierre}>
                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            {mediosPago.map((medio) => (
                                                <CierreMedioCard
                                                    key={medio.id}
                                                    medio={medio}
                                                    cerrado={cerrado}
                                                    detalle={detallesPorMedio[medio.id]}
                                                    conteoValue={data.conteos[medio.id] ?? ''}
                                                    onConteoChange={setConteo}
                                                    error={errors[`conteos.${medio.id}`]}
                                                />
                                            ))}
                                        </div>

                                        {!cerrado && (
                                            <div className="mt-5 flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-brand-primary px-6 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    <IconLockDollar size={18} stroke={1.8} />
                                                    Cerrar caja
                                                </button>
                                            </div>
                                        )}
                                    </form>
                                )}
                            </div>
                        </section>

                        <aside className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <h3 className="text-xl font-semibold tracking-[-0.03em] text-brand-text">
                                    Movimientos del día
                                </h3>
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-link shadow-sm">
                                    <IconReceipt2 size={22} stroke={1.8} />
                                </span>
                            </div>

                            {movimientos.length === 0 ? (
                                <div className="mt-5 rounded-[24px] border border-dashed border-brand-border bg-brand-surface-alt p-6 text-center">
                                    <p className="text-sm text-brand-text-secondary">
                                        Todavía no hay cortes cargados este día.
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-5 space-y-3">
                                    {movimientos.map((corte) => (
                                        <MovimientoRow
                                            key={corte.id}
                                            corte={corte}
                                            servicios={servicios}
                                            mediosPago={mediosPago}
                                            barbId={barbId}
                                            searchUrl={routes.search}
                                            cerrado={cerrado}
                                        />
                                    ))}
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </div>

            <Modal show={confirmingReabrir} onClose={() => setConfirmingReabrir(false)}>
                <div className="p-6">
                    <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-danger/10 text-brand-danger">
                            <IconAlertTriangle size={20} stroke={1.75} />
                        </span>
                        <div>
                            <h2 className="font-display text-lg font-bold text-brand-text">
                                ¿Reabrir la caja de {dayLabel(day, esHoy)}?
                            </h2>
                            <p className="mt-1 text-sm text-brand-text-secondary">
                                Vas a poder corregir o cargar movimientos de nuevo. El conteo que ya registraste para este día se borra — podés volver a contarlo cuando cierres otra vez.
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setConfirmingReabrir(false)}>
                            Cancelar
                        </SecondaryButton>
                        <DangerButton onClick={reabrirCaja}>
                            Reabrir caja
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
