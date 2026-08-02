import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { router, useForm } from '@inertiajs/react';
import { IconTrash } from '@tabler/icons-react';

function formatFecha(fecha) {
    return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

export default function ExcepcionesCard({ excepciones, barbId }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        date: '',
        enabled: true,
    });

    function submit(e) {
        e.preventDefault();
        post(route('owner.barberias.turnos.configuracion.excepciones.store', { barberia: barbId }), {
            onSuccess: () => reset('date'),
        });
    }

    function handleDelete(excepcion) {
        if (! confirm(`¿Eliminar la excepción del ${formatFecha(excepcion.date)}? Ese día vuelve a valer la configuración general.`)) {
            return;
        }

        router.delete(route('owner.barberias.turnos.configuracion.excepciones.destroy', {
            barberia: barbId,
            excepcion: excepcion.id,
        }));
    }

    return (
        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
            <h3 className="font-display text-lg font-bold text-brand-text">Excepciones puntuales</h3>
            <p className="mt-1 text-sm text-brand-text-secondary">
                Anulá el horario general para una fecha específica: cerrar un día habilitado, o abrir uno cerrado.
            </p>

            <form onSubmit={submit} className="mt-6 flex flex-col gap-4 rounded-[20px] bg-brand-surface-alt p-4 sm:flex-row sm:items-end">
                <div className="flex-1">
                    <InputLabel htmlFor="excepcion-date" value="Fecha" />
                    <TextInput
                        id="excepcion-date"
                        type="date"
                        value={data.date}
                        onChange={(e) => setData('date', e.target.value)}
                        className="mt-2 block min-h-[48px] w-full rounded-full border-brand-border bg-brand-surface px-4 text-sm"
                    />
                    <InputError message={errors.date} className="mt-1" />
                </div>

                <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
                    <Checkbox checked={data.enabled} onChange={(e) => setData('enabled', e.target.checked)} />
                    <span className="text-sm font-medium text-brand-text">Habilitar turnos ese día</span>
                </label>

                <PrimaryButton disabled={processing} className="justify-center">
                    Agregar
                </PrimaryButton>
            </form>

            <div className="mt-6 space-y-2">
                {excepciones.length === 0 ? (
                    <p className="text-sm text-brand-text-secondary">Todavía no cargaste excepciones puntuales.</p>
                ) : (
                    excepciones.map((excepcion) => (
                        <div
                            key={excepcion.id}
                            className="flex items-center justify-between gap-3 rounded-[18px] bg-brand-surface-alt px-4 py-3"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-brand-text">{formatFecha(excepcion.date)}</span>
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                        excepcion.enabled
                                            ? 'bg-brand-primary text-brand-on-primary'
                                            : 'bg-brand-border text-brand-text-secondary'
                                    }`}
                                >
                                    {excepcion.enabled ? 'Habilitado' : 'Deshabilitado'}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleDelete(excepcion)}
                                aria-label={`Eliminar excepción del ${formatFecha(excepcion.date)}`}
                                title="Eliminar"
                                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-danger/20 bg-brand-danger/5 text-brand-danger transition hover:bg-brand-danger/10"
                            >
                                <IconTrash size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
