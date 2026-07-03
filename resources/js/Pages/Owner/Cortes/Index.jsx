import RegistroCorteForm from '@/Components/Cortes/RegistroCorteForm';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Index({ servicios, mediosPago, cortesHoy, routes }) {
    const { currentBarberia } = usePage().props;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                    <h2 className="text-2xl font-bold leading-tight text-brand-text sm:text-xl sm:font-semibold">
                        Cargar corte
                    </h2>
                    <Link
                        href={route('owner.barberias.dashboard', { barberia: currentBarberia.id })}
                        className="inline-flex min-h-[44px] items-center gap-1 text-sm font-medium text-brand-text-secondary hover:text-brand-text"
                    >
                        ← Volver al dashboard
                    </Link>
                </div>
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
