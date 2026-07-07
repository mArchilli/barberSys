import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BarberLayout from '@/Layouts/BarberLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const isBarber = auth.user.role === 'barber';
    const Layout = isBarber ? BarberLayout : AuthenticatedLayout;

    return (
        <Layout
            header={
                <h2 className="text-xl font-semibold leading-tight text-brand-text">
                    Mi perfil
                </h2>
            }
        >
            <Head title="Mi perfil" />

            <div className="py-6 sm:py-12">
                <div className="mx-auto max-w-2xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-brand-card">
                        <div className="p-6 sm:p-8">
                            <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-brand-card">
                        <div className="p-6 sm:p-8">
                            <UpdatePasswordForm />
                        </div>
                    </div>

                    {!isBarber && (
                        <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-brand-card">
                            <div className="p-6 sm:p-8">
                                <DeleteUserForm />
                            </div>
                        </div>
                    )}

                    {isBarber && (
                        <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface shadow-brand-card">
                            <div className="p-6 sm:p-8">
                                <h2 className="font-display text-lg font-bold text-brand-text">Cerrar sesión</h2>
                                <p className="mt-1 text-sm text-brand-text-secondary">
                                    Vas a salir de tu cuenta en este dispositivo.
                                </p>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-brand-pill border border-brand-border px-5 text-sm font-semibold text-brand-text transition hover:bg-brand-surface-alt"
                                >
                                    Cerrar sesión
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
