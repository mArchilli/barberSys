import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Dashboard({ barberia }) {
    const { auth } = usePage().props;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-brand-surface shadow-sm sm:rounded-lg">
                        <div className="p-8">
                            <h1 className="text-2xl font-bold text-brand-text">
                                Bienvenido a BarberSys, {auth.user.name}
                            </h1>

                            {barberia ? (
                                <p className="mt-2 text-brand-text-secondary">
                                    Estás gestionando{' '}
                                    <span className="font-semibold text-brand-text">
                                        {barberia.name}
                                    </span>
                                </p>
                            ) : (
                                <p className="mt-2 text-brand-text-secondary">
                                    No tenés barberías activas cargadas.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
