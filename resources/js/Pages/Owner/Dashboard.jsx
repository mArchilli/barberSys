import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Dashboard({ barberia }) {
    const { auth } = usePage().props;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-8">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Bienvenido a BarberSys, {auth.user.name}
                            </h1>

                            {barberia ? (
                                <p className="mt-2 text-gray-600">
                                    Estás gestionando{' '}
                                    <span className="font-semibold text-gray-800">
                                        {barberia.name}
                                    </span>
                                </p>
                            ) : (
                                <p className="mt-2 text-gray-500">
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
