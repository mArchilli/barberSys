// Estado compartido y reactivo de "hay un tour de driver.js activo/por
// arrancar en este momento" — usePageTour() lo marca activo desde que decide
// que va a auto-iniciar un tour (incluso durante el delay previo al primer
// paso), y lo libera cuando el tour se cierra o se saltea. Cualquier UI que no
// deba competir por atención con un tour (ej. SurveyModal) se suscribe con
// useSyncExternalStore en vez de adivinar con timers propios.

let activeCount = 0;
const listeners = new Set();

function notify() {
    listeners.forEach((listener) => listener());
}

export function markTourActive() {
    activeCount += 1;
    notify();
}

export function markTourInactive() {
    activeCount = Math.max(0, activeCount - 1);
    notify();
}

export function isTourActive() {
    return activeCount > 0;
}

export function subscribeTourActivity(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
