import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Link, useForm, usePage } from '@inertiajs/react';
import { IconReceipt2, IconSearch, IconScissors } from '@tabler/icons-react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

function today() {
    return new Date().toLocaleDateString('sv-SE');
}

function formatPrice(price) {
    return Number(price).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function SectionBlock({ title, description, children }) {
    return (
        <div className="rounded-[24px] bg-brand-surface-alt p-5">
            <div className="mb-4">
                <p className="text-sm font-semibold text-brand-text">{title}</p>
                {description && (
                    <p className="mt-1 text-xs text-brand-text-secondary">
                        {description}
                    </p>
                )}
            </div>
            {children}
        </div>
    );
}

export default function RegistroCorteForm({ servicios, mediosPago, cortesHoy, routes, variant = 'default' }) {
    const { flash, auth, currentBarberia } = usePage().props;
    const faltaServicios = servicios.length === 0;
    const faltaMediosPago = mediosPago.length === 0;
    const faltaCatalogo = faltaServicios || faltaMediosPago;
    const puedeCargarCatalogo = auth.user.role === 'owner' && currentBarberia;
    const totalHoy = cortesHoy.reduce((sum, corte) => sum + Number(corte.price), 0);
    const isOwnerVariant = variant === 'owner';

    const { data, setData, post, processing, errors, reset } = useForm({
        servicio_id: '',
        cliente_id: '',
        cliente_nombre: '',
        medio_pago_id: '',
        price: '',
        performed_at: today(),
    });

    const [clienteQuery, setClienteQuery] = useState('');
    const [clienteResults, setClienteResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const searchTimeout = useRef(null);

    useEffect(() => () => clearTimeout(searchTimeout.current), []);

    function selectServicio(id) {
        const servicio = servicios.find((item) => String(item.id) === String(id));
        setData('servicio_id', String(id));

        if (servicio) {
            setData('price', String(servicio.price));
        }
    }

    function handleClienteQueryChange(event) {
        const value = event.target.value;
        setClienteQuery(value);
        setData('cliente_id', '');
        setData('cliente_nombre', value);
        setShowResults(true);

        clearTimeout(searchTimeout.current);

        if (value.trim().length < 2) {
            setClienteResults([]);
            return;
        }

        searchTimeout.current = setTimeout(async () => {
            try {
                const response = await axios.get(routes.search, { params: { q: value.trim() } });
                setClienteResults(response.data);
            } catch {
                setClienteResults([]);
            }
        }, 300);
    }

    function selectCliente(cliente) {
        setData('cliente_id', cliente.id);
        setData('cliente_nombre', cliente.name);
        setClienteQuery(cliente.name);
        setClienteResults([]);
        setShowResults(false);
    }

    function submit(event) {
        event.preventDefault();
        post(routes.store, {
            preserveScroll: true,
            onSuccess: () => {
                reset('servicio_id', 'cliente_id', 'cliente_nombre', 'medio_pago_id', 'price');
                setClienteQuery('');
                setClienteResults([]);
            },
        });
    }

    return (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-4">
                        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-brand-primary/12 text-brand-primary shadow-sm">
                            <IconScissors size={30} stroke={1.8} />
                        </span>
                        <div className="min-w-0">
                            {! isOwnerVariant && (
                                <p className="text-sm font-medium text-brand-text-secondary">Carga de corte</p>
                            )}
                            <p className={`${isOwnerVariant ? '' : 'mt-3'} truncate font-display text-4xl font-extrabold tracking-[-0.04em] text-brand-text sm:text-[3.25rem]`}>
                                {data.cliente_nombre || 'Sin cliente'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[22px] bg-brand-surface-alt px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                            Servicio
                        </p>
                        <p className="mt-2 text-sm font-semibold text-brand-text">
                            {data.servicio_id
                                ? servicios.find((item) => String(item.id) === String(data.servicio_id))?.name
                                : 'Sin seleccionar'}
                        </p>
                    </div>
                    <div className="rounded-[22px] bg-brand-surface-alt px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                            Cobro
                        </p>
                        <p className="mt-2 text-sm font-semibold text-brand-text">
                            {data.medio_pago_id
                                ? mediosPago.find((item) => String(item.id) === String(data.medio_pago_id))?.name
                                : 'Sin seleccionar'}
                        </p>
                    </div>
                    <div className="rounded-[22px] bg-brand-surface-alt px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                            Importe
                        </p>
                        <p className="mt-2 text-sm font-semibold text-brand-text">
                            {`$${formatPrice(data.price || 0)}`}
                        </p>
                    </div>
                </div>

                <div className="mt-8">
                    {flash?.success && (
                        <div className="mb-6 rounded-[24px] border border-brand-success/20 bg-brand-success-soft px-5 py-4 text-sm text-brand-success shadow-brand-card">
                            {flash.success}
                        </div>
                    )}

                    {faltaCatalogo ? (
                        <div className="rounded-[28px] border border-dashed border-brand-border bg-brand-surface-alt p-8 text-center">
                            <h3 className="font-display text-xl font-bold text-brand-text">
                                Falta completar el catalogo operativo
                            </h3>
                            <p className="mx-auto mt-3 max-w-xl text-sm text-brand-text-secondary">
                                {faltaServicios && faltaMediosPago
                                    ? 'Necesitas cargar servicios y medios de pago antes de poder registrar cortes.'
                                    : faltaServicios
                                        ? 'Necesitas cargar al menos un servicio antes de poder registrar cortes.'
                                        : 'Necesitas cargar al menos un medio de pago antes de poder registrar cortes.'}
                            </p>

                            {puedeCargarCatalogo && (
                                <div className="mt-5 flex flex-wrap justify-center gap-3">
                                    {faltaServicios && (
                                        <Link
                                            href={route('owner.barberias.servicios.create', currentBarberia.id)}
                                            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-brand-border bg-brand-surface px-5 text-sm font-semibold text-brand-text transition hover:border-brand-primary/20 hover:bg-brand-primary/5 hover:text-brand-link"
                                        >
                                            Cargar servicios
                                        </Link>
                                    )}
                                    {faltaMediosPago && (
                                        <Link
                                            href={route('owner.barberias.medios-pago.create', currentBarberia.id)}
                                            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-brand-border bg-brand-surface px-5 text-sm font-semibold text-brand-text transition hover:border-brand-primary/20 hover:bg-brand-primary/5 hover:text-brand-link"
                                        >
                                            Cargar medios de pago
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={submit} className="space-y-6">
                            <SectionBlock
                                title="Cliente"
                                description="Busca un cliente existente o escribe un nombre nuevo para crearlo al guardar."
                            >
                                <div className="relative">
                                    <InputLabel htmlFor="cliente_query" value="Nombre y apellido *" />
                                    <div className="relative mt-2">
                                        <IconSearch
                                            size={18}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-secondary"
                                        />
                                        <TextInput
                                            id="cliente_query"
                                            value={clienteQuery}
                                            onChange={handleClienteQueryChange}
                                            onFocus={() => setShowResults(true)}
                                            onBlur={() => setTimeout(() => setShowResults(false), 150)}
                                            className="block min-h-[52px] w-full rounded-full border-brand-border bg-brand-surface pl-11 pr-4 text-base"
                                            placeholder="Ej: Juan Perez"
                                            autoComplete="off"
                                            autoFocus
                                        />
                                    </div>
                                    {showResults && clienteResults.length > 0 && (
                                        <ul className="absolute z-10 mt-2 w-full overflow-hidden rounded-[22px] border border-brand-border bg-brand-surface shadow-brand-card">
                                            {clienteResults.map((cliente) => (
                                                <li key={cliente.id}>
                                                    <button
                                                        type="button"
                                                        onMouseDown={() => selectCliente(cliente)}
                                                        className="flex min-h-[48px] w-full items-center px-4 text-left text-sm text-brand-text transition hover:bg-brand-primary/5"
                                                    >
                                                        {cliente.name}
                                                        {cliente.phone && (
                                                            <span className="ml-2 text-brand-text-secondary">{cliente.phone}</span>
                                                        )}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {!data.cliente_id && data.cliente_nombre && (
                                        <p className="mt-2 text-xs text-brand-text-secondary">
                                            Se va a crear un cliente nuevo: "{data.cliente_nombre}".
                                        </p>
                                    )}
                                    <InputError message={errors.cliente_nombre} className="mt-2" />
                                </div>
                            </SectionBlock>

                            <SectionBlock
                                title="Servicio"
                            >
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                    {servicios.map((servicio) => {
                                        const selected = String(data.servicio_id) === String(servicio.id);

                                        return (
                                            <button
                                                key={servicio.id}
                                                type="button"
                                                onClick={() => selectServicio(servicio.id)}
                                                aria-pressed={selected}
                                                className={`flex min-h-[88px] flex-col items-start justify-center gap-1 rounded-[22px] border px-4 py-4 text-left transition ${
                                                    selected
                                                        ? 'border-brand-primary bg-brand-primary text-brand-on-primary shadow-brand-cta'
                                                        : 'border-brand-border bg-brand-surface text-brand-text hover:border-brand-primary/20 hover:bg-brand-primary/5'
                                                }`}
                                            >
                                                <span className="text-sm font-semibold">{servicio.name}</span>
                                                <span className={selected ? 'text-xs text-brand-on-primary/75' : 'text-xs text-brand-text-secondary'}>
                                                    {`$${formatPrice(servicio.price)}`}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <InputError message={errors.servicio_id} className="mt-2" />
                            </SectionBlock>

                            <SectionBlock
                                title="Medio de pago"
                            >
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                    {mediosPago.map((medio) => {
                                        const selected = String(data.medio_pago_id) === String(medio.id);

                                        return (
                                            <button
                                                key={medio.id}
                                                type="button"
                                                onClick={() => setData('medio_pago_id', String(medio.id))}
                                                aria-pressed={selected}
                                                className={`flex min-h-[64px] items-center justify-center rounded-[22px] border px-4 py-3 text-center text-sm font-semibold transition ${
                                                    selected
                                                        ? 'border-brand-primary bg-brand-primary text-brand-on-primary shadow-brand-cta'
                                                        : 'border-brand-border bg-brand-surface text-brand-text hover:border-brand-primary/20 hover:bg-brand-primary/5'
                                                }`}
                                            >
                                                {medio.name}
                                            </button>
                                        );
                                    })}
                                </div>
                                <InputError message={errors.medio_pago_id} className="mt-2" />
                            </SectionBlock>

                            <div className="grid gap-6 md:grid-cols-2">
                                <SectionBlock title="Precio" description="Puedes mantener el valor del servicio o editarlo si hubo una variacion.">
                                    <InputLabel htmlFor="price" value="Precio final ($) *" />
                                    <TextInput
                                        id="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.price}
                                        onChange={(event) => setData('price', event.target.value)}
                                        className="mt-2 block min-h-[52px] w-full rounded-full border-brand-border bg-brand-surface px-4 text-base"
                                    />
                                    <InputError message={errors.price} className="mt-2" />
                                </SectionBlock>

                                <SectionBlock title="Fecha" description="Define cuando se realizo el corte para que impacte en el dia correcto.">
                                    <InputLabel htmlFor="performed_at" value="Fecha *" />
                                    <TextInput
                                        id="performed_at"
                                        type="date"
                                        value={data.performed_at}
                                        onChange={(event) => setData('performed_at', event.target.value)}
                                        className="mt-2 block min-h-[52px] w-full rounded-full border-brand-border bg-brand-surface px-4 text-base"
                                    />
                                    <InputError message={errors.performed_at} className="mt-2" />
                                </SectionBlock>
                            </div>

                            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-brand-primary px-6 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                >
                                    Cargar corte
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </section>

            <aside className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-semibold tracking-[-0.03em] text-brand-text">
                            Cortes cargados
                        </h3>
                    </div>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-link shadow-sm">
                        <IconReceipt2 size={22} stroke={1.8} />
                    </span>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-[22px] bg-brand-surface-alt px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                            Cantidad
                        </p>
                        <p className="mt-2 text-2xl font-bold text-brand-text">
                            {cortesHoy.length}
                        </p>
                    </div>

                    <div className="rounded-[22px] bg-brand-surface-alt px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                            Total del dia
                        </p>
                        <p className="mt-2 text-2xl font-bold text-brand-success">
                            {`$${formatPrice(totalHoy)}`}
                        </p>
                    </div>
                </div>

                {cortesHoy.length === 0 ? (
                    <div className="mt-5 rounded-[24px] border border-dashed border-brand-border bg-brand-surface-alt p-6 text-center">
                        <p className="text-sm font-medium text-brand-text">
                            Todavia no cargaste cortes hoy
                        </p>
                        <p className="mt-2 text-sm text-brand-text-secondary">
                            Cuando registres el primero, lo veras aqui junto con el total acumulado del dia.
                        </p>
                    </div>
                ) : (
                    <div className="mt-5 space-y-3">
                        {cortesHoy.map((corte) => (
                            <article
                                key={corte.id}
                                className="rounded-[22px] bg-brand-surface-alt px-4 py-4"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <p className="truncate text-sm font-semibold text-brand-text">
                                        {corte.cliente.name}
                                    </p>
                                    <p className="shrink-0 text-sm font-bold text-brand-text">
                                        {`$${formatPrice(corte.price)}`}
                                    </p>
                                </div>
                                <p className="mt-2 text-sm text-brand-text-secondary">
                                    {corte.servicio.name} - {corte.medio_pago.name}
                                </p>
                            </article>
                        ))}
                    </div>
                )}
            </aside>
        </div>
    );
}
