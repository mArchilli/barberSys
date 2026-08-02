import DaySelector from '@/Components/DaySelector';
import SugerenciaClienteModal from '@/Components/Turnos/SugerenciaClienteModal';
import TurnoListItem from '@/Components/Turnos/TurnoListItem';
import useTurnoCompletion from '@/Hooks/useTurnoCompletion';
import BarberLayout from '@/Layouts/BarberLayout';
import { Head, router } from '@inertiajs/react';

// El barbero no puede confirmar un turno pendiente (acción exclusiva del
// owner, ver Owner\TurnoController::confirmar): en vez de eso, "Confirmar
// turno" le abre WhatsApp con un mensaje precargado para avisarle al dueño.
function buildAvisoWhatsappHref(whatsappNumber, dia, turno) {
    if (!whatsappNumber) return null;

    const mensaje = `Hola! Tengo un turno pendiente de confirmar: ${turno.cliente_nombre} el ${dia} a las ${turno.hora_inicio}` +
        (turno.servicio ? ` (${turno.servicio.name})` : '') +
        '. ¿Lo confirmás?';

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`;
}

export default function Index({ turnos, dia, esHoy, whatsappNumber }) {
    const indexUrl = route('barber.turnos.index');

    const { onStatusChange, sugerencia, confirmarSugerencia } = useTurnoCompletion({
        buildUpdateUrl: (turno) => route('barber.turnos.update', turno.id),
        cortesIndexUrl: route('barber.cortes.index'),
        onRefresh: () => router.reload({ only: ['turnos'], preserveScroll: true }),
    });

    return (
        <BarberLayout
            header={(
                <div>
                    <h1 className="font-display text-2xl font-bold text-brand-text">Mis turnos</h1>
                    <p className="mt-1 text-sm text-brand-text-secondary">
                        Tu agenda del día. Marcá cada turno a medida que lo completás.
                    </p>
                </div>
            )}
        >
            <Head title="Mis turnos" />

            <div className="mx-auto max-w-3xl space-y-5 px-4 sm:px-6">
                <DaySelector date={dia} esHoy={esHoy} url={indexUrl} onDark={false} fullWidth />

                {turnos.length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-brand-border bg-brand-surface-alt p-8 text-center">
                        <p className="text-sm font-medium text-brand-text">Sin turnos para este día</p>
                        <p className="mt-2 text-sm text-brand-text-secondary">
                            Los turnos que te asignen por WhatsApp o teléfono van a aparecer acá.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {turnos.map((turno) => (
                            <TurnoListItem
                                key={turno.id}
                                turno={turno}
                                onStatusChange={onStatusChange}
                                confirmarWhatsappHref={(t) => buildAvisoWhatsappHref(whatsappNumber, dia, t)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <SugerenciaClienteModal sugerencia={sugerencia} onConfirm={confirmarSugerencia} />
        </BarberLayout>
    );
}
