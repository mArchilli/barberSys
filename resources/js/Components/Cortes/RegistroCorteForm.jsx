import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';
import TextInput from '@/Components/TextInput';
import { useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

function today() {
    return new Date().toLocaleDateString('sv-SE');
}

function formatPrice(price) {
    return Number(price).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function RegistroCorteForm({ servicios, mediosPago, cortesHoy, routes }) {
    const { flash } = usePage().props;

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

    function handleServicioChange(e) {
        const id = e.target.value;
        const servicio = servicios.find((s) => String(s.id) === id);
        setData('servicio_id', id);
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
            <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-card">
                <div className="p-4 sm:p-6">
                    {flash?.success && (
                        <div className="mb-4 rounded-xl border border-brand-success/30 bg-brand-success/10 p-4 text-sm text-brand-success">
                            {flash.success}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5">
                        <div>
                            <InputLabel htmlFor="servicio_id" value="Servicio *" />
                            <SelectInput
                                id="servicio_id"
                                value={data.servicio_id}
                                onChange={handleServicioChange}
                                className="mt-1 block w-full min-h-[48px] text-base"
                                autoFocus
                            >
                                <option value="">Elegí un servicio…</option>
                                {servicios.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError message={errors.servicio_id} className="mt-1" />
                        </div>

                        <div className="relative">
                            <InputLabel htmlFor="cliente_query" value="Cliente *" />
                            <TextInput
                                id="cliente_query"
                                value={clienteQuery}
                                onChange={handleClienteQueryChange}
                                onFocus={() => setShowResults(true)}
                                onBlur={() => setTimeout(() => setShowResults(false), 150)}
                                className="mt-1 block min-h-[48px] w-full text-base"
                                placeholder="Buscar o escribir nombre nuevo…"
                                autoComplete="off"
                            />
                            {showResults && clienteResults.length > 0 && (
                                <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-brand-border bg-brand-surface shadow-card">
                                    {clienteResults.map((c) => (
                                        <li key={c.id}>
                                            <button
                                                type="button"
                                                onMouseDown={() => selectCliente(c)}
                                                className="flex min-h-[44px] w-full items-center px-4 text-left text-sm text-brand-text hover:bg-brand-accent-soft"
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
                            <InputLabel htmlFor="medio_pago_id" value="Medio de pago *" />
                            <SelectInput
                                id="medio_pago_id"
                                value={data.medio_pago_id}
                                onChange={(e) => setData('medio_pago_id', e.target.value)}
                                className="mt-1 block w-full min-h-[48px] text-base"
                            >
                                <option value="">Elegí un medio de pago…</option>
                                {mediosPago.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.name}
                                    </option>
                                ))}
                            </SelectInput>
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
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-card">
                <div className="border-b border-brand-border px-4 py-3">
                    <h3 className="text-sm font-semibold text-brand-text">Hoy cargaste</h3>
                </div>
                {cortesHoy.length === 0 ? (
                    <p className="p-4 text-sm text-brand-text-secondary">
                        Todavía no cargaste ningún corte hoy.
                    </p>
                ) : (
                    <ul className="divide-y divide-brand-border">
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
