import RegistroCorteForm from '@/Components/Cortes/RegistroCorteForm';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Index({ servicios, mediosPago, cortesHoy, routes }) {
    const { currentBarberia } = usePage().props;

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
                            Registra cada corte con su cliente, servicio y medio de pago para mantener la facturacion del dia siempre al dia.
                        </p>
                    </div>

                    <Link
                        href={route('owner.barberias.dashboard', { barberia: currentBarberia.id })}
                        className="inline-flex min-h-[44px] items-center gap-2 text-sm font-medium text-brand-text-secondary transition hover:text-brand-text"
                    >
                        Volver al dashboard
                    </Link>
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
