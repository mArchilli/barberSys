import RegistroCorteForm from '@/Components/Cortes/RegistroCorteForm';
import TourRestartButton from '@/Components/TourRestartButton';
import usePageTour from '@/Hooks/usePageTour';
import BarberLayout from '@/Layouts/BarberLayout';
import { Head, Link } from '@inertiajs/react';

const CORTES_TOUR_STEPS = [
    {
        element: '[data-tour="barber-cortes-cliente"]',
        popover: {
            title: 'Buscá al cliente',
            description: 'Escribí el nombre. Si ya existe lo elegís de la lista, y si no, se crea solo al guardar el corte.',
        },
    },
    {
        element: '[data-tour="barber-cortes-servicio"]',
        popover: {
            title: 'Elegí el servicio',
            description: 'El precio se autocompleta con el del servicio, pero podés editarlo antes de guardar.',
        },
    },
    {
        element: '[data-tour="barber-cortes-medio"]',
        popover: {
            title: 'Medio de pago',
            description: 'Elegí cómo te pagó el cliente.',
        },
    },
    {
        element: '[data-tour="barber-cortes-progreso"]',
        popover: {
            title: 'Tu progreso del día',
            description: 'Cuántos cortes cargaste hoy y cuánto facturaste en total.',
        },
    },
    {
        element: '[data-tour="barber-cortes-lista"]',
        popover: {
            title: 'Cortes de hoy',
            description: 'Cada corte que cargues en el día aparece acá al toque.',
        },
    },
];

export default function Index({ servicios, mediosPago, cortesHoy, routes }) {
    const { startTour } = usePageTour('barber_cortes', CORTES_TOUR_STEPS);

    return (
        <BarberLayout>
            <Head title="Cargar corte" />

            <div className="mx-auto max-w-4xl space-y-6 px-4 pt-8 sm:px-6">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h1 className="font-display text-2xl font-bold text-brand-text">Cargar corte</h1>
                        <Link
                            href={route('barber.dashboard')}
                            className="text-sm font-medium text-brand-text-secondary hover:text-brand-text"
                        >
                            ← Volver al dashboard
                        </Link>
                    </div>
                    <TourRestartButton onClick={startTour} />
                </div>

                <RegistroCorteForm
                    servicios={servicios}
                    mediosPago={mediosPago}
                    cortesHoy={cortesHoy}
                    routes={routes}
                />
            </div>
        </BarberLayout>
    );
}
