import RegistroCorteForm from '@/Components/Cortes/RegistroCorteForm';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Index({ servicios, mediosPago, cortesHoy, routes }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Cargar corte
                </h2>
            }
        >
            <Head title="Cargar corte" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <RegistroCorteForm
                        servicios={servicios}
                        mediosPago={mediosPago}
                        cortesHoy={cortesHoy}
                        routes={routes}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
