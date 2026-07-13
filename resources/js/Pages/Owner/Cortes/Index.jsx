import RegistroCorteForm from '@/Components/Cortes/RegistroCorteForm';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Index({ servicios, mediosPago, cortesHoy, routes }) {
    return (
        <AuthenticatedLayout
            headerClassName="bg-brand-bg"
            headerContainerClassName="mx-auto max-w-[1720px] px-2 py-4 sm:px-3 sm:py-5 lg:px-4"
            header={(
                <div>
                    <h2 className="font-display text-3xl font-bold tracking-[-0.04em] text-brand-text sm:text-4xl">
                        Cargar corte
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm text-brand-text-secondary">
                        Carga el cliente, el servicio y los medios de pago
                    </p>
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
