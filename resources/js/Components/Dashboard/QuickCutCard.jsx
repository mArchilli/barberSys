import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import SelectInput from '@/Components/SelectInput';
import TextInput from '@/Components/TextInput';
import { Link, useForm, usePage } from '@inertiajs/react';
import { IconScissors, IconSearch } from '@tabler/icons-react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';

function today() {
    return new Date().toLocaleDateString('sv-SE');
}

export default function QuickCutCard({ servicios, mediosPago, routes }) {
    const { currentBarberia } = usePage().props;
    const faltaServicios = servicios.length === 0;
    const faltaMediosPago = mediosPago.length === 0;
    const faltaCatalogo = faltaServicios || faltaMediosPago;

    const { data, setData, post, processing, errors, reset, recentlySuccessful } = useForm({
        servicio_id: '',
        cliente_id: '',
        cliente_nombre: '',
        medio_pago_id: '',
        price: '',
        performed_at: today(),
        quick_entry: true,
    });

    const [clienteQuery, setClienteQuery] = useState('');
    const [clienteResults, setClienteResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const searchTimeout = useRef(null);

    useEffect(() => () => clearTimeout(searchTimeout.current), []);

    function selectServicio(id) {
        const servicio = servicios.find((item) => String(item.id) === String(id));
        setData('servicio_id', id);

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
        <article data-tour="owner-dashboard-quick-cut" className="min-w-0 rounded-brand-xl border border-brand-border bg-brand-surface p-5 shadow-brand-card sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h3 className="text-xl font-semibold tracking-[-0.03em] text-brand-text">Carga rápida</h3>
                    <p className="mt-2 break-words text-xs text-brand-text-secondary">Registrá un corte sin salir del Dashboard.</p>
                </div>
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-primary shadow-sm">
                    <IconScissors size={22} stroke={1.8} aria-hidden="true" />
                </span>
            </div>

            {faltaCatalogo ? (
                <div className="mt-6 rounded-brand-lg border border-dashed border-brand-border bg-brand-surface-alt p-6 text-center">
                    <p className="text-sm font-semibold text-brand-text">Completá tu catálogo para cargar cortes</p>
                    <p className="mx-auto mt-2 max-w-sm text-xs text-brand-text-secondary">
                        {faltaServicios && faltaMediosPago
                            ? 'Necesitás al menos un servicio y un medio de pago activos.'
                            : faltaServicios
                                ? 'Necesitás al menos un servicio activo.'
                                : 'Necesitás al menos un medio de pago activo.'}
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                        {faltaServicios && (
                            <Link
                                href={route('owner.barberias.servicios.create', currentBarberia.id)}
                                className="inline-flex min-h-[44px] items-center justify-center rounded-brand-pill border border-brand-border bg-brand-surface px-5 text-sm font-semibold text-brand-text transition hover:border-brand-primary/20 hover:bg-brand-primary/5 hover:text-brand-link"
                            >
                                Cargar servicios
                            </Link>
                        )}
                        {faltaMediosPago && (
                            <Link
                                href={route('owner.barberias.medios-pago.create', currentBarberia.id)}
                                className="inline-flex min-h-[44px] items-center justify-center rounded-brand-pill border border-brand-border bg-brand-surface px-5 text-sm font-semibold text-brand-text transition hover:border-brand-primary/20 hover:bg-brand-primary/5 hover:text-brand-link"
                            >
                                Cargar medios de pago
                            </Link>
                        )}
                    </div>
                </div>
            ) : (
                <form onSubmit={submit} className="mt-6 grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_128px_auto] lg:items-end lg:gap-3">
                    <div className="relative min-w-0">
                        <InputLabel htmlFor="quick-cut-cliente" value="Cliente" className="text-brand-text-secondary" />
                        <div className="relative mt-1.5">
                            <IconSearch size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-text-secondary" />
                            <TextInput
                                id="quick-cut-cliente"
                                value={clienteQuery}
                                onChange={handleClienteQueryChange}
                                onFocus={() => setShowResults(true)}
                                onBlur={() => setTimeout(() => setShowResults(false), 150)}
                                className="block min-h-[44px] w-full rounded-brand-lg border-brand-border bg-brand-surface pl-9 pr-3 text-sm"
                                placeholder="Buscar o crear cliente"
                                autoComplete="off"
                            />
                        </div>
                        {showResults && clienteResults.length > 0 && (
                            <ul className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-brand-lg border border-brand-border bg-brand-surface shadow-brand-card">
                                {clienteResults.map((cliente) => (
                                    <li key={cliente.id}>
                                        <button
                                            type="button"
                                            onMouseDown={() => selectCliente(cliente)}
                                            className="flex min-h-[44px] w-full items-center px-4 text-left text-sm text-brand-text transition hover:bg-brand-primary/5"
                                        >
                                            {cliente.name}
                                            {cliente.phone && <span className="ml-2 text-brand-text-secondary">{cliente.phone}</span>}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {! data.cliente_id && data.cliente_nombre && (
                            <p className="mt-1.5 text-xs text-brand-text-secondary">Se va a crear un cliente nuevo: "{data.cliente_nombre}".</p>
                        )}
                        <InputError message={errors.cliente_nombre} className="mt-1.5 text-xs" />
                    </div>

                    <div className="min-w-0">
                        <InputLabel htmlFor="quick-cut-servicio" value="Servicio" className="text-brand-text-secondary" />
                        <SelectInput
                            id="quick-cut-servicio"
                            value={data.servicio_id}
                            onChange={(event) => selectServicio(event.target.value)}
                            className="mt-1.5 block min-h-[44px] w-full rounded-brand-lg border-brand-border bg-brand-surface text-sm"
                        >
                            <option value="">Elegí un servicio</option>
                            {servicios.map((servicio) => (
                                <option key={servicio.id} value={servicio.id}>{servicio.name}</option>
                            ))}
                        </SelectInput>
                        <InputError message={errors.servicio_id} className="mt-1.5 text-xs" />
                    </div>

                    <div className="min-w-0">
                        <InputLabel htmlFor="quick-cut-medio" value="Medio de pago" className="text-brand-text-secondary" />
                        <SelectInput
                            id="quick-cut-medio"
                            value={data.medio_pago_id}
                            onChange={(event) => setData('medio_pago_id', event.target.value)}
                            className="mt-1.5 block min-h-[44px] w-full rounded-brand-lg border-brand-border bg-brand-surface text-sm"
                        >
                            <option value="">Elegí un medio</option>
                            {mediosPago.map((medio) => (
                                <option key={medio.id} value={medio.id}>{medio.name}</option>
                            ))}
                        </SelectInput>
                        <InputError message={errors.medio_pago_id} className="mt-1.5 text-xs" />
                    </div>

                    <div className="min-w-0">
                        <InputLabel htmlFor="quick-cut-price" value="Precio" className="text-brand-text-secondary" />
                        <TextInput
                            id="quick-cut-price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={data.price}
                            onChange={(event) => setData('price', event.target.value)}
                            className="mt-1.5 block min-h-[44px] w-full rounded-brand-lg border-brand-border bg-brand-surface px-3 text-sm"
                        />
                        <InputError message={errors.price} className="mt-1.5 text-xs" />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex min-h-[44px] items-center justify-center rounded-brand-pill bg-brand-primary px-6 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cargar
                    </button>
                </form>
            )}

            {recentlySuccessful && (
                <p role="status" className="mt-4 text-sm font-medium text-brand-success">Corte cargado ✓</p>
            )}
        </article>
    );
}
