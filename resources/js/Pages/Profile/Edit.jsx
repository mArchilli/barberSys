import AdminLayout from '@/Layouts/AdminLayout';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BarberLayout from '@/Layouts/BarberLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { IconLock, IconMail, IconUserCircle } from '@tabler/icons-react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

function MetricTile({ label, value }) {
    return (
        <div className="rounded-[22px] bg-brand-surface-alt px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                {label}
            </p>
            <p className="mt-2 text-lg font-bold text-brand-text">
                {value}
            </p>
        </div>
    );
}

function roleLabel(role) {
    if (role === 'owner') return 'Owner';
    if (role === 'admin') return 'Administrador';
    if (role === 'barber') return 'Barbero';

    return role;
}

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const isBarber = user.role === 'barber';
    const isAdmin = user.role === 'admin';
    const Layout = isBarber ? BarberLayout : isAdmin ? AdminLayout : AuthenticatedLayout;
    const isVerified = !mustVerifyEmail || user.email_verified_at !== null;

    return (
        <Layout
            headerClassName="bg-brand-bg"
            headerContainerClassName="mx-auto max-w-[1720px] px-2 py-4 sm:px-3 sm:py-5 lg:px-4"
            header={(
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-medium text-brand-text-secondary">
                            Cuenta y seguridad
                        </p>
                        <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] text-brand-text sm:text-4xl">
                            Mi perfil
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm text-brand-text-secondary">
                            Actualiza tus datos, refuerza la seguridad de tu cuenta y administra el acceso desde un solo lugar.
                        </p>
                    </div>
                </div>
            )}
        >
            <Head title="Mi perfil" />

            <div className="pb-12">
                <div className="mx-auto max-w-[1720px] space-y-8 px-2 pt-6 sm:px-3 sm:pt-8 lg:px-4">
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex min-w-0 items-start gap-4">
                                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-brand-primary/12 text-brand-primary shadow-sm">
                                        <IconUserCircle size={30} stroke={1.8} />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-brand-text-secondary">
                                            Perfil activo
                                        </p>
                                        <p className="mt-3 truncate font-display text-4xl font-extrabold tracking-[-0.04em] text-brand-text sm:text-[3.25rem]">
                                            {user.name}
                                        </p>
                                        <p className="mt-2 text-sm text-brand-text-secondary">
                                            Revisa tu informacion personal y manten actualizados tus datos de acceso.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                <MetricTile label="Rol" value={roleLabel(user.role)} />
                                <MetricTile label="Email" value={user.email} />
                                <MetricTile label="Estado" value={isVerified ? 'Verificado' : 'Pendiente'} />
                            </div>
                        </section>

                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-medium text-brand-text-secondary">
                                        Seguridad de acceso
                                    </p>
                                    <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-brand-text">
                                        Estado de la cuenta
                                    </h3>
                                    <p className="mt-2 text-xs text-brand-text-secondary">
                                        Usa esta seccion para confirmar el email, cambiar la contrasena o cerrar sesion desde este dispositivo.
                                    </p>
                                </div>
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/12 text-brand-link shadow-sm">
                                    <IconLock size={22} stroke={1.8} />
                                </span>
                            </div>

                            <div className="mt-6 grid gap-3">
                                <div className="rounded-[22px] bg-brand-surface-alt px-4 py-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                        Verificacion
                                    </p>
                                    <p className={`mt-2 text-lg font-bold ${isVerified ? 'text-brand-success' : 'text-brand-danger'}`}>
                                        {isVerified ? 'Email confirmado' : 'Email pendiente'}
                                    </p>
                                </div>

                                <div className="rounded-[22px] bg-brand-surface-alt px-4 py-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-text-secondary">
                                        Cuenta actual
                                    </p>
                                    <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-brand-text">
                                        <IconMail size={16} stroke={1.8} />
                                        {user.email}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <UpdateProfileInformationForm mustVerifyEmail={mustVerifyEmail} status={status} />
                        </section>

                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <UpdatePasswordForm />
                        </section>
                    </div>

                    {!isBarber && (
                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <DeleteUserForm />
                        </section>
                    )}

                    {isBarber && (
                        <section className="rounded-[28px] border border-brand-border bg-brand-surface p-6 shadow-brand-card sm:p-7">
                            <h2 className="font-display text-xl font-bold text-brand-text">
                                Cerrar sesion
                            </h2>
                            <p className="mt-2 max-w-2xl text-sm text-brand-text-secondary">
                                Vas a salir de tu cuenta en este dispositivo y podras volver a entrar cuando lo necesites.
                            </p>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="mt-5 inline-flex min-h-[46px] items-center justify-center rounded-full border border-brand-border bg-brand-surface-alt px-5 text-sm font-semibold text-brand-text transition hover:border-brand-primary/20 hover:bg-brand-primary/5 hover:text-brand-link"
                            >
                                Cerrar sesion
                            </Link>
                        </section>
                    )}
                </div>
            </div>
        </Layout>
    );
}
