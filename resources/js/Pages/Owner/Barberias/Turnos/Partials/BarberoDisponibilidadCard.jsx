import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { useForm } from '@inertiajs/react';

const DIAS = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Lun' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Mié' },
    { value: 4, label: 'Jue' },
    { value: 5, label: 'Vie' },
    { value: 6, label: 'Sáb' },
];

function buildFilas(disponibilidad, horarios) {
    return DIAS.map(({ value }) => {
        const existente = disponibilidad.find((fila) => fila.dia_semana === value);
        const horarioGeneral = horarios.find((horario) => horario.dia_semana === value && horario.activo);

        return {
            dia_semana: value,
            activo: Boolean(existente),
            hora_inicio: existente?.hora_inicio ?? horarioGeneral?.hora_inicio ?? '09:00',
            hora_fin: existente?.hora_fin ?? horarioGeneral?.hora_fin ?? '18:00',
        };
    });
}

export default function BarberoDisponibilidadCard({ barbero, horarios, barbId }) {
    const { data, setData, put, processing, errors, transform } = useForm({
        disponibilidad: buildFilas(barbero.disponibilidad, horarios),
    });

    // Solo se manda al servidor la disponibilidad de los días marcados como
    // activos: los inactivos quedan en el estado local para no perder los
    // horarios cargados si el owner los vuelve a tildar más tarde.
    transform((formData) => ({
        disponibilidad: formData.disponibilidad.filter((fila) => fila.activo),
    }));

    function updateFila(index, campo, valor) {
        setData('disponibilidad', data.disponibilidad.map((fila, i) => (i === index ? { ...fila, [campo]: valor } : fila)));
    }

    function submit(e) {
        e.preventDefault();
        put(route('owner.barberias.turnos.configuracion.barberos.disponibilidad.update', {
            barberia: barbId,
            barbero: barbero.id,
        }));
    }

    return (
        <div className="rounded-[22px] bg-brand-surface-alt p-4 sm:p-5">
            <h4 className="font-display text-base font-bold text-brand-text">{barbero.name}</h4>

            <form onSubmit={submit} className="mt-4 space-y-2">
                {data.disponibilidad.map((fila, index) => {
                    const horarioGeneral = horarios.find((horario) => horario.dia_semana === fila.dia_semana && horario.activo);
                    const barberiaAtiendeEseDia = Boolean(horarioGeneral);

                    // El transform() de abajo filtra los días inactivos antes de
                    // enviar, así que el índice que valida el servidor es la
                    // posición dentro del array YA filtrado, no el índice de
                    // este array completo (7 días) — hay que recalcularlo para
                    // poder mapear el error de vuelta a la fila correcta.
                    const submittedIndex = data.disponibilidad
                        .slice(0, index + 1)
                        .filter((f) => f.activo).length - 1;
                    const errorKey = fila.activo ? `disponibilidad.${submittedIndex}.hora_inicio` : null;

                    return (
                        <div
                            key={fila.dia_semana}
                            className="flex flex-col gap-2 rounded-[16px] bg-brand-surface p-3 sm:flex-row sm:items-center sm:gap-4"
                        >
                            <label className="flex min-h-[40px] min-w-[90px] cursor-pointer items-center gap-2">
                                <Checkbox
                                    checked={fila.activo}
                                    disabled={!barberiaAtiendeEseDia}
                                    onChange={(e) => updateFila(index, 'activo', e.target.checked)}
                                />
                                <span className="text-sm font-medium text-brand-text">{DIAS[index].label}</span>
                            </label>

                            {barberiaAtiendeEseDia ? (
                                <div className="flex flex-1 items-center gap-2">
                                    <input
                                        type="time"
                                        value={fila.hora_inicio}
                                        disabled={!fila.activo}
                                        min={horarioGeneral.hora_inicio}
                                        max={horarioGeneral.hora_fin}
                                        onChange={(e) => updateFila(index, 'hora_inicio', e.target.value)}
                                        className="min-h-[40px] w-full rounded-full border border-brand-border bg-brand-surface px-3 text-sm text-brand-text disabled:opacity-50"
                                    />
                                    <span className="text-xs text-brand-text-secondary">a</span>
                                    <input
                                        type="time"
                                        value={fila.hora_fin}
                                        disabled={!fila.activo}
                                        min={horarioGeneral.hora_inicio}
                                        max={horarioGeneral.hora_fin}
                                        onChange={(e) => updateFila(index, 'hora_fin', e.target.value)}
                                        className="min-h-[40px] w-full rounded-full border border-brand-border bg-brand-surface px-3 text-sm text-brand-text disabled:opacity-50"
                                    />
                                </div>
                            ) : (
                                <p className="text-xs text-brand-text-secondary">La barbería no atiende este día.</p>
                            )}

                            <InputError message={errorKey ? errors[errorKey] : undefined} className="sm:basis-full" />
                        </div>
                    );
                })}

                <InputError message={errors.disponibilidad} className="mt-1" />

                <div className="flex justify-end pt-1">
                    <PrimaryButton disabled={processing} className="px-4 py-2 text-[11px]">
                        Guardar disponibilidad
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}
