import { Link, usePage } from '@inertiajs/react';
import { IconClockHour4, IconAlertTriangle } from '@tabler/icons-react';

/**
 * Aviso de período de prueba con dos escalas de urgencia:
 * - Más de 5 días restantes: banner informativo simple, sin botón.
 * - 5 días o menos: tono de urgencia + botón de activación del débito.
 * No se muestra si el owner ya autorizó el débito automático.
 */
export default function TrialBanner() {
    const { ownerSubscription } = usePage().props;

    if (
        !ownerSubscription ||
        ownerSubscription.status !== 'trial' ||
        ownerSubscription.has_preapproval ||
        ownerSubscription.trial_days_left === null
    ) {
        return null;
    }

    const days = ownerSubscription.trial_days_left;
    const urgent = days <= 5;

    const message =
        days === 0
            ? 'Tu período de prueba termina hoy.'
            : days === 1
              ? 'Tu período de prueba termina mañana.'
              : `Estás en el período de prueba: te quedan ${days} días.`;

    if (!urgent) {
        return (
            <div className="mt-3 flex min-h-[44px] items-center gap-2.5 rounded-brand-md bg-brand-primary-soft px-4 py-3 text-sm font-medium text-brand-primary-soft-text">
                <IconClockHour4 size={18} stroke={2} className="shrink-0" />
                <span>{message}</span>
            </div>
        );
    }

    return (
        <div className="mt-3 flex flex-col gap-3 rounded-brand-md bg-brand-warning-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5 text-sm font-medium text-brand-text">
                <IconAlertTriangle size={18} stroke={2} className="shrink-0 text-brand-warning" />
                <span>
                    {message} Activá el débito automático para seguir usando Pelito sin cortes.
                </span>
            </div>
            <Link
                href={route('owner.suscripcion.index')}
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-brand-pill bg-brand-primary px-5 py-2 text-sm font-semibold text-brand-on-primary shadow-brand-cta transition hover:bg-brand-primary-hover"
            >
                Activar suscripción
            </Link>
        </div>
    );
}
