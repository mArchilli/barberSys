import InputError from '@/Components/InputError';
import { Head } from '@inertiajs/react';
import {
    IconAlertCircle,
    IconArrowLeft,
    IconBrandWhatsapp,
    IconCalendarOff,
    IconCheck,
    IconChevronRight,
    IconLoader2,
    IconUsers,
} from '@tabler/icons-react';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

function formatPrice(price) {
    const n = Number(price);
    if (!Number.isFinite(n)) return '';
    return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
}

function todayISO() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
}

function formatFechaLegible(fechaISO) {
    const [y, m, d] = fechaISO.split('-').map(Number);
    return new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(y, m - 1, d));
}

function buildWhatsappMessage(barberiaName, turno) {
    const lines = [
        `Hola! Quiero confirmar un turno en ${barberiaName}.`,
        `Servicio: ${turno.servicio}.`,
        `Fecha: ${formatFechaLegible(turno.fecha)} a las ${turno.hora_inicio}hs.`,
        turno.barbero ? `Barbero: ${turno.barbero}.` : null,
    ].filter((line) => line !== null);

    return lines.join('\n');
}

const PASOS = ['Servicio', 'Barbero', 'Horario', 'Tus datos'];

export default function Turno({ barberia, slug, disponible, servicios, barberos }) {
    if (!disponible) {
        return <EstadoNoDisponible barberiaName={barberia.name} />;
    }

    const [step, setStep] = useState(0);
    const [servicioId, setServicioId] = useState(null);
    const [barberoId, setBarberoId] = useState(undefined); // undefined = sin elegir, null = "cualquiera"
    const [fecha, setFecha] = useState(todayISO());
    const [horaInicio, setHoraInicio] = useState(null);
    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotsError, setSlotsError] = useState(null);
    const [clienteNombre, setClienteNombre] = useState('');
    const [clienteTelefono, setClienteTelefono] = useState('');
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [resultado, setResultado] = useState(null);

    const servicio = servicios.find((s) => s.id === servicioId) ?? null;
    const barbero = barberoId ? barberos.find((b) => b.id === barberoId) ?? null : null;

    const fetchSlots = useCallback(() => {
        if (!servicioId || barberoId === undefined || !fecha) {
            setSlots([]);
            return;
        }

        let active = true;
        setLoadingSlots(true);
        setSlotsError(null);

        axios
            .get(route('public.turno.slots', slug), {
                params: { servicio_id: servicioId, fecha, ...(barberoId ? { barbero_id: barberoId } : {}) },
            })
            .then((response) => {
                if (active) setSlots(response.data);
            })
            .catch(() => {
                if (active) {
                    setSlotsError('No pudimos cargar los horarios disponibles.');
                    setSlots([]);
                }
            })
            .finally(() => {
                if (active) setLoadingSlots(false);
            });

        return () => {
            active = false;
        };
    }, [servicioId, barberoId, fecha, slug]);

    useEffect(() => {
        setHoraInicio(null);
        const cleanup = fetchSlots();
        return cleanup;
    }, [fetchSlots]);

    function elegirServicio(id) {
        setServicioId(id);
        setStep(1);
    }

    function elegirBarbero(id) {
        setBarberoId(id);
        setStep(2);
    }

    function elegirHorario(hora) {
        setHoraInicio(hora);
        setStep(3);
    }

    const puedeConfirmar =
        servicioId && barberoId !== undefined && horaInicio && clienteNombre.trim() && clienteTelefono.trim();

    function confirmar(e) {
        e.preventDefault();

        if (!puedeConfirmar || submitting) return;

        setSubmitting(true);
        setErrors({});

        axios
            .post(route('public.turno.store', slug), {
                servicio_id: servicioId,
                barbero_id: barberoId,
                fecha,
                hora_inicio: horaInicio,
                cliente_nombre: clienteNombre,
                cliente_telefono: clienteTelefono,
            })
            .then((response) => {
                setResultado(response.data.turno);
            })
            .catch((err) => {
                const fieldErrors = err.response?.data?.errors ?? {};
                setErrors(fieldErrors);

                // El horario se acaba de ocupar: volvemos al paso de horario y
                // refrescamos los slots para que el cliente vea el estado real.
                if (fieldErrors.hora_inicio) {
                    setHoraInicio(null);
                    setStep(2);
                    fetchSlots();
                }
            })
            .finally(() => setSubmitting(false));
    }

    if (resultado) {
        return <Confirmacion barberia={barberia} turno={resultado} />;
    }

    return (
        <div className="min-h-screen bg-brand-bg px-4 py-8 sm:py-12">
            <Head title={`Reservá en ${barberia.name}`} />

            <div className="mx-auto max-w-lg">
                <header className="mb-6 text-center">
                    <h1 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-brand-text sm:text-3xl">
                        {barberia.name}
                    </h1>
                    <p className="mt-1 text-sm text-brand-text-secondary">Reservá tu turno online</p>
                </header>

                <ol className="mb-6 flex items-center justify-center gap-1.5">
                    {PASOS.map((label, i) => (
                        <li key={label} className="flex items-center gap-1.5">
                            <span
                                className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-bold transition ${
                                    i === step
                                        ? 'bg-brand-primary text-brand-on-primary'
                                        : i < step
                                          ? 'bg-brand-primary-soft text-brand-primary'
                                          : 'bg-brand-surface-alt text-brand-text-secondary'
                                }`}
                            >
                                {i < step ? <IconCheck size={14} stroke={2.5} /> : i + 1}
                            </span>
                            {i < PASOS.length - 1 && <span className="h-px w-4 bg-brand-border" />}
                        </li>
                    ))}
                </ol>

                <div className="rounded-brand-xl border border-brand-border bg-brand-surface p-5 shadow-brand-card sm:p-7">
                    {step > 0 && (
                        <button
                            type="button"
                            onClick={() => setStep((s) => Math.max(0, s - 1))}
                            className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-text-secondary hover:text-brand-text"
                        >
                            <IconArrowLeft size={16} stroke={2.2} /> Volver
                        </button>
                    )}

                    {step === 0 && (
                        <PasoServicio servicios={servicios} servicioId={servicioId} onElegir={elegirServicio} />
                    )}

                    {step === 1 && (
                        <PasoBarbero barberos={barberos} barberoId={barberoId} onElegir={elegirBarbero} />
                    )}

                    {step === 2 && (
                        <PasoHorario
                            fecha={fecha}
                            onFechaChange={setFecha}
                            slots={slots}
                            loading={loadingSlots}
                            error={slotsError}
                            horaInicio={horaInicio}
                            onElegir={elegirHorario}
                        />
                    )}

                    {step === 3 && (
                        <form onSubmit={confirmar} className="space-y-5">
                            <div>
                                <h2 className="font-display text-lg font-bold text-brand-text">Tus datos</h2>
                                <p className="mt-1 text-sm text-brand-text-secondary">
                                    {servicio?.name} · {formatFechaLegible(fecha)} · {horaInicio}hs
                                    {barbero ? ` · ${barbero.name}` : ''}
                                </p>
                            </div>

                            <div>
                                <label htmlFor="cliente_nombre" className="block text-sm font-medium text-brand-text">
                                    Nombre y apellido *
                                </label>
                                <input
                                    id="cliente_nombre"
                                    type="text"
                                    value={clienteNombre}
                                    onChange={(e) => setClienteNombre(e.target.value)}
                                    placeholder="Ej: Juan Pérez"
                                    className="mt-2 block min-h-[48px] w-full rounded-full border-brand-border bg-brand-surface px-4 text-sm text-brand-text shadow-sm focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
                                />
                                <InputError message={errors.cliente_nombre?.[0]} className="mt-1" />
                            </div>

                            <div>
                                <label htmlFor="cliente_telefono" className="block text-sm font-medium text-brand-text">
                                    Teléfono *
                                </label>
                                <input
                                    id="cliente_telefono"
                                    type="tel"
                                    value={clienteTelefono}
                                    onChange={(e) => setClienteTelefono(e.target.value)}
                                    placeholder="Ej: 1122334455"
                                    className="mt-2 block min-h-[48px] w-full rounded-full border-brand-border bg-brand-surface px-4 text-sm text-brand-text shadow-sm focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
                                />
                                <InputError message={errors.cliente_telefono?.[0]} className="mt-1" />
                            </div>

                            <InputError message={errors.hora_inicio?.[0]} />

                            <button
                                type="submit"
                                disabled={!puedeConfirmar || submitting}
                                className="inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-brand-pill bg-brand-primary px-6 text-sm font-bold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {submitting ? <IconLoader2 size={18} className="animate-spin" /> : <IconCheck size={18} stroke={2.2} />}
                                Confirmar reserva
                            </button>
                        </form>
                    )}
                </div>

                <p className="mt-6 text-center text-xs text-brand-text-secondary/70">Reservas gestionadas con Estilus Barber</p>
            </div>
        </div>
    );
}

function PasoServicio({ servicios, servicioId, onElegir }) {
    if (servicios.length === 0) {
        return (
            <p className="text-sm text-brand-text-secondary">
                Esta barbería todavía no cargó servicios disponibles para reservar online.
            </p>
        );
    }

    return (
        <div>
            <h2 className="font-display text-lg font-bold text-brand-text">Elegí un servicio</h2>
            <div className="mt-4 space-y-2.5">
                {servicios.map((s) => (
                    <button
                        key={s.id}
                        type="button"
                        onClick={() => onElegir(s.id)}
                        className={`flex w-full min-h-[56px] items-center justify-between rounded-brand-lg border px-4 py-3 text-left transition ${
                            servicioId === s.id
                                ? 'border-brand-primary bg-brand-primary-soft'
                                : 'border-brand-border bg-brand-surface-alt hover:border-brand-primary/30'
                        }`}
                    >
                        <span>
                            <span className="block text-sm font-semibold text-brand-text">{s.name}</span>
                            <span className="block text-xs text-brand-text-secondary">{s.duration_minutes} min</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-sm font-bold text-brand-text">
                            {formatPrice(s.price)}
                            <IconChevronRight size={16} stroke={2.2} className="text-brand-text-secondary" />
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function PasoBarbero({ barberos, barberoId, onElegir }) {
    return (
        <div>
            <h2 className="font-display text-lg font-bold text-brand-text">Elegí un barbero</h2>
            <div className="mt-4 space-y-2.5">
                <button
                    type="button"
                    onClick={() => onElegir(null)}
                    className={`flex w-full min-h-[56px] items-center gap-3 rounded-brand-lg border px-4 py-3 text-left transition ${
                        barberoId === null
                            ? 'border-brand-primary bg-brand-primary-soft'
                            : 'border-brand-border bg-brand-surface-alt hover:border-brand-primary/30'
                    }`}
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary/15 text-brand-primary">
                        <IconUsers size={18} stroke={2} />
                    </span>
                    <span>
                        <span className="block text-sm font-semibold text-brand-text">Cualquiera disponible</span>
                        <span className="block text-xs text-brand-text-secondary">Te asignamos el primero libre en el horario que elijas</span>
                    </span>
                </button>

                {barberos.map((b) => (
                    <button
                        key={b.id}
                        type="button"
                        onClick={() => onElegir(b.id)}
                        className={`flex w-full min-h-[56px] items-center rounded-brand-lg border px-4 py-3 text-left transition ${
                            barberoId === b.id
                                ? 'border-brand-primary bg-brand-primary-soft'
                                : 'border-brand-border bg-brand-surface-alt hover:border-brand-primary/30'
                        }`}
                    >
                        <span className="text-sm font-semibold text-brand-text">{b.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function PasoHorario({ fecha, onFechaChange, slots, loading, error, horaInicio, onElegir }) {
    return (
        <div>
            <h2 className="font-display text-lg font-bold text-brand-text">Elegí fecha y horario</h2>

            <input
                type="date"
                value={fecha}
                min={todayISO()}
                onChange={(e) => onFechaChange(e.target.value)}
                className="mt-4 block min-h-[48px] w-full rounded-full border-brand-border bg-brand-surface px-4 text-sm text-brand-text shadow-sm focus:border-brand-primary focus:outline-none focus:ring-4 focus:ring-brand-primary/10"
            />

            <div className="mt-4">
                {loading ? (
                    <p className="flex items-center gap-2 text-sm text-brand-text-secondary">
                        <IconLoader2 size={16} className="animate-spin" /> Buscando horarios libres...
                    </p>
                ) : error ? (
                    <p className="flex items-center gap-1.5 text-sm font-medium text-brand-danger">
                        <IconAlertCircle size={16} /> {error}
                    </p>
                ) : slots.length === 0 ? (
                    <p className="text-sm text-brand-text-secondary">
                        No hay horarios libres ese día. Probá con otra fecha.
                    </p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {slots.map((slot) => (
                            <button
                                key={slot.hora_inicio}
                                type="button"
                                onClick={() => onElegir(slot.hora_inicio)}
                                className={`min-h-[44px] rounded-full border px-4 text-sm font-semibold transition ${
                                    horaInicio === slot.hora_inicio
                                        ? 'border-brand-primary bg-brand-primary text-brand-on-primary'
                                        : 'border-brand-border bg-brand-surface-alt text-brand-text hover:border-brand-primary/30'
                                }`}
                            >
                                {slot.hora_inicio}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function Confirmacion({ barberia, turno }) {
    const [redirected, setRedirected] = useState(false);
    const waUrl = barberia.whatsapp_number
        ? `https://wa.me/${barberia.whatsapp_number}?text=${encodeURIComponent(buildWhatsappMessage(barberia.name, turno))}`
        : null;

    useEffect(() => {
        if (waUrl && !redirected) {
            setRedirected(true);
            window.location.href = waUrl;
        }
    }, [waUrl, redirected]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-brand-bg px-4 py-12">
            <Head title="Turno reservado" />

            <div className="w-full max-w-md rounded-brand-xl border border-brand-border bg-brand-surface p-7 text-center shadow-brand-floating sm:p-9">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-success-soft text-brand-success">
                    <IconCheck size={28} stroke={2.4} />
                </span>

                <h1 className="mt-4 font-display text-xl font-bold text-brand-text">¡Turno reservado!</h1>
                <p className="mt-2 text-sm leading-6 text-brand-text-secondary">
                    {turno.servicio} el {formatFechaLegible(turno.fecha)} a las {turno.hora_inicio}hs
                    {turno.barbero ? ` con ${turno.barbero}` : ''}.
                </p>

                {waUrl ? (
                    <>
                        <p className="mt-4 text-sm text-brand-text-secondary">
                            Te estamos redirigiendo a WhatsApp para confirmar con {barberia.name}.
                        </p>
                        <a
                            href={waUrl}
                            className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-brand-pill bg-brand-primary px-6 text-sm font-bold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover"
                        >
                            <IconBrandWhatsapp size={20} stroke={2.1} />
                            Abrir WhatsApp
                        </a>
                    </>
                ) : (
                    <p className="mt-4 text-sm text-brand-text-secondary">
                        Guardá la fecha y el horario: la barbería se va a contactar para confirmar tu turno.
                    </p>
                )}
            </div>
        </div>
    );
}

function EstadoNoDisponible({ barberiaName }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-brand-bg px-4 py-12">
            <Head title={barberiaName} />

            <div className="w-full max-w-md rounded-brand-xl border border-brand-border bg-brand-surface p-7 text-center shadow-brand-card sm:p-9">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-surface-alt text-brand-text-secondary">
                    <IconCalendarOff size={26} stroke={1.9} />
                </span>
                <h1 className="mt-4 font-display text-lg font-bold text-brand-text">{barberiaName}</h1>
                <p className="mt-2 text-sm leading-6 text-brand-text-secondary">
                    Esta barbería no toma reservas online por ahora. Contactala directamente para coordinar tu turno.
                </p>
            </div>
        </div>
    );
}
