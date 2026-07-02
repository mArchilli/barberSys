import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <AdminLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Panel de administración
                </h2>
            }
        >
            <Head title="Administración" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-brand-lg border border-brand-border bg-brand-surface shadow-brand-card">
                        <div className="p-8">
                            <h1 className="text-2xl font-bold text-brand-text">
                                Panel Admin Pelito
                            </h1>
                            <p className="mt-2 text-brand-text-secondary">
                                Sesión iniciada como {auth.user.name} (admin).
                            </p>
                        </div>
                    </div>

                    <Link
                        href={route('admin.owners.index')}
                        className="flex items-center justify-between rounded-brand-lg border border-brand-border bg-brand-surface p-6 shadow-brand-card transition hover:border-brand-primary hover:shadow-brand-card-hover"
                    >
                        <div>
                            <h3 className="text-lg font-semibold text-brand-text">Owners</h3>
                            <p className="mt-1 text-sm text-brand-text-secondary">
                                Ver todos los owners, sus barberías y el estado de sus suscripciones.
                            </p>
                        </div>
                        <span className="text-sm font-medium text-brand-primary">Ir →</span>
                    </Link>
                </div>
            </div>
        </AdminLayout>
    );
}
