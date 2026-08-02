import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { useForm } from '@inertiajs/react';

const DIAS = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
];

function buildFilas(horarios) {
    return DIAS.map(({ value }) => {
        const existente = horarios.find((horario) => horario.dia_semana === value);

        return existente
            ? { dia_semana: value, hora_inicio: existente.hora_inicio, hora_fin: existente.hora_fin, activo: existente.activo }
            : { dia_semana: value, hora_inicio: '09:00', hora_fin: '18:00', activo: false };
    });
}

export default function HorariosAtencionCard({ horarios, barbId }) {
    const { data, setData, put, processing, errors } = useForm({
        horarios: buildFilas(horarios),
    });

    function updateFila(index, campo, valor) {
        setData('horarios', data.horarios.map((fila, i) => (i === index ? { ...fila, [campo]: valor } : fila)));
    }

    function submit(e) {
        e.preventDefault();
        put(route('owner.barberias.turnos.configuracion.horarios.update', { barberia: barbId }));
    }

    return (
        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
            <h3 className="font-display text-lg font-bold text-brand-text">Horario de atención</h3>
            <p className="mt-1 text-sm text-brand-text-secondary">
                Definí el horario general de la barbería para cada día de la semana.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-3">
                {data.horarios.map((fila, index) => (
                    <div
                        key={fila.dia_semana}
                        className="flex flex-col gap-3 rounded-[20px] bg-brand-surface-alt p-4 sm:flex-row sm:items-center sm:gap-4"
                    >
                        <label className="flex min-h-[44px] min-w-[140px] cursor-pointer items-center gap-3">
                            <Checkbox
                                checked={fila.activo}
                                onChange={(e) => updateFila(index, 'activo', e.target.checked)}
                            />
                            <span className="text-sm font-medium text-brand-text">{DIAS[index].label}</span>
                        </label>

                        <div className="flex flex-1 items-center gap-3">
                            <input
                                type="time"
                                value={fila.hora_inicio}
                                disabled={!fila.activo}
                                onChange={(e) => updateFila(index, 'hora_inicio', e.target.value)}
                                className="min-h-[44px] w-full rounded-full border border-brand-border bg-brand-surface px-3 text-sm text-brand-text disabled:opacity-50"
                            />
                            <span className="text-sm text-brand-text-secondary">a</span>
                            <input
                                type="time"
                                value={fila.hora_fin}
                                disabled={!fila.activo}
                                onChange={(e) => updateFila(index, 'hora_fin', e.target.value)}
                                className="min-h-[44px] w-full rounded-full border border-brand-border bg-brand-surface px-3 text-sm text-brand-text disabled:opacity-50"
                            />
                        </div>

                        <InputError message={errors[`horarios.${index}.hora_fin`]} className="sm:basis-full" />
                    </div>
                ))}

                <InputError message={errors.horarios} className="mt-1" />

                <div className="flex justify-end pt-2">
                    <PrimaryButton disabled={processing}>Guardar horarios</PrimaryButton>
                </div>
            </form>
        </section>
    );
}
