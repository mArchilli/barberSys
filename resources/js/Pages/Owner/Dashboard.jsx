import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { auth, currentBarberia } = usePage().props;

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
                    <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-card">
                        <div className="p-8">
                            <h1 className="text-2xl font-bold text-brand-text">
                                Bienvenido, {auth.user.name}
                            </h1>
                            {currentBarberia && (
                                <p className="mt-2 text-brand-text-secondary">
                                    Estás gestionando{' '}
                                    <span className="font-semibold text-brand-text">
                                        {currentBarberia.name}
                                    </span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
