import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useCallback, useEffect, useRef } from 'react';
import { markTourActive, markTourInactive } from './tourActivity';

const AUTO_START_DELAY = 600;

export default function usePageTour(tourKey, steps, { autoStart = true, delay = AUTO_START_DELAY } = {}) {
    const { tours_seen: toursSeen } = usePage().props;
    const alreadySeen = Boolean(toursSeen?.[tourKey]);
    const driverRef = useRef(null);
    // Idempotente por instancia: evita que dos llamadas seguidas a la misma
    // transición (ej. cleanup del efecto + onDestroyed) descuenten dos veces
    // el contador compartido de tourActivity.
    const isActiveRef = useRef(false);

    const setShared = useCallback((active) => {
        if (isActiveRef.current === active) {
            return;
        }

        isActiveRef.current = active;
        (active ? markTourActive : markTourInactive)();
    }, []);

    const markSeen = useCallback(() => {
        axios.patch(route('tours.mark-seen', tourKey)).catch(() => {});
    }, [tourKey]);

    const startTour = useCallback(() => {
        driverRef.current?.destroy();
        setShared(true);

        const driverObj = driver({
            showProgress: true,
            allowClose: true,
            skipMissingElement: true,
            smoothScroll: true,
            overlayColor: 'rgb(29, 34, 33)',
            overlayOpacity: 0.72,
            nextBtnText: 'Siguiente',
            prevBtnText: 'Anterior',
            doneBtnText: 'Listo',
            progressText: '{{current}} de {{total}}',
            popoverClass: 'pelito-tour-popover',
            steps,
            // El botón de cierre de driver.js no tiene una prop de texto propia
            // (es un "×" fijo): este es el hook documentado para reescribirlo.
            onPopoverRender: (popoverDom) => {
                popoverDom.closeButton.innerHTML = 'Saltar tutorial';
                popoverDom.closeButton.setAttribute('aria-label', 'Saltar tutorial');
            },
            // destroy() se llama tanto al completar el último paso como al
            // cerrar/saltear el tour, así que este único hook cubre ambos casos.
            onDestroyed: () => {
                markSeen();
                setShared(false);
            },
        });

        driverRef.current = driverObj;
        driverObj.drive();
    }, [steps, markSeen, setShared]);

    useEffect(() => {
        if (!autoStart || alreadySeen) {
            return undefined;
        }

        // Se marca activo ya acá (no recién dentro del setTimeout) para que
        // cualquier UI que se coordine contra tourActivity (ej. SurveyModal)
        // espere desde el momento en que el tour QUEDÓ programado, sin una
        // ventana donde ambos compitan por atención durante el delay.
        setShared(true);
        const timer = setTimeout(() => startTour(), delay);

        return () => {
            clearTimeout(timer);
            setShared(false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tourKey, alreadySeen, autoStart]);

    useEffect(() => () => {
        driverRef.current?.destroy();
        setShared(false);
    }, []);

    return { startTour };
}
