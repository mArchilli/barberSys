import { IconAlertCircle, IconBan, IconBrandWhatsapp, IconCheck, IconClock, IconUserOff } from '@tabler/icons-react';
import { useState } from 'react';

const STATUS_META = {
    pendiente: { label: 'Pendiente', className: 'bg-brand-warning-soft text-brand-warning' },
    confirmado: { label: 'Confirmado', className: 'bg-brand-primary-soft text-brand-primary-soft-text' },
    completado: { label: 'Completado', className: 'bg-brand-success-soft text-brand-success' },
    cancelado: { label: 'Cancelado', className: 'bg-brand-border text-brand-text-secondary' },
    no_show: { label: 'No asistió', className: 'bg-brand-danger/10 text-brand-danger' },
    expirado: { label: 'Expirado', className: 'bg-brand-border text-brand-text-secondary' },
};

// Compartido entre el calendario del owner y la agenda del barbero: quien lo
// usa decide si muestra el barbero (showBarbero) y qué hace onStatusChange
// (axios +, si corresponde, la redirección a carga de corte al completar).
//
// Confirmar un pendiente es una acción aparte, con su propio endpoint (ver
// Owner\TurnoController::confirmar): el owner la ejecuta pasando onConfirm;
// el barbero no puede confirmar, solo avisarle al dueño por WhatsApp, así
// que en su vista se pasa confirmarWhatsappHref en vez de onConfirm.
export default function TurnoListItem({ turno, showBarbero = false, onStatusChange, onConfirm, confirmarWhatsappHref }) {
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const esPendiente = turno.status === 'pendiente';
    const puedeModificar = esPendiente || turno.status === 'confirmado';
    const meta = STATUS_META[turno.status] ?? STATUS_META.confirmado;

    async function handle(status) {
        if (processing) return;
        setProcessing(true);
        setError(null);

        try {
            await onStatusChange(turno, status);
        } catch (err) {
            setError(err?.response?.data?.message || 'No se pudo actualizar el turno.');
        } finally {
            setProcessing(false);
        }
    }

    async function handleConfirmar() {
        if (processing) return;
        setProcessing(true);
        setError(null);

        try {
            await onConfirm(turno);
        } catch (err) {
            setError(err?.response?.data?.message || 'No se pudo confirmar el turno.');
        } finally {
            setProcessing(false);
        }
    }

    return (
        <article
            className={`rounded-[22px] border bg-brand-surface px-4 py-4 shadow-sm sm:px-5 ${
                esPendiente ? 'border-brand-warning/40 ring-1 ring-brand-warning/30' : 'border-brand-border'
            }`}
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-12 w-16 shrink-0 flex-col items-center justify-center rounded-[16px] bg-brand-surface-alt text-center">
                        <span className="text-sm font-bold text-brand-text">{turno.hora_inicio}</span>
                        <span className="text-[11px] text-brand-text-secondary">{turno.hora_fin}</span>
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-brand-text">{turno.cliente_nombre}</p>
                        <p className="mt-0.5 truncate text-xs text-brand-text-secondary">
                            {turno.servicio?.name ?? 'Servicio eliminado'}
                            {showBarbero && turno.barbero && ` · ${turno.barbero.name}`}
                        </p>
                        {turno.cliente_telefono && (
                            <p className="mt-0.5 text-xs text-brand-text-secondary">{turno.cliente_telefono}</p>
                        )}
                    </div>
                </div>

                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}>
                    {meta.label}
                </span>
            </div>

            {error && (
                <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-brand-danger">
                    <IconAlertCircle size={14} /> {error}
                </p>
            )}

            {esPendiente && (onConfirm || confirmarWhatsappHref) && (
                <div className="mt-4 border-t border-brand-border-subtle pt-4">
                    {onConfirm ? (
                        <button
                            type="button"
                            disabled={processing}
                            onClick={handleConfirmar}
                            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full bg-brand-warning px-4 text-xs font-semibold text-brand-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <IconCheck size={15} /> Confirmar turno
                        </button>
                    ) : confirmarWhatsappHref(turno) ? (
                        <a
                            href={confirmarWhatsappHref(turno)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full bg-brand-warning px-4 text-xs font-semibold text-brand-on-primary transition hover:opacity-90"
                        >
                            <IconBrandWhatsapp size={15} /> Avisar al dueño
                        </a>
                    ) : (
                        <span className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-brand-border bg-brand-surface-alt px-4 text-xs font-semibold text-brand-text-secondary">
                            <IconClock size={15} /> Pendiente de confirmación
                        </span>
                    )}
                </div>
            )}

            {puedeModificar && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-brand-border-subtle pt-4">
                    <button
                        type="button"
                        disabled={processing}
                        onClick={() => handle('completado')}
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full bg-brand-primary px-4 text-xs font-semibold text-brand-on-primary transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <IconCheck size={15} /> Completar
                    </button>
                    <button
                        type="button"
                        disabled={processing}
                        onClick={() => handle('no_show')}
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-brand-border bg-brand-surface-alt px-4 text-xs font-semibold text-brand-text-secondary transition hover:bg-brand-primary/5 hover:text-brand-text disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <IconUserOff size={15} /> No asistió
                    </button>
                    <button
                        type="button"
                        disabled={processing}
                        onClick={() => handle('cancelado')}
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-full border border-brand-danger/20 bg-brand-danger/5 px-4 text-xs font-semibold text-brand-danger transition hover:bg-brand-danger/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <IconBan size={15} /> Cancelar
                    </button>
                </div>
            )}
        </article>
    );
}
