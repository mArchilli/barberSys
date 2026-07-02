import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Panel de administración
                </h2>
            }
        >
            <Head title="Administración" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-brand-card">
                        <div className="p-8">
                            <h1 className="text-2xl font-bold text-brand-text">
                                Panel Admin Pelito
                            </h1>
                            <p className="mt-2 text-brand-text-secondary">
                                Sesión iniciada como {auth.user.name} (admin).
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
