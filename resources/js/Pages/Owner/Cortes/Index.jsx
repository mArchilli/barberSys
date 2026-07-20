import RegistroCorteForm from '@/Components/Cortes/RegistroCorteForm';
import TourRestartButton from '@/Components/TourRestartButton';
import usePageTour from '@/Hooks/usePageTour';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

const CORTES_TOUR_STEPS = [
    {
        element: '[data-tour="barber-cortes-cliente"]',
        popover: {
            title: 'Cliente',
            description: 'Busca un cliente ya cargado o escribi un nombre nuevo: se crea solo al guardar el corte.',
        },
    },
    {
        element: '[data-tour="barber-cortes-servicio"]',
        popover: {
            title: 'Servicio',
            description: 'El precio se autocompleta con el del servicio elegido, pero podes ajustarlo antes de guardar.',
        },
    },
    {
        element: '[data-tour="barber-cortes-medio"]',
        popover: {
            title: 'Medio de pago',
            description: 'Registra como cobro ese corte.',
        },
    },
    {
        element: '[data-tour="barber-cortes-progreso"]',
        popover: {
            title: 'Resumen del dia',
            description: 'Cuantos cortes se cargaron hoy en esta barberia y el total facturado.',
        },
    },
    {
        element: '[data-tour="barber-cortes-progreso"]',
        popover: {
            title: 'Se refleja en tu Dashboard',
            description: 'Todo lo que cargues aca impacta al toque en el Dashboard de esta barberia: facturacion, neto y ranking de barberos.',
        },
    },
    {
        element: '[data-tour="barber-cortes-lista"]',
        popover: {
            title: 'Cortes de hoy',
            description: 'El detalle de cada corte cargado en el dia, para revisar rapido sin salir de esta pantalla.',
        },
    },
];

export default function Index({ servicios, mediosPago, cortesHoy, routes }) {
    const { startTour } = usePageTour('owner_cortes', CORTES_TOUR_STEPS);

    return (
        <AuthenticatedLayout
            headerClassName="bg-brand-bg"
            headerContainerClassName="mx-auto max-w-[1720px] px-2 py-4 sm:px-3 sm:py-5 lg:px-4"
            header={(
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h2 className="font-display text-3xl font-bold tracking-[-0.04em] text-brand-text sm:text-4xl">
                            Cargar corte
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-brand-text-secondary">
                            Carga el cliente, el servicio y los medios de pago
                        </p>
                    </div>

                    <TourRestartButton onClick={startTour} />
                </div>
            )}
        >
            <Head title="Cargar corte" />

            <div className="pb-12">
                <div className="mx-auto max-w-[1720px] space-y-8 px-2 sm:px-3 lg:px-4">
                    <RegistroCorteForm
                        servicios={servicios}
                        mediosPago={mediosPago}
                        cortesHoy={cortesHoy}
                        routes={routes}
                        variant="owner"
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
