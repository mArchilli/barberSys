import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ barberias }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Mis barberías
                </h2>
            }
        >
            <Head title="Mis barberías" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {barberias.length === 0 ? (
                        <div className="rounded-xl border border-brand-border bg-brand-surface p-8 text-center text-brand-text-secondary shadow-card">
                            No tenés barberías activas cargadas.
                        </div>
                    ) : (
                        <>
                            <p className="mb-4 text-sm text-brand-text-secondary">
                                Seleccioná la barbería que querés gestionar.
                            </p>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {barberias.map((barberia) => (
                                    <Link
                                        key={barberia.id}
                                        href={route('owner.barberias.dashboard', barberia.id)}
                                        className="group flex flex-col gap-1 rounded-xl border border-brand-border bg-brand-surface p-6 shadow-card transition hover:border-brand-primary hover:shadow-md"
                                    >
                                        <h3 className="text-lg font-semibold text-brand-text group-hover:text-brand-primary transition">
                                            {barberia.name}
                                        </h3>
                                        {barberia.address && (
                                            <p className="text-sm text-brand-text-secondary">{barberia.address}</p>
                                        )}
                                        <span className="mt-3 text-sm font-medium text-brand-primary">
                                            Gestionar →
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
