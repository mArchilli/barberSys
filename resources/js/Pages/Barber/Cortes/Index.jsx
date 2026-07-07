import RegistroCorteForm from '@/Components/Cortes/RegistroCorteForm';
import BarberLayout from '@/Layouts/BarberLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ servicios, mediosPago, cortesHoy, routes }) {
    return (
        <BarberLayout>
            <Head title="Cargar corte" />

            <div className="mx-auto max-w-4xl space-y-6 px-4 pt-8 sm:px-6">
                <div>
                    <h1 className="font-display text-2xl font-bold text-brand-text">Cargar corte</h1>
                    <Link
                        href={route('barber.dashboard')}
                        className="text-sm font-medium text-brand-text-secondary hover:text-brand-text"
                    >
                        ← Volver al dashboard
                    </Link>
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
