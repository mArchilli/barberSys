import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useCallback, useEffect, useRef } from 'react';

const AUTO_START_DELAY = 600;

export default function usePageTour(tourKey, steps, { autoStart = true, delay = AUTO_START_DELAY } = {}) {
    const { tours_seen: toursSeen } = usePage().props;
    const alreadySeen = Boolean(toursSeen?.[tourKey]);
    const driverRef = useRef(null);

    const markSeen = useCallback(() => {
        axios.patch(route('tours.mark-seen', tourKey)).catch(() => {});
    }, [tourKey]);

    const startTour = useCallback(() => {
        driverRef.current?.destroy();

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
            onDestroyed: () => markSeen(),
        });

        driverRef.current = driverObj;
        driverObj.drive();
    }, [steps, markSeen]);

    useEffect(() => {
        if (!autoStart || alreadySeen) {
            return undefined;
        }

        const timer = setTimeout(() => startTour(), delay);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tourKey, alreadySeen, autoStart]);

    useEffect(() => () => driverRef.current?.destroy(), []);

    return { startTour };
}
