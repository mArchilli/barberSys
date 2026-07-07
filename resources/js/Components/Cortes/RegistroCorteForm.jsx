import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Link, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

function today() {
    return new Date().toLocaleDateString('sv-SE');
}

function formatPrice(price) {
    return Number(price).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function RegistroCorteForm({ servicios, mediosPago, cortesHoy, routes }) {
    const { flash, auth, currentBarberia } = usePage().props;
    const faltaServicios = servicios.length === 0;
    const faltaMediosPago = mediosPago.length === 0;
    const faltaCatalogo = faltaServicios || faltaMediosPago;
    const puedeCargarCatalogo = auth.user.role === 'owner' && currentBarberia;

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

    useEffect(() => {
        return () => clearTimeout(searchTimeout.current);
    }, []);

    function selectServicio(id) {
        const servicio = servicios.find((s) => String(s.id) === String(id));
        setData('servicio_id', String(id));
        if (servicio) {
            setData('price', String(servicio.price));
        }
    }

    function handleClienteQueryChange(e) {
        const value = e.target.value;
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
                const res = await axios.get(routes.search, { params: { q: value.trim() } });
                setClienteResults(res.data);
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

    function submit(e) {
        e.preventDefault();
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
        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
            <div className="overflow-hidden rounded-brand-xl border border-brand-border bg-brand-surface shadow-brand-card">
                <div className="p-4 sm:p-6">
                    {flash?.success && (
                        <div className="mb-4 rounded-brand-md border border-brand-success/30 bg-brand-success/10 p-4 text-sm text-brand-success">
                            {flash.success}
                        </div>
                    )}

                    {faltaCatalogo ? (
                        <div className="rounded-brand-md border border-dashed border-brand-border bg-brand-surface-alt p-6 text-center text-sm text-brand-text-secondary">
                            <p>
                                Todavía falta cargar{' '}
                                {faltaServicios && faltaMediosPago
                                    ? 'servicios y medios de pago'
                                    : faltaServicios
                                        ? 'servicios'
                                        : 'medios de pago'}{' '}
                                para poder registrar cortes en esta barbería.
                            </p>
                            {puedeCargarCatalogo && (
                                <div className="mt-3 flex flex-wrap justify-center gap-4">
                                    {faltaServicios && (
                                        <Link
                                            href={route('owner.barberias.servicios.create', currentBarberia.id)}
                                            className="font-medium text-brand-link hover:underline"
                                        >
                                            Cargar servicios
                                        </Link>
                                    )}
                                    {faltaMediosPago && (
                                        <Link
                                            href={route('owner.barberias.medios-pago.create', currentBarberia.id)}
                                            className="font-medium text-brand-link hover:underline"
                                        >
                                            Cargar medios de pago
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                    <form onSubmit={submit} className="space-y-5">
                        <div className="relative">
                            <InputLabel htmlFor="cliente_query" value="Cliente * — Nombre y apellido" />
                            <TextInput
                                id="cliente_query"
                                value={clienteQuery}
                                onChange={handleClienteQueryChange}
                                onFocus={() => setShowResults(true)}
                                onBlur={() => setTimeout(() => setShowResults(false), 150)}
                                className="mt-1 block min-h-[48px] w-full text-base"
                                placeholder="Ej: Juan Pérez"
                                autoComplete="off"
                                autoFocus
                            />
                            {showResults && clienteResults.length > 0 && (
                                <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-brand-md border border-brand-border bg-brand-surface shadow-brand-card">
                                    {clienteResults.map((c) => (
                                        <li key={c.id}>
                                            <button
                                                type="button"
                                                onMouseDown={() => selectCliente(c)}
                                                className="flex min-h-[44px] w-full items-center px-4 text-left text-sm text-brand-text hover:bg-brand-primary-soft"
                                            >
                                                {c.name}
                                                {c.phone && (
                                                    <span className="ml-2 text-brand-text-secondary">{c.phone}</span>
                                                )}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {! data.cliente_id && data.cliente_nombre && (
                                <p className="mt-1 text-xs text-brand-text-secondary">
                                    Se va a crear un cliente nuevo: "{data.cliente_nombre}".
                                </p>
                            )}
                            <InputError message={errors.cliente_nombre} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel value="Servicio *" />
                            <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                                {servicios.map((s) => {
                                    const selected = String(data.servicio_id) === String(s.id);
                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => selectServicio(s.id)}
                                            aria-pressed={selected}
                                            className={`flex min-h-[64px] flex-col items-start justify-center gap-0.5 rounded-brand-md border px-4 py-3 text-left transition-colors ${
                                                selected
                                                    ? 'border-brand-primary bg-brand-primary text-brand-on-primary shadow-brand-cta'
                                                    : 'border-brand-border bg-brand-surface text-brand-text hover:border-brand-primary-muted hover:bg-brand-primary-soft'
                                            }`}
                                        >
                                            <span className="text-sm font-semibold">{s.name}</span>
                                            <span className={selected ? 'text-xs text-brand-on-primary/70' : 'text-xs text-brand-text-secondary'}>
                                                ${formatPrice(s.price)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <InputError message={errors.servicio_id} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel value="Medio de pago *" />
                            <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                                {mediosPago.map((m) => {
                                    const selected = String(data.medio_pago_id) === String(m.id);
                                    return (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => setData('medio_pago_id', String(m.id))}
                                            aria-pressed={selected}
                                            className={`flex min-h-[56px] items-center justify-center rounded-brand-md border px-4 py-3 text-center text-sm font-semibold transition-colors ${
                                                selected
                                                    ? 'border-brand-primary bg-brand-primary text-brand-on-primary shadow-brand-cta'
                                                    : 'border-brand-border bg-brand-surface text-brand-text hover:border-brand-primary-muted hover:bg-brand-primary-soft'
                                            }`}
                                        >
                                            {m.name}
                                        </button>
                                    );
                                })}
                            </div>
                            <InputError message={errors.medio_pago_id} className="mt-1" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="price" value="Precio ($) *" />
                                <TextInput
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    className="mt-1 block min-h-[48px] w-full text-base"
                                />
                                <InputError message={errors.price} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel htmlFor="performed_at" value="Fecha *" />
                                <TextInput
                                    id="performed_at"
                                    type="date"
                                    value={data.performed_at}
                                    onChange={(e) => setData('performed_at', e.target.value)}
                                    className="mt-1 block min-h-[48px] w-full text-base"
                                />
                                <InputError message={errors.performed_at} className="mt-1" />
                            </div>
                        </div>

                        <PrimaryButton disabled={processing} className="min-h-[48px] w-full justify-center text-sm">
                            Cargar corte
                        </PrimaryButton>
                    </form>
                    )}
                </div>
            </div>

            <div className="overflow-hidden rounded-brand-xl border border-brand-border bg-brand-surface shadow-brand-card">
                <div className="border-b border-brand-border-subtle px-4 py-3">
                    <h3 className="font-display text-base font-bold text-brand-text">Hoy cargaste</h3>
                </div>
                {cortesHoy.length === 0 ? (
                    <p className="p-4 text-sm text-brand-text-secondary">
                        Todavía no cargaste ningún corte hoy.
                    </p>
                ) : (
                    <ul className="divide-y divide-brand-border-subtle">
                        {cortesHoy.map((c) => (
                            <li key={c.id} className="px-4 py-3">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="truncate font-medium text-brand-text">{c.cliente.name}</p>
                                    <p className="shrink-0 font-semibold text-brand-text">${formatPrice(c.price)}</p>
                                </div>
                                <p className="mt-0.5 text-sm text-brand-text-secondary">
                                    {c.servicio.name} · {c.medio_pago.name}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
