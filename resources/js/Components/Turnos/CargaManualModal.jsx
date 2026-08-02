import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import SelectInput from '@/Components/SelectInput';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { IconAlertCircle, IconLoader2 } from '@tabler/icons-react';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function CargaManualModal({ show, onClose, barberiaId, servicios, barberos, fechaInicial }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        servicio_id: '',
        barbero_id: '',
        fecha: fechaInicial,
        hora_inicio: '',
        cliente_nombre: '',
        cliente_telefono: '',
    });

    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotsError, setSlotsError] = useState(null);

    useEffect(() => {
        if (show) {
            setData('fecha', fechaInicial);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [show]);

    useEffect(() => {
        if (!data.servicio_id || !data.barbero_id || !data.fecha) {
            setSlots([]);
            return;
        }

        let active = true;
        setLoadingSlots(true);
        setSlotsError(null);

        axios.get(route('owner.barberias.turnos.slots', barberiaId), {
            params: { servicio_id: data.servicio_id, barbero_id: data.barbero_id, fecha: data.fecha },
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
    }, [data.servicio_id, data.barbero_id, data.fecha, barberiaId]);

    function close() {
        reset();
        setSlots([]);
        onClose();
    }

    function submit(event) {
        event.preventDefault();
        post(route('owner.barberias.turnos.store', barberiaId), {
            preserveScroll: true,
            onSuccess: () => close(),
        });
    }

    return (
        <Modal show={show} onClose={close} maxWidth="lg">
            <form onSubmit={submit} className="p-6 sm:p-7">
                <h3 className="font-display text-lg font-bold text-brand-text">Carga manual de turno</h3>
                <p className="mt-1 text-sm text-brand-text-secondary">
                    Para clientes que coordinan por WhatsApp o teléfono en vez de la reserva pública.
                </p>

                <div className="mt-6 space-y-5">
                    <div>
                        <InputLabel htmlFor="turno_servicio" value="Servicio *" />
                        <SelectInput
                            id="turno_servicio"
                            className="mt-2 block min-h-[48px] w-full rounded-full"
                            value={data.servicio_id}
                            onChange={(e) => {
                                setData('servicio_id', e.target.value);
                                setData('hora_inicio', '');
                            }}
                        >
                            <option value="">Elegí un servicio</option>
                            {servicios.map((servicio) => (
                                <option key={servicio.id} value={servicio.id}>
                                    {servicio.name} ({servicio.duration_minutes} min)
                                </option>
                            ))}
                        </SelectInput>
                        <InputError message={errors.servicio_id} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="turno_barbero" value="Barbero *" />
                        <SelectInput
                            id="turno_barbero"
                            className="mt-2 block min-h-[48px] w-full rounded-full"
                            value={data.barbero_id}
                            onChange={(e) => {
                                setData('barbero_id', e.target.value);
                                setData('hora_inicio', '');
                            }}
                        >
                            <option value="">Elegí un barbero</option>
                            {barberos.map((barbero) => (
                                <option key={barbero.id} value={barbero.id}>{barbero.name}</option>
                            ))}
                        </SelectInput>
                        <InputError message={errors.barbero_id} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="turno_fecha" value="Fecha *" />
                        <TextInput
                            id="turno_fecha"
                            type="date"
                            value={data.fecha}
                            onChange={(e) => {
                                setData('fecha', e.target.value);
                                setData('hora_inicio', '');
                            }}
                            className="mt-2 block min-h-[48px] w-full rounded-full border-brand-border bg-brand-surface px-4 text-sm"
                        />
                        <InputError message={errors.fecha} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel value="Horario disponible *" />
                        {!data.servicio_id || !data.barbero_id ? (
                            <p className="mt-2 text-xs text-brand-text-secondary">
                                Elegí servicio y barbero para ver los horarios libres.
                            </p>
                        ) : loadingSlots ? (
                            <p className="mt-2 flex items-center gap-2 text-xs text-brand-text-secondary">
                                <IconLoader2 size={14} className="animate-spin" /> Buscando horarios libres...
                            </p>
                        ) : slotsError ? (
                            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-brand-danger">
                                <IconAlertCircle size={14} /> {slotsError}
                            </p>
                        ) : slots.length === 0 ? (
                            <p className="mt-2 text-xs text-brand-text-secondary">
                                No hay horarios libres para esa combinación.
                            </p>
                        ) : (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {slots.map((slot) => {
                                    const selected = data.hora_inicio === slot.hora_inicio;

                                    return (
                                        <button
                                            key={slot.hora_inicio}
                                            type="button"
                                            onClick={() => setData('hora_inicio', slot.hora_inicio)}
                                            className={`min-h-[40px] rounded-full border px-4 text-sm font-semibold transition ${
                                                selected
                                                    ? 'border-brand-primary bg-brand-primary text-brand-on-primary'
                                                    : 'border-brand-border bg-brand-surface-alt text-brand-text hover:border-brand-primary/20'
                                            }`}
                                        >
                                            {slot.hora_inicio}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        <InputError message={errors.hora_inicio} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="turno_cliente_nombre" value="Cliente *" />
                        <TextInput
                            id="turno_cliente_nombre"
                            value={data.cliente_nombre}
                            onChange={(e) => setData('cliente_nombre', e.target.value)}
                            className="mt-2 block min-h-[48px] w-full rounded-full border-brand-border bg-brand-surface px-4 text-sm"
                            placeholder="Nombre y apellido"
                        />
                        <InputError message={errors.cliente_nombre} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="turno_cliente_telefono" value="Teléfono *" />
                        <TextInput
                            id="turno_cliente_telefono"
                            value={data.cliente_telefono}
                            onChange={(e) => setData('cliente_telefono', e.target.value)}
                            className="mt-2 block min-h-[48px] w-full rounded-full border-brand-border bg-brand-surface px-4 text-sm"
                            placeholder="Ej: 1122334455"
                        />
                        <InputError message={errors.cliente_telefono} className="mt-1" />
                    </div>
                </div>

                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <SecondaryButton type="button" onClick={close}>Cancelar</SecondaryButton>
                    <button
                        type="submit"
                        disabled={processing || !data.hora_inicio}
                        className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-brand-primary px-6 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cargar turno
                    </button>
                </div>
            </form>
        </Modal>
    );
}
